import { NextRequest, NextResponse } from "next/server";
import { shippingCalcSchema } from "@/lib/validation";
import { calculateNationalShipping } from "@/lib/shipping";
import { prisma } from "@/lib/prisma";
import { getOrCreateShippingSettings } from "@/lib/shipping-settings";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = shippingCalcSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { cep, items } = parsed.data;

    const identifiers = [...new Set(items.map((item) => item.productId))];
    const products = await prisma.product.findMany({
      where: {
        active: true,
        OR: [{ id: { in: identifiers } }, { slug: { in: identifiers } }],
      },
      select: {
        id: true,
        slug: true,
        shippingWeightGrams: true,
      },
    });

    const byIdentifier = new Map<string, { shippingWeightGrams: number }>();
    for (const product of products) {
      byIdentifier.set(product.id, {
        shippingWeightGrams: product.shippingWeightGrams,
      });
      byIdentifier.set(product.slug, {
        shippingWeightGrams: product.shippingWeightGrams,
      });
    }

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalWeightGrams = items.reduce((sum, item) => {
      const product = byIdentifier.get(item.productId);
      const weight = product?.shippingWeightGrams ?? 50;
      return sum + item.quantity * weight;
    }, 0);

    const nationalQuotes = await calculateNationalShipping(cep, {
      totalItems,
      totalWeightGrams,
    });

    const settings = await getOrCreateShippingSettings();

    const quotes = settings.pickupEnabled
      ? [
          {
            method: "PICKUP_STORE",
            price: 0,
            estimatedDays: 0,
            description: `Retirada no endereço — ${settings.pickupAddress}`,
          },
          ...nationalQuotes,
        ]
      : nationalQuotes;

    return NextResponse.json({
      quotes,
      settings: {
        pickupEnabled: settings.pickupEnabled,
        pickupAddress: settings.pickupAddress,
        pickupInstructions: settings.pickupInstructions,
      },
    });
  } catch (error) {
    console.error("Shipping calc error:", error);
    return NextResponse.json(
      { error: "Erro ao calcular frete." },
      { status: 500 },
    );
  }
}
