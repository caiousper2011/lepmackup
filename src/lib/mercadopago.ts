import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

type MercadoPagoMode = "test" | "production";

export interface MercadoPagoRuntimeConfig {
  mode: MercadoPagoMode;
  accessToken: string;
  publicKey: string;
  webhookSecret: string;
  notificationUrl: string;
  tokenOwnerUserId: string | null;
  clientId: string;
  clientSecret: string;
}

const TEST_USER_EMAIL_REGEX = /@testuser\.com$/i;

export class MercadoPagoConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MercadoPagoConfigurationError";
  }
}

function cleanEnv(value: string | undefined): string {
  return (value || "").trim();
}

function resolvePreferredMode(): MercadoPagoMode {
  const explicitMode = cleanEnv(process.env.MERCADOPAGO_MODE).toLowerCase();

  if (explicitMode === "test") return "test";
  if (explicitMode === "production" || explicitMode === "prod") {
    return "production";
  }

  return process.env.NODE_ENV === "production" ? "production" : "test";
}

function normalizeNotificationUrl(url: string): string {
  return url.replace(/\/$/, "");
}

function getTokenOwnerUserId(accessToken: string): string | null {
  const match = accessToken.trim().match(/-(\d+)$/);
  return match?.[1] || null;
}

export function getMercadoPagoRuntimeConfig(): MercadoPagoRuntimeConfig {
  const preferredMode = resolvePreferredMode();

  const legacyAccessToken = cleanEnv(process.env.MERCADOPAGO_ACCESS_TOKEN);
  const legacyPublicKey = cleanEnv(
    process.env.MERCADOPAGO_PUBLIC_KEY ||
      process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY,
  );
  const legacyWebhookSecret = cleanEnv(process.env.MERCADOPAGO_WEBHOOK_SECRET);
  const legacyNotificationUrl = cleanEnv(
    process.env.MERCADOPAGO_NOTIFICATION_URL,
  );

  const testAccessToken =
    cleanEnv(process.env.MERCADOPAGO_TEST_ACCESS_TOKEN) || legacyAccessToken;
  const prodAccessToken = cleanEnv(process.env.MERCADOPAGO_PROD_ACCESS_TOKEN);

  const testPublicKey = cleanEnv(
    process.env.MERCADOPAGO_TEST_PUBLIC_KEY ||
      process.env.NEXT_PUBLIC_MERCADOPAGO_TEST_PUBLIC_KEY,
  );
  const prodPublicKey = cleanEnv(
    process.env.MERCADOPAGO_PROD_PUBLIC_KEY ||
      process.env.NEXT_PUBLIC_MERCADOPAGO_PROD_PUBLIC_KEY,
  );

  const testWebhookSecret = cleanEnv(
    process.env.MERCADOPAGO_TEST_WEBHOOK_SECRET,
  );
  const prodWebhookSecret = cleanEnv(
    process.env.MERCADOPAGO_PROD_WEBHOOK_SECRET,
  );

  const testNotificationUrl = cleanEnv(
    process.env.MERCADOPAGO_TEST_NOTIFICATION_URL,
  );
  const prodNotificationUrl = cleanEnv(
    process.env.MERCADOPAGO_PROD_NOTIFICATION_URL,
  );

  const testClientId = cleanEnv(process.env.MERCADOPAGO_CLIENT_ID);
  const prodClientId = cleanEnv(process.env.MERCADOPAGO_PROD_CLIENT_ID);

  const testClientSecret = cleanEnv(process.env.MERCADOPAGO_CLIENT_SECRET);
  const prodClientSecret = cleanEnv(process.env.MERCADOPAGO_PROD_CLIENT_SECRET);

  const selectedMode: MercadoPagoMode =
    preferredMode === "production"
      ? prodAccessToken
        ? "production"
        : "test"
      : testAccessToken
        ? "test"
        : "production";

  const selectedAccessToken =
    selectedMode === "production" ? prodAccessToken : testAccessToken;

  if (!selectedAccessToken) {
    throw new MercadoPagoConfigurationError(
      "Credenciais do Mercado Pago não configuradas. Defina MERCADOPAGO_TEST_ACCESS_TOKEN e/ou MERCADOPAGO_PROD_ACCESS_TOKEN.",
    );
  }

  const selectedPublicKey =
    selectedMode === "production"
      ? prodPublicKey || legacyPublicKey
      : testPublicKey || legacyPublicKey;

  const selectedWebhookSecret =
    selectedMode === "production"
      ? prodWebhookSecret || legacyWebhookSecret
      : testWebhookSecret || legacyWebhookSecret;

  const selectedNotificationUrl =
    selectedMode === "production"
      ? prodNotificationUrl || legacyNotificationUrl
      : testNotificationUrl || legacyNotificationUrl;

  const selectedClientId =
    selectedMode === "production"
      ? prodClientId || testClientId
      : testClientId || prodClientId;

  const selectedClientSecret =
    selectedMode === "production"
      ? prodClientSecret || testClientSecret
      : testClientSecret || prodClientSecret;

  return {
    mode: selectedMode,
    accessToken: selectedAccessToken,
    publicKey: selectedPublicKey,
    webhookSecret: selectedWebhookSecret,
    notificationUrl: normalizeNotificationUrl(selectedNotificationUrl),
    tokenOwnerUserId: getTokenOwnerUserId(selectedAccessToken),
    clientId: selectedClientId,
    clientSecret: selectedClientSecret,
  };
}

