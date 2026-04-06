import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { checkoutSchema } from "@/lib/validation";
import {
  createPaymentPreference,
  MercadoPagoConfigurationError,
} from "@/lib/mercadopago";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { getProductUnitPrice } from "@/data/products";

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Faça login para continuar." },
        { status: 401 },
      );
    }

    const body = await request.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { addressId, shippingMethod, shippingPrice, couponCode, items } =
      parsed.data;

    // Verify address belongs to user
    const address = await prisma.address.findFirst({
      where: { id: addressId, userId: user.id },
    });
    if (!address) {
      return NextResponse.json(
        { error: "Endereço inválido." },
        { status: 400 },
      );
    }

    // Fetch products and validate.
    // Accept cart identifiers as either DB id (cuid) or slug (legacy/static catalog).
    const itemIdentifiers = [...new Set(items.map((i) => i.productId))];
    const products = await prisma.product.findMany({
      where: {
        active: true,
        OR: [
          { id: { in: itemIdentifiers } },
          { slug: { in: itemIdentifiers } },
        ],
      },
    });

    const productByIdentifier = new Map<string, (typeof products)[number]>();
    for (const product of products) {
      productByIdentifier.set(product.id, product);
      productByIdentifier.set(product.slug, product);
    }

    const normalizedItems = items.map((item) => {
      const product = productByIdentifier.get(item.productId);
      if (!product) return null;

      return {
        quantity: item.quantity,
        product,
      };
    });

    if (normalizedItems.some((item) => item === null)) {
      return NextResponse.json(
        { error: "Um ou mais produtos não estão disponíveis." },
        { status: 400 },
      );
    }

    const validItems = normalizedItems.filter(
      (
        item,
      ): item is { quantity: number; product: (typeof products)[number] } =>
        item !== null,
    );

    // Calculate totals server-side (never trust client)
    const totalQuantity = validItems.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = validItems.reduce(
      (sum, item) =>
        sum + item.quantity * getProductUnitPrice(item.product, totalQuantity),
      0,
    );

    // Validate coupon
    let discount = 0;
    let couponId: string | null = null;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase(), active: true },
      });

      if (coupon && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
        if (!coupon.maxUses || coupon.usedCount < coupon.maxUses) {
          if (totalQuantity >= coupon.minItems && subtotal >= coupon.minValue) {
            if (coupon.type === "PERCENT") {
              discount = (subtotal * coupon.value) / 100;
            } else {
              discount = Math.min(coupon.value, subtotal);
            }
            couponId = coupon.id;
          }
        }
      }
    }

    discount = Math.round(discount * 100) / 100;
    const shipping = Math.round(shippingPrice * 100) / 100;
    const total = Math.round((subtotal + shipping - discount) * 100) / 100;

    if (total <= 0) {
      return NextResponse.json(
        { error: "Total do pedido inválido." },
        { status: 400 },
      );
    }

    let order;
    try {
      order = await prisma.$transaction(async (tx) => {
        for (const item of validItems) {
          const stockUpdate = await tx.product.updateMany({
            where: {
              id: item.product.id,
              active: true,
              stockQuantity: { gte: item.quantity },
            },
            data: {
              stockQuantity: { decrement: item.quantity },
            },
          });

          if (stockUpdate.count === 0) {
            throw new Error(
              `OUT_OF_STOCK:${item.product.shortName || item.product.name}`,
            );
          }
        }

        return tx.order.create({
          data: {
            userId: user.id,
            addressId,
            subtotal,
            shipping,
            discount,
            total,
            couponId,
            shippingMethod,
            addressSnapshot: {
              street: address.street,
              number: address.number,
              complement: address.complement,
              neighborhood: address.neighborhood,
              city: address.city,
              state: address.state,
              cep: address.cep,
            },
            items: {
              create: validItems.map((item) => ({
                productId: item.product.id,
                quantity: item.quantity,
                unitPrice: getProductUnitPrice(item.product, totalQuantity),
                productSnapshot: {
                  name: item.product.name,
                  shortName: item.product.shortName,
                  brand: item.product.brand,
                  image: item.product.images[0],
                },
              })),
            },
          },
          include: { items: true },
        });
      });
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("OUT_OF_STOCK:")) {
        const productName = error.message.split(":")[1];
        return NextResponse.json(
          {
            error: `Estoque indisponível para ${productName}. Revise o carrinho e tente novamente.`,
          },
          { status: 400 },
        );
      }
      throw error;
    }

    // Create Mercado Pago preference
    const mpItems = validItems.map((item) => {
      const product = item.product;
      return {
        title: product.shortName,
        quantity: item.quantity,
        unit_price: getProductUnitPrice(product, totalQuantity),
      };
    });

    let mpPreference;
    try {
      mpPreference = await createPaymentPreference(
        mpItems,
        { email: user.email, name: user.name || undefined },
        order.id,
        shipping,
        discount,
      );
    } catch (error) {
      if (error instanceof MercadoPagoConfigurationError) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      throw error;
    }

    const mpPreferenceData = mpPreference as unknown as {
      id?: string;
      init_point?: string | null;
      sandbox_init_point?: string | null;
      checkout_url?: string | null;
    };

    const checkoutUrl =
      mpPreferenceData.checkout_url ||
      mpPreferenceData.init_point ||
      mpPreferenceData.sandbox_init_point ||
      null;

    if (!checkoutUrl) {
      return NextResponse.json(
        { error: "Mercado Pago não retornou URL de checkout." },
        { status: 502 },
      );
    }

    // Update order with MP ID
    await prisma.order.update({
      where: { id: order.id },
      data: { mercadoPagoId: mpPreferenceData.id },
    });

    // Send order confirmation email
    try {
      await sendOrderConfirmationEmail(user.email, order.orderNumber, total);
    } catch {
      // Don't fail order if email fails
    }

    const isTestMode = (process.env.MERCADOPAGO_ACCESS_TOKEN || "").startsWith(
      "TEST-",
    );

    return NextResponse.json({
      orderId: order.id,
      orderNumber: order.orderNumber,
      preferenceId: mpPreferenceData.id,
      initPoint: checkoutUrl,
      testMode: isTestMode,
      total,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { error: "Erro ao criar pedido. Tente novamente." },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        items: { include: { product: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar pedidos." },
      { status: 500 },
    );
  }
}
