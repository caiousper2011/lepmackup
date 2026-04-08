import { MercadoPagoConfig, Payment, Preference } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "",
});

export const payment = new Payment(client);
export const preference = new Preference(client);
export { client as mercadoPagoClient };

const TEST_USER_EMAIL_REGEX = /@testuser\.com$/i;

export class MercadoPagoConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MercadoPagoConfigurationError";
  }
}

function getTokenOwnerUserId(accessToken: string): string | null {
  const match = accessToken.trim().match(/-(\d+)$/);
  return match?.[1] || null;
}

function validateMercadoPagoTestMode(payerEmail: string, accessToken: string) {
  const requiredSellerUserId =
    process.env.MERCADOPAGO_TEST_SELLER_USER_ID?.trim() || "";
  const forcedTestPayerEmail =
    process.env.MERCADOPAGO_TEST_PAYER_EMAIL?.trim() || "";

  if (
    forcedTestPayerEmail &&
    !TEST_USER_EMAIL_REGEX.test(forcedTestPayerEmail)
  ) {
    throw new MercadoPagoConfigurationError(
      "MERCADOPAGO_TEST_PAYER_EMAIL deve terminar com @testuser.com.",
    );
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
        "Não foi possível identificar o vendedor no MERCADOPAGO_ACCESS_TOKEN. Verifique o token TEST.",
      );
    }

    if (tokenOwnerUserId !== requiredSellerUserId) {
      throw new MercadoPagoConfigurationError(
        `MERCADOPAGO_ACCESS_TOKEN está vinculado ao vendedor ${tokenOwnerUserId}, mas o esperado é ${requiredSellerUserId}. Gere credenciais TEST do vendedor correto no painel Mercado Pago Developers.`,
      );
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
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || "";
  const isTestMode = accessToken.startsWith("TEST-");
  const { effectivePayerEmail, tokenOwnerUserId, requiredSellerUserId } =
    isTestMode
      ? validateMercadoPagoTestMode(payer.email, accessToken)
      : {
          effectivePayerEmail: payer.email,
          tokenOwnerUserId: getTokenOwnerUserId(accessToken),
          requiredSellerUserId: "",
        };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const isLocalEnvironmentUrl = /localhost|127\.0\.0\.1|\[::1\]/i.test(appUrl);
  const notificationUrlFromEnv =
    process.env.MERCADOPAGO_NOTIFICATION_URL?.trim() || "";
  const notificationUrl = notificationUrlFromEnv
    ? notificationUrlFromEnv
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
    notification_url: notificationUrl,
  };

  const result = await preference.create({
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
    token_owner_user_id: tokenOwnerUserId,
    required_seller_user_id: requiredSellerUserId || null,
    payer_email_used: effectivePayerEmail,
  };
}

export async function getPaymentById(paymentId: string) {
  return payment.get({ id: paymentId });
}