function createMercadoPagoClient(accessToken: string): MercadoPagoConfig {
  return new MercadoPagoConfig({ accessToken });
}

function isStrictMercadoPagoTestValidationEnabled(): boolean {
  const raw = cleanEnv(
    process.env.MERCADOPAGO_TEST_STRICT_VALIDATION,
  ).toLowerCase();

  return raw === "1" || raw === "true" || raw === "yes";
}

function validateMercadoPagoTestMode(payerEmail: string, accessToken: string) {
  const strictValidation = isStrictMercadoPagoTestValidationEnabled();
  const requiredSellerUserId =
    process.env.MERCADOPAGO_TEST_SELLER_USER_ID?.trim() || "";
  const forcedTestPayerEmailRaw =
    process.env.MERCADOPAGO_TEST_PAYER_EMAIL?.trim() || "";
  const forcedTestPayerEmail =
    forcedTestPayerEmailRaw &&
    TEST_USER_EMAIL_REGEX.test(forcedTestPayerEmailRaw)
      ? forcedTestPayerEmailRaw
      : "";

  if (forcedTestPayerEmailRaw && !forcedTestPayerEmail) {
    const message =
      "MERCADOPAGO_TEST_PAYER_EMAIL deve terminar com @testuser.com.";

    if (strictValidation) {
      throw new MercadoPagoConfigurationError(message);
    }

    console.warn(`[mercadopago] ${message} Ignorando valor configurado.`);
  }

  const effectivePayerEmail = forcedTestPayerEmail || payerEmail;

  if (!TEST_USER_EMAIL_REGEX.test(effectivePayerEmail)) {
    throw new MercadoPagoConfigurationError(
      "No modo TEST, o comprador precisa ser um usuário de teste (@testuser.com). Configure MERCADOPAGO_TEST_PAYER_EMAIL ou use login de comprador de teste.",
    );
  }

  const tokenOwnerUserId = getTokenOwnerUserId(accessToken);

  if (requiredSellerUserId) {
    if (!tokenOwnerUserId) {
      throw new MercadoPagoConfigurationError(
        "Não foi possível identificar o vendedor no token ativo do Mercado Pago. Verifique MERCADOPAGO_TEST_ACCESS_TOKEN.",
      );
    }

    if (tokenOwnerUserId !== requiredSellerUserId) {
      const message = `O token ativo está vinculado ao vendedor ${tokenOwnerUserId}, mas o esperado é ${requiredSellerUserId}. Gere credenciais TEST do vendedor correto no painel Mercado Pago Developers.`;

      if (strictValidation) {
        throw new MercadoPagoConfigurationError(message);
      }

      console.warn(`[mercadopago] ${message}`);
    }
  }

  return {
    effectivePayerEmail,
    tokenOwnerUserId,
    requiredSellerUserId,
  };
}

export interface CreatePreferenceItem {
  title: string;
  quantity: number;
  unit_price: number;
  currency_id?: string;
}

