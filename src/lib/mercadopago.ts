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
  const notificationUrl = runtimeConfig.notificationUrl
    ? runtimeConfig.notificationUrl
    : !isLocalEnvironmentUrl
      ? `${appUrl}/api/webhooks/mercadopago`
      : "";

  const preferenceItems = items.map((item, idx) => ({
    id: `item-${idx}`,
    title: item.title,
    quantity: item.quantity,
    unit_price: item.unit_price,
    currency_id: "BRL" as const,
  }));

  // Add shipping as an item if > 0
  if (shipping > 0) {
    preferenceItems.push({
      id: "shipping",
      title: "Frete",
      quantity: 1,
      unit_price: shipping,
      currency_id: "BRL" as const,
    });
  }

  // Add discount as negative item if > 0
  if (discount > 0) {
    preferenceItems.push({
      id: "discount",
      title: "Desconto (cupom)",
      quantity: 1,
      unit_price: -discount,
      currency_id: "BRL" as const,
    });
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

export async function refundPayment(paymentId: string) {
  const runtimeConfig = getMercadoPagoRuntimeConfig();
  const client = createMercadoPagoClient(runtimeConfig.accessToken);

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

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Falha ao reembolsar pagamento ${paymentId}: ${response.status} — ${errorBody}`,
    );
  }

  return response.json();
}
