import { NextRequest, NextResponse } from "next/server";
import { shippingCalcSchema } from "@/lib/validation";
import {
  calculateNationalShipping,
  geocodeCep,
  isWithinFreeDeliveryRadius,
  getDistanceFromStore,
} from "@/lib/shipping";
import { prisma } from "@/lib/prisma";
import {
  applyFreeShippingDiscount,
  evaluateFreeShipping,
  getOrCreateShippingSettings,
  parseFreeShippingTiers,
} from "@/lib/shipping-settings";
import { getProductUnitPrice } from "@/data/products";

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
        bulkPrice: true,
      },
    });

    const byIdentifier = new Map<
      string,
      {
        shippingWeightGrams: number;
        promoPrice: number;
        bulkPrice: number;
      }
    >();
    for (const product of products) {
      const entry = {
        shippingWeightGrams: product.shippingWeightGrams,
        promoPrice: product.promoPrice,
        bulkPrice: product.bulkPrice,
      };
      byIdentifier.set(product.id, entry);
      byIdentifier.set(product.slug, entry);
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
    const subtotal = items.reduce((sum, item) => {
      const product = byIdentifier.get(item.productId);
      if (!product) return sum;
      const unitPrice = getProductUnitPrice(
        {
          promoPrice: product.promoPrice,
          bulkPrice: product.bulkPrice,
        },
        totalItems,
      );
      return sum + item.quantity * unitPrice;
    }, 0);

    const settings = await getOrCreateShippingSettings();

    const freeShippingApplication = evaluateFreeShipping(subtotal, {
      freeShippingEnabled: settings.freeShippingEnabled,
      freeShippingThreshold: settings.freeShippingThreshold,
      freeShippingTiers: settings.freeShippingTiers,
    });

    const decorateQuote = <
      T extends { method: string; price: number },
    >(
      quote: T,
    ): T & {
      originalPrice: number;
      freeShippingDiscount: number;
      freeShippingDiscountPercent: number;
    } => {
      // Não aplica em retirada nem em frete já gratuito
      if (
        quote.method === "PICKUP_STORE" ||
        quote.method === "LOCAL_FREE" ||
        quote.price <= 0
      ) {
        return {
          ...quote,
          originalPrice: quote.price,
          freeShippingDiscount: 0,
          freeShippingDiscountPercent: 0,
        };
      }

      const { finalPrice, discountAmount } = applyFreeShippingDiscount(
        quote.price,
        freeShippingApplication,
      );
      return {
        ...quote,
        originalPrice: quote.price,
        price: finalPrice,
        freeShippingDiscount: discountAmount,
        freeShippingDiscountPercent: freeShippingApplication.discountPercent,
      };
    };

    const tiersPayload = parseFreeShippingTiers(settings.freeShippingTiers);

    const freeShippingPayload = {
      enabled: settings.freeShippingEnabled,
      threshold: settings.freeShippingThreshold,
      tiers: tiersPayload,
      subtotal,
      reachedThreshold: freeShippingApplication.reachedThreshold,
      discountPercent: freeShippingApplication.discountPercent,
      amountToNextMilestone: freeShippingApplication.amountToNextMilestone,
      nextMilestoneValue: freeShippingApplication.nextMilestoneValue,
    };

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
        quotes: freeQuotes.map(decorateQuote),
        freeDelivery: true,
        freeShipping: freeShippingPayload,
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
      quotes: quotes.map(decorateQuote),
      freeDelivery: false,
      freeShipping: freeShippingPayload,
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