export async function createPaymentPreference(
  items: CreatePreferenceItem[],
  payer: { email: string; name?: string },
  externalReference: string,
  shipping: number = 0,
  discount: number = 0,
) {
  const runtimeConfig = getMercadoPagoRuntimeConfig();
  const isTestMode = runtimeConfig.mode === "test";

  const { effectivePayerEmail, tokenOwnerUserId, requiredSellerUserId } =
    isTestMode
      ? validateMercadoPagoTestMode(payer.email, runtimeConfig.accessToken)
      : {
          effectivePayerEmail: payer.email,
          tokenOwnerUserId: runtimeConfig.tokenOwnerUserId,
          requiredSellerUserId: "",
        };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const isLocalEnvironmentUrl = /localhost|127\.0\.0\.1|\[::1\]/i.test(appUrl);

  if (!isTestMode && !isLocalEnvironmentUrl && !appUrl.startsWith("https://")) {
    console.error(
      "[mercadopago] AVISO: NEXT_PUBLIC_APP_URL não usa HTTPS em modo produção. " +
        "O Mercado Pago exige back_urls com HTTPS. Valor atual: " +
        appUrl,
    );
  }
  const notificationUrl = runtimeConfig.notificationUrl
    ? runtimeConfig.notificationUrl
    : !isLocalEnvironmentUrl
      ? `${appUrl}/api/webhooks/mercadopago`
      : "";

  // Round all unit prices to 2 decimal places to avoid floating-point issues
  // with Mercado Pago's API (which requires exact numeric values)
  const preferenceItems = items.map((item, idx) => ({
    id: `item-${idx}`,
    title: item.title,
    quantity: item.quantity,
    unit_price: Math.round(item.unit_price * 100) / 100,
    currency_id: "BRL" as const,
  }));

  // Add shipping as a positive item if > 0
  if (shipping > 0) {
    preferenceItems.push({
      id: "shipping",
      title: "Frete",
      quantity: 1,
      unit_price: Math.round(shipping * 100) / 100,
      currency_id: "BRL" as const,
    });
  }

  // Apply discount by distributing it proportionally across all items.
  // Mercado Pago Checkout Pro Brazil requires unit_price > 0 — negative-price
  // items trigger the CPT01 error in the checkout UI. We reduce each item's
  // unit_price proportionally so the preference total equals the expected
  // order total (subtotal + shipping - discount).
  if (discount > 0) {
    const totalBeforeDiscount = preferenceItems.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0,
    );

    if (totalBeforeDiscount > 0 && discount < totalBeforeDiscount) {
      const discountRatio = discount / totalBeforeDiscount;

      // Reduce each item's unit_price proportionally (keep positives only)
      for (let i = 0; i < preferenceItems.length; i++) {
        preferenceItems[i] = {
          ...preferenceItems[i],
          unit_price: Math.max(
            0.01,
            Math.round(
              preferenceItems[i].unit_price * (1 - discountRatio) * 100,
            ) / 100,
          ),
        };
      }

      // Correct for any rounding difference by adjusting the first item
      const actualTotal = preferenceItems.reduce(
        (sum, item) => sum + item.quantity * item.unit_price,
        0,
      );
      const expectedTotal =
        Math.round((totalBeforeDiscount - discount) * 100) / 100;
      const roundingDiff =
        Math.round((expectedTotal - actualTotal) * 100) / 100;

      if (Math.abs(roundingDiff) >= 0.01 && preferenceItems.length > 0) {
        preferenceItems[0] = {
          ...preferenceItems[0],
          unit_price: Math.max(
            0.01,
            Math.round((preferenceItems[0].unit_price + roundingDiff) * 100) /
              100,
          ),
        };
      }
    }
  }

  const preferenceBody = {
    items: preferenceItems,
    payer: {
      email: effectivePayerEmail,
      name: payer.name,
    },
    external_reference: externalReference,
    back_urls: {
      success: `${appUrl}/pedido/${externalReference}/confirmacao?status=approved`,
      failure: `${appUrl}/pedido/${externalReference}/confirmacao?status=failure`,
      pending: `${appUrl}/pedido/${externalReference}/confirmacao?status=pending`,
    },
    statement_descriptor: "LEPMAKEUP",
    auto_return: "approved" as const,
    metadata: {
      order_id: externalReference,
      mode: runtimeConfig.mode,
    },
    ...(notificationUrl ? { notification_url: notificationUrl } : {}),
  };

  const preferenceClient = new Preference(
    createMercadoPagoClient(runtimeConfig.accessToken),
  );

  const result = await preferenceClient.create({
    body: preferenceBody,
  });

  const parsedResult = result as unknown as {
    id?: string;
    init_point?: string | null;
    sandbox_init_point?: string | null;
  };

  // Mesmo em TEST, priorizamos a URL produtiva retornada pela API para evitar
  // inconsistências entre contas/credenciais de teste e fluxo de pagamento.
  const checkoutUrl =
    parsedResult.init_point || parsedResult.sandbox_init_point || null;

  return {
    ...result,
    checkout_url: checkoutUrl,
    mode: runtimeConfig.mode,
    notification_url: notificationUrl || null,
    token_owner_user_id: tokenOwnerUserId,
    required_seller_user_id: requiredSellerUserId || null,
    payer_email_used: effectivePayerEmail,
  };
}

