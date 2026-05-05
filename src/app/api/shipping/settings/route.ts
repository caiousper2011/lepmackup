import { NextResponse } from "next/server";
import {
  getOrCreateShippingSettings,
  parseFreeShippingTiers,
} from "@/lib/shipping-settings";

export async function GET() {
  try {
    const settings = await getOrCreateShippingSettings();

    return NextResponse.json({
      settings: {
        pickupEnabled: settings.pickupEnabled,
        pickupAddress: settings.pickupAddress,
        pickupInstructions: settings.pickupInstructions,
        freeShipping: {
          enabled: settings.freeShippingEnabled,
          threshold: settings.freeShippingThreshold,
          tiers: parseFreeShippingTiers(settings.freeShippingTiers),
        },
      },
    });
  } catch (error) {
    console.error("Get public shipping settings error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar configurações de entrega." },
      { status: 500 },
    );
  }
}
