import { NextResponse } from "next/server";
import {
  getOrCreateShippingSettings,
  parseFreeShippingTiers,
} from "@/lib/shipping-settings";

/**
 * GET /api/settings
 * Endpoint público que retorna configurações visíveis ao cliente.
 * Não expõe dados sensíveis de admin.
 */
export async function GET() {
  try {
    const settings = await getOrCreateShippingSettings();
    return NextResponse.json({
      maxItemsPerOrder: settings.maxItemsPerOrder,
      freeShipping: {
        enabled: settings.freeShippingEnabled,
        threshold: settings.freeShippingThreshold,
        tiers: parseFreeShippingTiers(settings.freeShippingTiers),
      },
    });
  } catch (error) {
    console.error("GET /api/settings error:", error);
    // Fallback seguro: limite padrão
    return NextResponse.json({
      maxItemsPerOrder: 6,
      freeShipping: { enabled: false, threshold: 0, tiers: [] },
    });
  }
}
