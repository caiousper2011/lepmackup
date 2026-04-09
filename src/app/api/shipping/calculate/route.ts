import { NextRequest, NextResponse } from "next/server";
import { shippingCalcSchema } from "@/lib/validation";
import {
  calculateNationalShipping,
  geocodeCep,
  isWithinFreeDeliveryRadius,
  getDistanceFromStore,
} from "@/lib/shipping";
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
        promoPrice: true,
      },
    });

    const byIdentifier = new Map<
      string,
      { shippingWeightGrams: number; promoPrice: number }
    >();
    for (const product of products) {
      byIdentifier.set(product.id, {
        shippingWeightGrams: product.shippingWeightGrams,
        promoPrice: product.promoPrice,
      });
      byIdentifier.set(product.slug, {
        shippingWeightGrams: product.shippingWeightGrams,
        promoPrice: product.promoPrice,
      });
    }

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalWeightGrams = items.reduce((sum, item) => {
      const product = byIdentifier.get(item.productId);
      const weight = product?.shippingWeightGrams ?? 50;
      return sum + item.quantity * weight;
    }, 0);
    const insuranceValue = items.reduce((sum, item) => {
      const product = byIdentifier.get(item.productId);
      const price = product?.promoPrice ?? 0;
      return sum + item.quantity * price;
    }, 0);

    const settings = await getOrCreateShippingSettings();

    // Geocode CEP to check distance from store
    const coords = await geocodeCep(cep);

    if (coords && isWithinFreeDeliveryRadius(coords.lat, coords.lng)) {
      // Within 1km — only free delivery + pickup
      const distance = getDistanceFromStore(coords.lat, coords.lng);
      const freeQuotes = [
        {
          serviceId: null,
          method: "LOCAL_FREE",
          price: 0,
          estimatedDays: 1,
          description: `Entrega grátis (${distance.toFixed(1)}km da loja)`,
          companyId: null,
          companyName: null,
        },
      ];

      if (settings.pickupEnabled) {
        freeQuotes.unshift({
          serviceId: null,
          method: "PICKUP_STORE",
          price: 0,
          estimatedDays: 0,
          description: `Retirada no endereço — ${settings.pickupAddress}`,
          companyId: null,
          companyName: null,
        });
      }

      return NextResponse.json({
        quotes: freeQuotes,
        freeDelivery: true,
        settings: {
          pickupEnabled: settings.pickupEnabled,
          pickupAddress: settings.pickupAddress,
          pickupInstructions: settings.pickupInstructions,
        },
      });
    }

    // Beyond 1km — use Melhor Envio API (real quotes, no mocked values)
    const nationalQuotes = await calculateNationalShipping(cep, {
      totalItems,
      totalWeightGrams,
      insuranceValue: Math.round(insuranceValue * 100) / 100,
    });

    const quotes = settings.pickupEnabled
      ? [
          {
            serviceId: null,
            method: "PICKUP_STORE",
            price: 0,
            estimatedDays: 0,
            description: `Retirada no endereço — ${settings.pickupAddress}`,
            companyId: null,
            companyName: null,
          },
          ...nationalQuotes,
        ]
      : nationalQuotes;

    return NextResponse.json({
      quotes,
      freeDelivery: false,
      settings: {
        pickupEnabled: settings.pickupEnabled,
        pickupAddress: settings.pickupAddress,
        pickupInstructions: settings.pickupInstructions,
      },
    });
  } catch (error) {
    console.error("Shipping calc error:", error);
    const message =
      error instanceof Error
        ? error.message
        : "Erro ao calcular frete. Tente novamente.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
