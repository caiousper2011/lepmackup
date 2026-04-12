// Haversine distance calculation + shipping rules + Melhor Envio integration
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
  const R = 6371;
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

// ─── Interfaces ───

export interface ShippingQuote {
  serviceId: number | null;
  method: string;
  price: number;
  estimatedDays: number;
  description: string;
  companyId: number | null;
  companyName: string | null;
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

export interface MelhorEnvioFullAddress {
  name: string;
  phone: string;
  email: string;
  document: string;
  company_document?: string;
  state_register?: string;
  address: string;
  complement?: string;
  number: string;
  district: string;
  city: string;
  state_abbr: string;
  country_id: string;
  postal_code: string;
  note?: string;
}

export interface MelhorEnvioCartItem {
  name: string;
  quantity: number;
  unitary_value: number;
}

export interface MelhorEnvioCartInsertParams {
  serviceId: number;
  from: MelhorEnvioFullAddress;
  to: MelhorEnvioFullAddress;
  products: MelhorEnvioCartItem[];
  volumes: Array<{
    height: number;
    width: number;
    length: number;
    weight: number;
  }>;
  options?: {
    insurance_value?: number;
    receipt?: boolean;
    own_hand?: boolean;
  };
}

export interface OrderShippingData {
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  customerDocument: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    cep: string;
  };
  serviceId: number;
  products: MelhorEnvioCartItem[];
  volumes: Array<{
    height: number;
    width: number;
    length: number;
    weight: number;
  }>;
  insuranceValue?: number;
}

export interface MelhorEnvioAgency {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  phone: string | null;
  company_name: string;
}

export interface MelhorEnvioShipmentDetail {
  id: string;
  status: string;
  tracking: string | null;
  service: string | null;
  from: Record<string, unknown>;
  to: Record<string, unknown>;
  created_at: string;
  paid_at: string | null;
  generated_at: string | null;
  posted_at: string | null;
  delivered_at: string | null;
}

// ─── Package Dimensions ───

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

// ─── Distance / Free Delivery ───

export function getDistanceFromStore(
  customerLat: number,
  customerLng: number,
): number {
  return haversineDistanceKm(STORE_LAT, STORE_LNG, customerLat, customerLng);
}

export function isWithinFreeDeliveryRadius(
  customerLat: number,
  customerLng: number,
): boolean {
  return getDistanceFromStore(customerLat, customerLng) <= 1;
}

// ─── Melhor Envio Helpers ───

function getMelhorEnvioToken(): string {
  const env = resolveMelhorEnvioMode();
  const token =
    env === "production"
      ? (process.env.MELHOR_ENVIO_PROD_TOKEN || "").trim() ||
        (process.env.MELHOR_ENVIO_TOKEN || "").trim()
      : (process.env.MELHOR_ENVIO_TOKEN || "").trim() ||
        (process.env.MELHOR_ENVIO_PROD_TOKEN || "").trim();
  if (!token) {
    throw new Error("MELHOR_ENVIO_TOKEN não configurado.");
  }
  return token;
}

function resolveMelhorEnvioMode(): "sandbox" | "production" {
  const explicit = (process.env.MELHOR_ENVIO_ENV || "").toLowerCase();
  if (explicit === "sandbox") return "sandbox";
  if (explicit === "production") return "production";
  // Auto: use production when NODE_ENV=production
  return process.env.NODE_ENV === "production" ? "production" : "sandbox";
}

