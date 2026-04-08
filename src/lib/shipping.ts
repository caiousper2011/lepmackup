// Haversine distance calculation + shipping rules
import { prisma } from "@/lib/prisma";

const STORE_LAT = parseFloat(process.env.STORE_LAT || "-23.53632612030784");
const STORE_LNG = parseFloat(process.env.STORE_LNG || "-46.53910512264193");

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export interface ShippingQuote {
  method: string;
  price: number;
  estimatedDays: number;
  description: string;
}

export interface MelhorEnvioTrackingInfo {
  trackingCode: string | null;
  trackingUrl: string | null;
}

export interface MelhorEnvioLabelResult {
  labelUrl: string;
  trackingCode: string | null;
  trackingUrl: string | null;
}

interface PackageDimensions {
  widthCm: number;
  heightCm: number;
  lengthCm: number;
}

function getFallbackPackageDimensions(totalItems: number): PackageDimensions {
  if (totalItems <= 6) {
    return { widthCm: 10, lengthCm: 15, heightCm: 3 };
  }
  return { widthCm: 20, lengthCm: 20, heightCm: 5 };
}

async function getPackageDimensions(
  totalItems: number,
): Promise<PackageDimensions> {
  const fallback = getFallbackPackageDimensions(totalItems);

  try {
    const rules = await prisma.shippingPackageRule.findMany({
      where: { active: true },
      orderBy: { maxItems: "asc" },
    });

    if (rules.length === 0) return fallback;

    const matchedRule =
      rules.find((rule) => totalItems <= rule.maxItems) ||
      rules[rules.length - 1];

    return {
      widthCm: matchedRule.widthCm,
      lengthCm: matchedRule.lengthCm,
      heightCm: matchedRule.heightCm,
    };
  } catch {
    return fallback;
  }
}

export function calculateLocalShipping(
  customerLat: number,
  customerLng: number,
): ShippingQuote | null {
  const distance = haversineDistanceKm(
    STORE_LAT,
    STORE_LNG,
    customerLat,
    customerLng,
  );

  if (distance <= 1) {
    return {
      method: "LOCAL_FREE",
      price: 0,
      estimatedDays: 1,
      description: `Entrega grátis (${distance.toFixed(1)}km da loja)`,
    };
  }

  if (distance <= 5) {
    return {
      method: "LOCAL_5KM",
      price: 12.0,
      estimatedDays: 1,
      description: `Entrega local (${distance.toFixed(1)}km) — R$ 12,00`,
    };
  }

  if (distance <= 15) {
    return {
      method: "LOCAL_15KM",
      price: 20.0,
      estimatedDays: 2,
      description: `Entrega regional (${distance.toFixed(1)}km) — R$ 20,00`,
    };
  }

  // Over 15km — needs external carrier
  return null;
}