export async function getPaymentById(paymentId: string) {
  const runtimeConfig = getMercadoPagoRuntimeConfig();
  const paymentClient = new Payment(
    createMercadoPagoClient(runtimeConfig.accessToken),
  );

  return paymentClient.get({ id: paymentId });
}

interface MercadoPagoPaymentSearchResult {
  id?: string | number;
  status?: string;
}

export async function findPaymentIdByExternalReference(
  externalReference: string,
  preferredStatuses: string[] = ["approved"],
) {
  const runtimeConfig = getMercadoPagoRuntimeConfig();

  const searchUrl = new URL("https://api.mercadopago.com/v1/payments/search");
  searchUrl.searchParams.set("external_reference", externalReference);
  searchUrl.searchParams.set("sort", "date_created");
  searchUrl.searchParams.set("criteria", "desc");
  searchUrl.searchParams.set("limit", "10");

  const response = await fetch(searchUrl, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${runtimeConfig.accessToken}`,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Falha ao buscar pagamentos da referência ${externalReference}: ${response.status} — ${errorBody}`,
    );
  }

  const data = (await response.json()) as {
    results?: MercadoPagoPaymentSearchResult[];
  };

  const results = Array.isArray(data.results) ? data.results : [];
  if (results.length === 0) return null;

  const normalizedPreferredStatuses = preferredStatuses
    .map((status) => status.trim().toLowerCase())
    .filter(Boolean);

  if (normalizedPreferredStatuses.length > 0) {
    const preferredMatch = results.find((item) => {
      const normalizedStatus = (item.status || "").trim().toLowerCase();
      return (
        item.id !== undefined &&
        item.id !== null &&
        normalizedPreferredStatuses.includes(normalizedStatus)
      );
    });

    return preferredMatch ? String(preferredMatch.id).trim() : null;
  }

  const fallbackMatch = results.find(
    (item) => item.id !== undefined && item.id !== null,
  );

  return fallbackMatch ? String(fallbackMatch.id).trim() : null;
}

export interface RefundResult {
  ok: boolean;
  alreadyRefunded?: boolean;
  status: number;
  message: string;
  data?: unknown;
}

export async function refundPayment(paymentId: string): Promise<RefundResult> {
  const runtimeConfig = getMercadoPagoRuntimeConfig();

  const response = await fetch(
    `https://api.mercadopago.com/v1/payments/${paymentId}/refunds`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${runtimeConfig.accessToken}`,
      },
      body: JSON.stringify({}),
    },
  );

  if (response.ok) {
    const data = await response.json();
    return { ok: true, status: response.status, message: "Reembolso criado.", data };
  }

  const errorBody = await response.text();

  // MP returns 400/409 when payment is already refunded or status doesn't allow it
  const alreadyRefundedPatterns = [
    "already_refunded",
    "refunded",
    "cannot_refund",
    "status does not allow",
    "amount_exceeded",
  ];
  const lowerError = errorBody.toLowerCase();
  const alreadyRefunded = alreadyRefundedPatterns.some((p) =>
    lowerError.includes(p),
  );

  console.error(
    `[refundPayment] paymentId=${paymentId} status=${response.status} body=${errorBody}`,
  );

  return {
    ok: false,
    alreadyRefunded,
    status: response.status,
    message: `Reembolso falhou (${response.status}): ${errorBody}`,
  };
}