function getMelhorEnvioBaseUrl(): string {
  const mode = resolveMelhorEnvioMode();
  if (mode === "sandbox") return "https://sandbox.melhorenvio.com.br";
  return "https://melhorenvio.com.br";
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

// Carrier tracking URL map – uses Melhor Rastreio as default (covers all carriers via ME)
const CARRIER_TRACKING_URLS: Record<string, (code: string) => string> = {
  correios: (code) =>
    `https://rastreamento.correios.com.br/app/index.php?objetos=${encodeURIComponent(code)}`,
  jadlog: (code) =>
    `https://www.jadlog.com.br/jadlog/tracking?cte=${encodeURIComponent(code)}`,
  latam: (code) =>
    `https://www.latamcargo.com/en/trackshipment?docNumber=${encodeURIComponent(code)}`,
  azul: (code) =>
    `https://www.azulcargoexpress.com.br/rastreio?tracking=${encodeURIComponent(code)}`,
};

function buildTrackingUrl(
  trackingCode: string | null,
  companyName?: string | null,
): string | null {
  if (!trackingCode) return null;

  // Always prefer Melhor Rastreio universal URL (works for all Melhor Envio shipments)
  const melhorRastreioUrl = `https://www.melhorrastreio.com.br/rastreio/${encodeURIComponent(trackingCode)}`;

  if (!companyName) return melhorRastreioUrl;

  // Try carrier-specific URL as secondary option
  const normalized = companyName.toLowerCase().trim();
  for (const [key, builder] of Object.entries(CARRIER_TRACKING_URLS)) {
    if (normalized.includes(key)) {
      return builder(trackingCode);
    }
  }

  return melhorRastreioUrl;
}

// ─── Company / Sender Info ───

export function getCompanyShippingInfo(): MelhorEnvioFullAddress {
  const isProd = resolveMelhorEnvioMode() === "production";

  const envOrFallback = (
    prodKey: string,
    testKey: string,
    fallback: string = "",
  ) => {
    if (isProd)
      return (process.env[prodKey] || process.env[testKey] || fallback).trim();
    return (process.env[testKey] || process.env[prodKey] || fallback).trim();
  };

  return {
    name: envOrFallback(
      "MELHOR_ENVIO_PROD_FROM_NAME",
      "MELHOR_ENVIO_FROM_NAME",
      "L&P MakeUp",
    ),
    phone: envOrFallback(
      "MELHOR_ENVIO_PROD_FROM_PHONE",
      "MELHOR_ENVIO_FROM_PHONE",
      "11952875150",
    ).replace(/\D/g, ""),
    email: envOrFallback(
      "MELHOR_ENVIO_PROD_FROM_EMAIL",
      "MELHOR_ENVIO_FROM_EMAIL",
      "contato@lepmakeup.com.br",
    ),
    document: envOrFallback(
      "MELHOR_ENVIO_PROD_FROM_DOCUMENT",
      "MELHOR_ENVIO_FROM_DOCUMENT",
    ).replace(/\D/g, ""),
    company_document: (
      envOrFallback(
        "MELHOR_ENVIO_PROD_FROM_COMPANY_DOCUMENT",
        "MELHOR_ENVIO_FROM_COMPANY_DOCUMENT",
      ) ||
      envOrFallback(
        "MELHOR_ENVIO_PROD_FROM_DOCUMENT",
        "MELHOR_ENVIO_FROM_DOCUMENT",
      )
    ).replace(/\D/g, ""),
    address: envOrFallback(
      "MELHOR_ENVIO_PROD_FROM_ADDRESS",
      "MELHOR_ENVIO_FROM_ADDRESS",
    ),
    complement: envOrFallback(
      "MELHOR_ENVIO_PROD_FROM_COMPLEMENT",
      "MELHOR_ENVIO_FROM_COMPLEMENT",
    ),
    number: envOrFallback(
      "MELHOR_ENVIO_PROD_FROM_NUMBER",
      "MELHOR_ENVIO_FROM_NUMBER",
    ),
    district: envOrFallback(
      "MELHOR_ENVIO_PROD_FROM_DISTRICT",
      "MELHOR_ENVIO_FROM_DISTRICT",
    ),
    city: envOrFallback(
      "MELHOR_ENVIO_PROD_FROM_CITY",
      "MELHOR_ENVIO_FROM_CITY",
      "São Paulo",
    ),
    state_abbr: envOrFallback(
      "MELHOR_ENVIO_PROD_FROM_STATE",
      "MELHOR_ENVIO_FROM_STATE",
      "SP",
    ),
    country_id: "BR",
    postal_code: envOrFallback(
      "MELHOR_ENVIO_PROD_FROM_POSTAL_CODE",
      "MELHOR_ENVIO_FROM_POSTAL_CODE",
      "03504000",
    ).replace(/\D/g, ""),
  };
}

// ─── Mapper: Order Data → Melhor Envio Payload ───

export function mapOrderToMelhorEnvioPayload(
  data: OrderShippingData,
): MelhorEnvioCartInsertParams {
  const from = getCompanyShippingInfo();

  if (!from.name) throw new Error("MELHOR_ENVIO_FROM_NAME não configurado.");
  if (!from.address)
    throw new Error(
      "MELHOR_ENVIO_FROM_ADDRESS não configurado. Preencha o endereço da empresa no .env.",
    );
  if (!from.city) throw new Error("MELHOR_ENVIO_FROM_CITY não configurado.");
  if (!from.postal_code)
    throw new Error("MELHOR_ENVIO_FROM_POSTAL_CODE não configurado.");

  if (!data.customerDocument)
    throw new Error("CPF/CNPJ do destinatário é obrigatório.");
  if (!data.address.street)
    throw new Error("Endereço de entrega não possui rua.");
  if (!data.address.neighborhood)
    throw new Error("Endereço de entrega não possui bairro.");
  if (!data.address.city)
    throw new Error("Endereço de entrega não possui cidade.");
  if (!data.address.state)
    throw new Error("Endereço de entrega não possui estado.");
  if (!data.address.cep) throw new Error("CEP de entrega não encontrado.");

  const cleanDocument = data.customerDocument.replace(/\D/g, "");
  const companyPhone = from.phone;

  const to: MelhorEnvioFullAddress = {
    name: data.customerName || cleanDocument,
    phone: data.customerPhone?.replace(/\D/g, "") || companyPhone,
    email: data.customerEmail,
    document: cleanDocument,
    address: data.address.street,
    complement: data.address.complement || "",
    number: data.address.number || "S/N",
    district: data.address.neighborhood,
    city: data.address.city,
    state_abbr: data.address.state.toUpperCase(),
    country_id: "BR",
    postal_code: data.address.cep.replace(/\D/g, ""),
  };

  const params: MelhorEnvioCartInsertParams = {
    serviceId: data.serviceId,
    from,
    to,
    products: data.products,
    volumes: data.volumes,
  };

  if (data.insuranceValue && data.insuranceValue > 0) {
    params.options = {
      insurance_value: Math.round(data.insuranceValue * 100) / 100,
      receipt: false,
      own_hand: false,
    };
  }

  return params;
}

// ─── Calculate Shipping Quotes ───

export async function calculateNationalShipping(
  cepDestino: string,
  options?: {
    totalWeightGrams?: number;
    totalItems?: number;
    insuranceValue?: number;
  },
): Promise<ShippingQuote[]> {
  const token = getMelhorEnvioToken();
  const companyInfo = getCompanyShippingInfo();
  const fromPostalCode = companyInfo.postal_code || "03504000";

  const totalItems = Math.max(1, options?.totalItems ?? 1);
  const totalWeightGrams = Math.max(50, options?.totalWeightGrams ?? 500);
  const packageDimensions = await getPackageDimensions(totalItems);
  const packageWeightKg = Number((totalWeightGrams / 1000).toFixed(3));
  const insuranceValue = options?.insuranceValue ?? 0;

  const response = await fetch(
    `${getMelhorEnvioBaseUrl()}/api/v2/me/shipment/calculate`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        "User-Agent": "LPMakeUp (contato@lepmakeup.com.br)",
      },
      body: JSON.stringify({
        from: { postal_code: fromPostalCode.replace(/\D/g, "") },
        to: { postal_code: cepDestino.replace(/\D/g, "") },
        volumes: [
          {
            height: packageDimensions.heightCm,
            width: packageDimensions.widthCm,
            length: packageDimensions.lengthCm,
            weight: packageWeightKg,
            insurance: insuranceValue,
          },
        ],
        options: {
          receipt: false,
          own_hand: false,
        },
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Melhor Envio API error:", response.status, errorText);
    throw new Error(
      `Erro ao consultar frete no Melhor Envio (${response.status})`,
    );
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    console.error("Melhor Envio returned unexpected format:", data);
    throw new Error("Resposta inesperada do Melhor Envio");
  }

  const quotes = data
    .filter(
      (s: { error?: string; price?: string; custom_price?: string }) =>
        !s.error && (s.custom_price || s.price),
    )
    .map(
      (s: {
        name: string;
        id: number;
        price: string;
        custom_price?: string;
        delivery_time: number;
        custom_delivery_time?: number;
        company: { id: number; name: string };
      }) => {
        const price = parseFloat(s.custom_price || s.price);
        const days = s.custom_delivery_time ?? s.delivery_time;
        return {
          serviceId: s.id,
          method: `MELHOR_ENVIO_${s.id}`,
          price,
          estimatedDays: days,
          description: `${s.company.name} - ${s.name}`,
          companyId: s.company.id,
          companyName: s.company.name,
        };
      },
    )
    .sort((a: ShippingQuote, b: ShippingQuote) => a.price - b.price)
    .slice(0, 6);

  if (quotes.length === 0) {
    throw new Error(
      "Nenhuma transportadora disponível para este CEP. Verifique o CEP informado.",
    );
  }

  return quotes;
}

// ─── Service ID Extraction & Validation ───

export function extractMelhorEnvioServiceId(
  shippingMethod: string | null | undefined,
): number | null {
  if (!shippingMethod) return null;
  const match = shippingMethod.match(/^MELHOR_ENVIO_(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

export async function validateMelhorEnvioServiceFromQuote(params: {
  cepDestino: string;
  totalWeightGrams: number;
  totalItems: number;
  insuranceValue?: number;
  serviceId: number;
}): Promise<ShippingQuote> {
  const quotes = await calculateNationalShipping(params.cepDestino, {
    totalWeightGrams: params.totalWeightGrams,
    totalItems: params.totalItems,
    insuranceValue: params.insuranceValue,
  });

  if (!quotes.length) {
    throw new Error(
      "Cotação de frete vazia para o CEP informado. Recalcule o frete e tente novamente.",
    );
  }

  const selected = quotes.find((quote) => quote.serviceId === params.serviceId);

  if (!selected) {
    throw new Error(
      "Service ID selecionado não pertence à cotação atual. Recalcule o frete e selecione novamente.",
    );
  }

  return selected;
}

// ─── Tracking Info ───

export async function fetchMelhorEnvioTrackingInfo(
  shipmentId: string,
): Promise<MelhorEnvioTrackingInfo> {
  const cleanShipmentId = shipmentId.trim();
  if (!cleanShipmentId) {
    return { trackingCode: null, trackingUrl: null };
  }

  try {
    const response = await fetch(
      `${getMelhorEnvioBaseUrl()}/api/v2/me/shipment/tracking`,
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
      buildTrackingUrl(trackingCode);

    return { trackingCode, trackingUrl };
  } catch {
    return { trackingCode: null, trackingUrl: null };
  }
}

// ─── Label Generation (print) ───

export async function generateMelhorEnvioShippingLabel(
  shipmentId: string,
): Promise<MelhorEnvioLabelResult> {
  const cleanShipmentId = shipmentId.trim();
  if (!cleanShipmentId) {
    throw new Error("Shipment ID inválido para gerar etiqueta.");
  }

  const response = await fetch(
    `${getMelhorEnvioBaseUrl()}/api/v2/me/shipment/print`,
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

// ─── Geocoding ───

export async function geocodeCep(
  cep: string,
): Promise<{ lat: number; lng: number } | null> {
  const cleanCep = cep.replace(/\D/g, "");

  let street: string | null = null;
  let neighborhood: string | null = null;
  let city: string | null = null;
  let state: string | null = null;

  try {
    const response = await fetch(
      `https://brasilapi.com.br/api/cep/v2/${cleanCep}`,
      { signal: AbortSignal.timeout(5000) },
    );
    if (response.ok) {
      const data = await response.json();
      street = data.street || null;
      neighborhood = data.neighborhood || null;
      city = data.city || null;
      state = data.state || null;

      if (
        data.location?.coordinates?.latitude &&
        data.location?.coordinates?.longitude
      ) {
        return {
          lat: parseFloat(String(data.location.coordinates.latitude)),
          lng: parseFloat(String(data.location.coordinates.longitude)),
        };
      }
    }
  } catch {
    // Continue to fallback
  }

  try {
    const queryParts = [street, neighborhood, city, state, "Brasil"].filter(
      Boolean,
    );
    const query =
      queryParts.length >= 3 ? queryParts.join(", ") : `${cleanCep}, Brasil`;

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`,
      {
        headers: { "User-Agent": "LPMakeUp/1.0" },
        signal: AbortSignal.timeout(5000),
      },
    );
    if (response.ok) {
      const data = await response.json();
      if (data.length > 0) {
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      }
    }
  } catch {
    // Ignore
  }

  return null;
}

// ─── Cart Insert ───

export async function melhorEnvioCartInsert(
  params: MelhorEnvioCartInsertParams,
): Promise<{ id: string; [key: string]: unknown }> {
  const baseUrl = getMelhorEnvioBaseUrl();

  if (!params.serviceId) {
    throw new Error("Service ID inválido para criação do envio.");
  }

  const body = {
    service: params.serviceId,
    from: {
      name: params.from.name,
      phone: params.from.phone,
      email: params.from.email,
      document: params.from.document,
      ...(params.from.company_document
        ? { company_document: params.from.company_document }
        : {}),
      address: params.from.address,
      complement: params.from.complement || "",
      number: params.from.number,
      district: params.from.district,
      city: params.from.city,
      state_abbr: params.from.state_abbr,
      country_id: params.from.country_id,
      postal_code: params.from.postal_code.replace(/\D/g, ""),
    },
    to: {
      name: params.to.name,
      phone: params.to.phone,
      email: params.to.email,
      document: params.to.document,
      address: params.to.address,
      complement: params.to.complement || "",
      number: params.to.number,
      district: params.to.district,
      city: params.to.city,
      state_abbr: params.to.state_abbr,
      country_id: params.to.country_id,
      postal_code: params.to.postal_code.replace(/\D/g, ""),
    },
    products: params.products,
    volumes: params.volumes,
    ...(params.options ? { options: params.options } : {}),
  };

  console.info(
    "[Melhor Envio] Cart insert payload:",
    JSON.stringify(body, null, 2),
  );

  const response = await fetch(`${baseUrl}/api/v2/me/cart`, {
    method: "POST",
    headers: buildMelhorEnvioHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Melhor Envio cart insert failed: ${details}`);
  }

  return response.json();
}

// ─── Checkout / Generate / Cancel ───

export async function melhorEnvioCheckout(
  shipmentIds: string[],
): Promise<Record<string, unknown>> {
  const baseUrl = getMelhorEnvioBaseUrl();
  const response = await fetch(`${baseUrl}/api/v2/me/shipment/checkout`, {
    method: "POST",
    headers: buildMelhorEnvioHeaders(),
    body: JSON.stringify({ orders: shipmentIds }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Melhor Envio checkout failed: ${details}`);
  }

  return response.json();
}

export async function melhorEnvioGenerate(
  shipmentIds: string[],
): Promise<Record<string, unknown>> {
  const baseUrl = getMelhorEnvioBaseUrl();
  const response = await fetch(`${baseUrl}/api/v2/me/shipment/generate`, {
    method: "POST",
    headers: buildMelhorEnvioHeaders(),
    body: JSON.stringify({ orders: shipmentIds }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Melhor Envio generate failed: ${details}`);
  }

  return response.json();
}

export async function melhorEnvioCancelShipment(
  shipmentId: string,
  reasonId: number = 2,
  description: string = "Pedido cancelado pela loja",
): Promise<Record<string, unknown>> {
  const baseUrl = getMelhorEnvioBaseUrl();
  const response = await fetch(`${baseUrl}/api/v2/me/shipment/cancel`, {
    method: "POST",
    headers: buildMelhorEnvioHeaders(),
    body: JSON.stringify({
      order: {
        id: shipmentId,
        reason_id: reasonId,
        description,
      },
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Melhor Envio cancel failed: ${details}`);
  }

  return response.json();
}

// ─── Balance ───

export async function melhorEnvioGetBalance(): Promise<number> {
  const baseUrl = getMelhorEnvioBaseUrl();
  const response = await fetch(`${baseUrl}/api/v2/me/balance`, {
    method: "GET",
    headers: buildMelhorEnvioHeaders(),
  });

  if (!response.ok) {
    throw new Error("Falha ao consultar saldo do Melhor Envio.");
  }

  const data = await response.json();
  return parseFloat(data.balance || data.available || "0");
}

// ─── Full Label Flow: Cart → Checkout → Generate → Print ───

export async function melhorEnvioFullLabelFlow(
  params: MelhorEnvioCartInsertParams,
): Promise<MelhorEnvioLabelResult & { shipmentId: string }> {
  const cartResult = await melhorEnvioCartInsert(params);
  const shipmentId = cartResult.id;

  if (!shipmentId) {
    throw new Error(
      "Melhor Envio não retornou ID do envio ao inserir no carrinho.",
    );
  }

  await melhorEnvioCheckout([shipmentId]);
  await melhorEnvioGenerate([shipmentId]);

  const labelResult = await generateMelhorEnvioShippingLabel(shipmentId);

  return { shipmentId, ...labelResult };
}

// ─── Agency Search (find drop-off points) ───

export async function melhorEnvioSearchAgencies(params: {
  companyId: number;
  state?: string;
  city?: string;
}): Promise<MelhorEnvioAgency[]> {
  const baseUrl = getMelhorEnvioBaseUrl();

  const queryParams = new URLSearchParams({
    company: String(params.companyId),
    country: "BR",
  });
  if (params.state) queryParams.set("state", params.state);
  if (params.city) queryParams.set("city", params.city);

  const response = await fetch(
    `${baseUrl}/api/v2/me/shipment/agencies?${queryParams.toString()}`,
    { method: "GET", headers: buildMelhorEnvioHeaders() },
  );

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Falha ao buscar agências: ${details}`);
  }

  const data = await response.json();
  const entries = Array.isArray(data) ? data : data?.data || [];

  return entries.map(
    (a: {
      id: number;
      name: string;
      address: string;
      city: { city: string; state: { state_abbr: string } };
      postal_code: string;
      phone: string | null;
      company_name: string;
    }) => ({
      id: a.id,
      name: a.name,
      address: a.address,
      city: a.city?.city || "",
      state: a.city?.state?.state_abbr || "",
      postal_code: a.postal_code || "",
      phone: a.phone || null,
      company_name: a.company_name || "",
    }),
  );
}

// ─── Shipment Details ───

export async function melhorEnvioGetShipmentDetails(
  shipmentId: string,
): Promise<MelhorEnvioShipmentDetail | null> {
  const baseUrl = getMelhorEnvioBaseUrl();

  const response = await fetch(`${baseUrl}/api/v2/me/orders/${shipmentId}`, {
    method: "GET",
    headers: buildMelhorEnvioHeaders(),
  });

  if (!response.ok) return null;

  const data = (await response.json()) as Record<string, unknown>;

  return {
    id: String(data.id || shipmentId),
    status: String(data.status || "unknown"),
    tracking: (data.tracking as string) || null,
    service: data.service ? String(data.service) : null,
    from: (data.from as Record<string, unknown>) || {},
    to: (data.to as Record<string, unknown>) || {},
    created_at: String(data.created_at || ""),
    paid_at: (data.paid_at as string) || null,
    generated_at: (data.generated_at as string) || null,
    posted_at: (data.posted_at as string) || null,
    delivered_at: (data.delivered_at as string) || null,
  };
}

// ─── Shipment Preview (cost preview before checkout) ───

export async function melhorEnvioPreviewShipment(
  shipmentId: string,
): Promise<{ total: number; discount: number; insurance: number }> {
  const baseUrl = getMelhorEnvioBaseUrl();

  const response = await fetch(`${baseUrl}/api/v2/me/shipment/preview`, {
    method: "POST",
    headers: buildMelhorEnvioHeaders(),
    body: JSON.stringify({ orders: [shipmentId] }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Falha no preview do envio: ${details}`);
  }

  const data = (await response.json()) as Record<string, unknown>;
  const entries = extractObjects(data);
  const first = entries[0] || data;

  return {
    total: parseFloat(String(first?.price || first?.total || "0")),
    discount: parseFloat(String(first?.discount || "0")),
    insurance: parseFloat(String(first?.insurance_value || "0")),
  };
}

// ─── Auto Generate Shipping Label (called after payment approval) ───

export async function autoGenerateShippingLabel(orderId: string): Promise<{
  shipmentId: string;
  labelUrl: string;
  trackingCode: string | null;
} | null> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      user: { select: { email: true, name: true, phone: true } },
      items: {
        include: {
          product: {
            select: {
              name: true,
              shortName: true,
              shippingWeightGrams: true,
              promoPrice: true,
            },
          },
        },
      },
      address: true,
    },
  });

  if (!order) {
    console.error(`[auto-label] Pedido ${orderId} não encontrado.`);
    return null;
  }

  if (!order.shippingMethod?.startsWith("MELHOR_ENVIO_")) {
    return null;
  }

  if (order.melhorEnvioShipmentId) {
    console.info(
      `[auto-label] Pedido ${orderId} já possui shipment ${order.melhorEnvioShipmentId}`,
    );
    return null;
  }

  const snapshot = order.addressSnapshot as Record<string, unknown> | null;

  const serviceId =
    (snapshot?.melhorEnvioServiceId as number | undefined) ??
    extractMelhorEnvioServiceId(order.shippingMethod);
  if (!serviceId) {
    throw new Error(
      `[auto-label] Service ID não encontrado no pedido ${orderId}.`,
    );
  }

  const addr = order.address;
  const addrStreet = addr?.street || String(snapshot?.street || "");
  const addrNumber = addr?.number || String(snapshot?.number || "S/N");
  const addrComplement = addr?.complement || String(snapshot?.complement || "");
  const addrNeighborhood =
    addr?.neighborhood || String(snapshot?.neighborhood || "");
  const addrCity = addr?.city || String(snapshot?.city || "");
  const addrState = addr?.state || String(snapshot?.state || "");
  const addrCep = addr?.cep || String(snapshot?.cep || "");

  if (!addrStreet || !addrCity || !addrCep) {
    throw new Error(`[auto-label] Endereço incompleto no pedido ${orderId}.`);
  }

  const cpfCnpj = String(snapshot?.cpfCnpj || "").replace(/\D/g, "");
  if (!cpfCnpj || (cpfCnpj.length !== 11 && cpfCnpj.length !== 14)) {
    throw new Error(`[auto-label] CPF/CNPJ inválido no pedido ${orderId}.`);
  }

  const products = order.items.map((item) => ({
    name: item.product.shortName || item.product.name,
    quantity: item.quantity,
    unitary_value: item.unitPrice,
  }));

  const totalItems = order.items.reduce((s, i) => s + i.quantity, 0);
  const totalWeightGrams = order.items.reduce(
    (s, i) => s + i.quantity * (i.product.shippingWeightGrams || 50),
    0,
  );

  const pkg =
    totalItems <= 6
      ? { height: 3, width: 10, length: 15 }
      : { height: 5, width: 20, length: 20 };

  const payloadData: OrderShippingData = {
    customerName: String(snapshot?.customerName || order.user?.name || cpfCnpj),
    customerEmail: order.user?.email || "",
    customerPhone: order.user?.phone || null,
    customerDocument: cpfCnpj,
    address: {
      street: addrStreet,
      number: addrNumber,
      complement: addrComplement,
      neighborhood: addrNeighborhood,
      city: addrCity,
      state: addrState,
      cep: addrCep,
    },
    serviceId,
    products,
    volumes: [
      {
        height: pkg.height,
        width: pkg.width,
        length: pkg.length,
        weight: Number((totalWeightGrams / 1000).toFixed(3)),
      },
    ],
    insuranceValue: order.total,
  };

  const cartParams = mapOrderToMelhorEnvioPayload(payloadData);

  console.info(
    `[auto-label] Gerando etiqueta automática para pedido ${order.orderNumber}...`,
  );

  const result = await melhorEnvioFullLabelFlow(cartParams);

  await prisma.order.update({
    where: { id: orderId },
    data: {
      melhorEnvioShipmentId: result.shipmentId,
      shippingLabelUrl: result.labelUrl,
      trackingCode: result.trackingCode,
      trackingUrl: result.trackingUrl,
    },
  });

  console.info(
    `[auto-label] Etiqueta gerada com sucesso para pedido ${order.orderNumber}: ${result.shipmentId}`,
  );

  return {
    shipmentId: result.shipmentId,
    labelUrl: result.labelUrl,
    trackingCode: result.trackingCode,
  };
}

// ─── Webhook Event Processing ───

export interface MelhorEnvioWebhookData {
  id: string;
  protocol?: string;
  status: string;
  tracking?: string | null;
  self_tracking?: string | null;
  tracking_url?: string | null;
  posted_at?: string | null;
  delivered_at?: string | null;
  canceled_at?: string | null;
}

export interface MelhorEnvioWebhookPayload {
  event: string;
  data: MelhorEnvioWebhookData;
}

export async function processMelhorEnvioWebhookEvent(
  payload: MelhorEnvioWebhookPayload,
): Promise<{
  processed: boolean;
  orderId: string | null;
  action: string;
}> {
  const { event, data } = payload;
  const shipmentId = data.id;

  if (!shipmentId) {
    console.warn("[me-webhook] Payload sem shipment ID, ignorando.");
    return { processed: false, orderId: null, action: "no_shipment_id" };
  }

  const order = await prisma.order.findFirst({
    where: { melhorEnvioShipmentId: shipmentId },
    include: {
      user: { select: { email: true, name: true } },
    },
  });

  if (!order) {
    console.warn(
      `[me-webhook] Nenhum pedido encontrado com shipmentId=${shipmentId}`,
    );
    return { processed: false, orderId: null, action: "order_not_found" };
  }

  const trackingCode = data.tracking || data.self_tracking || null;
  const trackingUrl =
    data.tracking_url || buildTrackingUrl(trackingCode) || null;

  switch (event) {
    case "order.generated": {
      // Label was generated — re-fetch and update label URL
      try {
        const labelResult = await generateMelhorEnvioShippingLabel(shipmentId);
        await prisma.order.update({
          where: { id: order.id },
          data: {
            shippingLabelUrl: labelResult.labelUrl,
            ...(trackingCode ? { trackingCode } : {}),
            ...(trackingUrl ? { trackingUrl } : {}),
          },
        });
        console.info(
          `[me-webhook] order.generated → Etiqueta atualizada para pedido #${order.orderNumber}`,
        );
      } catch (err) {
        console.error(
          `[me-webhook] order.generated → Falha ao buscar etiqueta para pedido #${order.orderNumber}:`,
          err,
        );
      }
      return { processed: true, orderId: order.id, action: "label_updated" };
    }

    case "order.posted": {
      // Package was posted — update tracking info and notify customer
      const updateData: Record<string, unknown> = {
        status: "SHIPPED",
      };
      if (trackingCode) updateData.trackingCode = trackingCode;
      if (trackingUrl) updateData.trackingUrl = trackingUrl;

      await prisma.order.update({
        where: { id: order.id },
        data: updateData,
      });

      console.info(
        `[me-webhook] order.posted → Pedido #${order.orderNumber} marcado como SHIPPED${trackingCode ? ` (rastreio: ${trackingCode})` : ""}`,
      );

      // Notify customer via email
      if (order.user?.email && trackingCode) {
        try {
          const { sendShippingEmail } = await import("@/lib/email");
          await sendShippingEmail(
            order.user.email,
            order.orderNumber,
            trackingCode,
            trackingUrl,
          );
          console.info(
            `[me-webhook] Email de envio disparado para pedido #${order.orderNumber}`,
          );
        } catch (err) {
          console.error(
            `[me-webhook] Falha ao enviar email de envio para pedido #${order.orderNumber}:`,
            err,
          );
        }
      }

      return { processed: true, orderId: order.id, action: "posted_notified" };
    }

    case "order.delivered": {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "DELIVERED" },
      });
      console.info(
        `[me-webhook] order.delivered → Pedido #${order.orderNumber} marcado como DELIVERED`,
      );
      return { processed: true, orderId: order.id, action: "delivered" };
    }

    case "order.cancelled": {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          melhorEnvioShipmentId: null,
          shippingLabelUrl: null,
        },
      });
      console.info(
        `[me-webhook] order.cancelled → Etiqueta removida do pedido #${order.orderNumber}`,
      );
      return { processed: true, orderId: order.id, action: "label_cancelled" };
    }

    case "order.undelivered": {
      console.warn(
        `[me-webhook] order.undelivered → Pedido #${order.orderNumber} não pôde ser entregue`,
      );
      return {
        processed: true,
        orderId: order.id,
        action: "undelivered_logged",
      };
    }

    default: {
      // order.created, order.pending, order.released, order.received, order.paused, order.suspended
      console.info(
        `[me-webhook] ${event} → Evento registrado para pedido #${order.orderNumber}`,
      );
      if (trackingCode || trackingUrl) {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            ...(trackingCode ? { trackingCode } : {}),
            ...(trackingUrl ? { trackingUrl } : {}),
          },
        });
      }
      return { processed: true, orderId: order.id, action: "event_logged" };
    }
  }
}