export async function calculateNationalShipping(
  cepDestino: string,
  options?: {
    totalWeightGrams?: number;
    totalItems?: number;
  },
): Promise<ShippingQuote[]> {
  const token = process.env.MELHOR_ENVIO_TOKEN;
  const fromPostalCode =
    process.env.MELHOR_ENVIO_FROM_POSTAL_CODE || "03504000";

  const totalItems = Math.max(1, options?.totalItems ?? 1);
  const totalWeightGrams = Math.max(50, options?.totalWeightGrams ?? 500);
  const packageDimensions = await getPackageDimensions(totalItems);
  const packageWeightKg = Number((totalWeightGrams / 1000).toFixed(3));

  try {
    const response = await fetch(
      "https://melhorenvio.com.br/api/v2/me/shipment/calculate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "User-Agent": "LPMakeUp/1.0",
        },
        body: JSON.stringify({
          from: { postal_code: fromPostalCode.replace(/\D/g, "") },
          to: { postal_code: cepDestino.replace(/\D/g, "") },
          package: {
            // pacote dinâmico por quantidade de itens
            height: packageDimensions.heightCm,
            width: packageDimensions.widthCm,
            length: packageDimensions.lengthCm,
            weight: packageWeightKg,
          },
          options: {
            receipt: false,
            own_hand: false,
            reverse: false,
            non_commercial: true,
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error("Melhor Envio API error");
    }

    const data = await response.json();

    return data
      .filter((s: { error?: string; price?: string }) => !s.error && s.price)
      .map(
        (s: {
          name: string;
          id: number;
          price: string;
          delivery_time: number;
          company: { name: string };
        }) => ({
          method: `MELHOR_ENVIO_${s.id}`,
          price: parseFloat(s.price),
          estimatedDays: s.delivery_time,
          description: `${s.company.name} - ${s.name} — R$ ${parseFloat(s.price).toFixed(2)}`,
        }),
      )
      .sort((a: ShippingQuote, b: ShippingQuote) => a.price - b.price)
      .slice(0, 6);
  } catch {
    // Fallback
    return [
      {
        method: "CORREIOS_PAC",
        price: 25.0,
        estimatedDays: 8,
        description: "Entrega padrão (estimativa) — R$ 25,00",
      },
    ];
  }
}

function getMelhorEnvioToken(): string {
  const token = (process.env.MELHOR_ENVIO_TOKEN || "").trim();
  if (!token) {
    throw new Error("MELHOR_ENVIO_TOKEN não configurado.");
  }
  return token;
}

function buildMelhorEnvioHeaders() {
  const token = getMelhorEnvioToken();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    Accept: "application/json",
    "User-Agent": "LPMakeUp/1.0",
  };
}

function pickFirstString(
  input: Record<string, unknown> | undefined,
  keys: string[],
): string | null {
  if (!input) return null;

  for (const key of keys) {
    const value = input[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function extractObjects(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload.filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null,
    );
  }

  if (typeof payload === "object" && payload !== null) {
    const asRecord = payload as Record<string, unknown>;

    if (Array.isArray(asRecord.data)) {
      return asRecord.data.filter(
        (item): item is Record<string, unknown> =>
          typeof item === "object" && item !== null,
      );
    }

    return [asRecord];
  }

  return [];
}

function fallbackTrackingUrlFromCode(
  trackingCode: string | null,
): string | null {
  if (!trackingCode) return null;
  return `https://rastreamento.correios.com.br/app/index.php?objetos=${encodeURIComponent(trackingCode)}`;
}

export async function fetchMelhorEnvioTrackingInfo(
  shipmentId: string,
): Promise<MelhorEnvioTrackingInfo> {
  const cleanShipmentId = shipmentId.trim();

  if (!cleanShipmentId) {
    return { trackingCode: null, trackingUrl: null };
  }

  try {
    const response = await fetch(
      "https://melhorenvio.com.br/api/v2/me/shipment/tracking",
      {
        method: "POST",
        headers: buildMelhorEnvioHeaders(),
        body: JSON.stringify({ orders: [cleanShipmentId] }),
      },
    );

    if (!response.ok) {
      return { trackingCode: null, trackingUrl: null };
    }

    const payload = (await response.json()) as unknown;
    const entries = extractObjects(payload);
    const match =
      entries.find((entry) => {
        const entryId =
          pickFirstString(entry, ["id", "order", "shipment_id"]) || "";
        return entryId === cleanShipmentId;
      }) || entries[0];

    if (!match) {
      return { trackingCode: null, trackingUrl: null };
    }

    const trackingCode = pickFirstString(match, [
      "tracking",
      "tracking_code",
      "protocol",
      "code",
    ]);
    const trackingUrl =
      pickFirstString(match, ["tracking_url", "url", "link"]) ||
      fallbackTrackingUrlFromCode(trackingCode);

    return { trackingCode, trackingUrl };
  } catch {
    return { trackingCode: null, trackingUrl: null };
  }
}

export async function generateMelhorEnvioShippingLabel(
  shipmentId: string,
): Promise<MelhorEnvioLabelResult> {
  const cleanShipmentId = shipmentId.trim();

  if (!cleanShipmentId) {
    throw new Error("Shipment ID inválido para gerar etiqueta.");
  }

  const response = await fetch(
    "https://melhorenvio.com.br/api/v2/me/shipment/print",
    {
      method: "POST",
      headers: buildMelhorEnvioHeaders(),
      body: JSON.stringify({
        mode: "public",
        orders: [cleanShipmentId],
      }),
    },
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Falha ao gerar etiqueta no Melhor Envio: ${details}`);
  }

  const payload = (await response.json()) as unknown;
  const entries = extractObjects(payload);
  const rootRecord =
    typeof payload === "object" && payload !== null
      ? (payload as Record<string, unknown>)
      : undefined;

  const first = entries[0] || rootRecord;
  const labelUrl = pickFirstString(first, ["url", "link", "label", "pdf"]);

  if (!labelUrl) {
    throw new Error(
      "Melhor Envio não retornou URL da etiqueta para impressão.",
    );
  }

  const trackingInfo = await fetchMelhorEnvioTrackingInfo(cleanShipmentId);

  return {
    labelUrl,
    trackingCode: trackingInfo.trackingCode,
    trackingUrl: trackingInfo.trackingUrl,
  };
}

export async function geocodeAddress(
  cep: string,
): Promise<{ lat: number; lng: number } | null> {
  // Try Nominatim (free, no API key needed)
  try {
    const cleanCep = cep.replace(/\D/g, "");
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${cleanCep}&country=BR&format=json&limit=1`,
      {
        headers: { "User-Agent": "LEPMakeUp/1.0" },
      },
    );
    const data = await response.json();
    if (data.length > 0) {
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
  } catch {
    // Ignore
  }

  // Try Google Geocoding if available
  const googleKey = process.env.GOOGLE_GEOCODING_API_KEY;
  if (googleKey) {
    try {
      const cleanCep = cep.replace(/\D/g, "");
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${cleanCep}&region=br&key=${googleKey}`,
      );
      const data = await response.json();
      if (data.results?.[0]?.geometry?.location) {
        return {
          lat: data.results[0].geometry.location.lat,
          lng: data.results[0].geometry.location.lng,
        };
      }
    } catch {
      // Ignore
    }
  }

  return null;
}
