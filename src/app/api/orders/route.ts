import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { checkoutSchema } from "@/lib/validation";
import {
  createPaymentPreference,
  getMercadoPagoRuntimeConfig,
  MercadoPagoConfigurationError,
} from "@/lib/mercadopago";
import {
  extractMelhorEnvioServiceId,
  validateMelhorEnvioServiceFromQuote,
} from "@/lib/shipping";
import { sendOrderConfirmationEmail } from "@/lib/email";
import { getProductUnitPrice } from "@/data/products";
import { getOrCreateShippingSettings } from "@/lib/shipping-settings";

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

    const {
      addressId,
      shippingMethod,
      melhorEnvioServiceId,
      melhorEnvioCompanyId,
      shippingDescription,
      shippingPrice,
      cpfCnpj,
      customerName,
      couponCode,
      items,
    } = parsed.data;

    const isPickup = shippingMethod === "PICKUP_STORE";

    // Busca settings uma vez para validar pickup e limite de itens
    const shippingSettings = await getOrCreateShippingSettings();

    if (isPickup && !shippingSettings.pickupEnabled) {
      return NextResponse.json(
        { error: "Retirada no endereço está indisponível no momento." },
        { status: 400 },
      );
    }

    // Verify address belongs to user (not required for pickup)
    const address = isPickup
      ? null
      : await prisma.address.findFirst({
          where: { id: addressId, userId: user.id },
        });
    if (!isPickup && !address) {
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

    // Valida limite de itens por pedido (configurado pelo admin)
    const maxItemsPerOrder = shippingSettings.maxItemsPerOrder ?? 6;
    if (totalQuantity > maxItemsPerOrder) {
      return NextResponse.json(
        {
          error: `Seu pedido excede o limite de ${maxItemsPerOrder} itens por pedido.`,
        },
        { status: 400 },
      );
    }
    const subtotal = validItems.reduce(
      (sum, item) =>
        sum + item.quantity * getProductUnitPrice(item.product, totalQuantity),
      0,
    );
    const totalWeightGrams = validItems.reduce(
      (sum, item) =>
        sum + item.quantity * (item.product.shippingWeightGrams || 50),
      0,
    );

    // Validate coupon (discount is applied after shipping is validated)
    let discount = 0;
    let couponId: string | null = null;
    let couponAppliesTo: string | null = null;

    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase(), active: true },
      });

      if (coupon && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
        if (!coupon.maxUses || coupon.usedCount < coupon.maxUses) {
          if (totalQuantity >= coupon.minItems && subtotal >= coupon.minValue) {
            couponId = coupon.id;
            couponAppliesTo = coupon.appliesTo || "TOTAL";
            // Discount will be recalculated after shipping validation
            const tempBase =
              couponAppliesTo === "PRODUCT"
                ? subtotal
                : couponAppliesTo === "SHIPPING"
                  ? shippingPrice
                  : subtotal + shippingPrice;

            if (coupon.type === "PERCENT") {
              discount = (tempBase * coupon.value) / 100;
            } else {
              discount = Math.min(coupon.value, tempBase);
            }
          }
        }
      }
    }

    discount = Math.round(discount * 100) / 100;
    let normalizedShippingMethod = shippingMethod;
    let validatedShippingPrice = isPickup
      ? 0
      : Math.round(shippingPrice * 100) / 100;
    let validatedMelhorEnvioServiceId: number | null = null;

    const isMelhorEnvioShipping =
      !isPickup &&
      (typeof melhorEnvioServiceId === "number" ||
        /^MELHOR_ENVIO_\d+$/.test(shippingMethod));

    if (isMelhorEnvioShipping) {
      const selectedServiceId =
        melhorEnvioServiceId ?? extractMelhorEnvioServiceId(shippingMethod);

      if (!selectedServiceId) {
        return NextResponse.json(
          { error: "Service ID da cotação não encontrado." },
          { status: 400 },
        );
      }

      let selectedQuote;
      try {
        selectedQuote = await validateMelhorEnvioServiceFromQuote({
          cepDestino: address!.cep,
          totalWeightGrams,
          totalItems: totalQuantity,
          insuranceValue: subtotal,
          serviceId: selectedServiceId,
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Não foi possível validar o service ID da cotação.";
        return NextResponse.json({ error: message }, { status: 400 });
      }

      validatedMelhorEnvioServiceId = selectedServiceId;
      normalizedShippingMethod = `MELHOR_ENVIO_${selectedServiceId}`;
      validatedShippingPrice = Math.round(selectedQuote.price * 100) / 100;
    }

    const shipping = isPickup ? 0 : validatedShippingPrice;

    // Recalculate discount with validated shipping price
    if (couponId && couponAppliesTo) {
      const coupon = await prisma.coupon.findUnique({
        where: { id: couponId },
      });
      if (coupon) {
        const baseAmount =
          couponAppliesTo === "PRODUCT"
            ? subtotal
            : couponAppliesTo === "SHIPPING"
              ? shipping
              : subtotal + shipping;

        if (coupon.type === "PERCENT") {
          discount = (baseAmount * coupon.value) / 100;
        } else {
          discount = Math.min(coupon.value, baseAmount);
        }
        discount = Math.round(discount * 100) / 100;
      }
    }

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
            addressId: address?.id,
            subtotal,
            shipping,
            discount,
            total,
            couponId,
            shippingMethod: normalizedShippingMethod,
            addressSnapshot: isPickup
              ? {
                  pickupAddress: shippingSettings?.pickupAddress,
                  pickupInstructions: shippingSettings?.pickupInstructions,
                  cpfCnpj,
                  customerName,
                }
              : {
                  street: address!.street,
                  number: address!.number,
                  complement: address!.complement,
                  neighborhood: address!.neighborhood,
                  city: address!.city,
                  state: address!.state,
                  cep: address!.cep,
                  cpfCnpj,
                  customerName,
                  ...(validatedMelhorEnvioServiceId
                    ? { melhorEnvioServiceId: validatedMelhorEnvioServiceId }
                    : {}),
                  ...(melhorEnvioCompanyId ? { melhorEnvioCompanyId } : {}),
                  ...(shippingDescription ? { shippingDescription } : {}),
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
    await sendOrderConfirmationEmail(user.email, order.orderNumber, total);

    const isTestMode = getMercadoPagoRuntimeConfig().mode === "test";

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
