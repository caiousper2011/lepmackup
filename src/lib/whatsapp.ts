import {
  WHATSAPP_NUMBER,
  normalizeWhatsAppNumber,
} from "@/lib/whatsapp-config";

type AddressSnapshot = {
  pickupAddress?: string;
  pickupInstructions?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  cep?: string;
};

type PaidOrderItem = {
  quantity: number;
  unitPrice: number;
  productSnapshot: unknown;
};

type PaidOrderNotificationInput = {
  id: string;
  orderNumber: number;
  status: string;
  paymentStatus: string;
  paymentId: string | null;
  paymentMethod: string | null;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  shippingMethod: string | null;
  addressSnapshot: unknown;
  createdAt: Date;
  user: {
    name: string | null;
    email: string;
    phone: string | null;
  };
  items: PaidOrderItem[];
};

function formatCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function getProductNameFromSnapshot(productSnapshot: unknown): string {
  if (!productSnapshot || typeof productSnapshot !== "object") {
    return "Produto";
  }

  const snapshot = productSnapshot as Record<string, unknown>;
  const shortName = snapshot.shortName;
  const name = snapshot.name;

  if (typeof shortName === "string" && shortName.trim()) {
    return shortName.trim();
  }

  if (typeof name === "string" && name.trim()) {
    return name.trim();
  }

  return "Produto";
}

function formatAddressBlock(
  shippingMethod: string | null,
  addressData: unknown,
): string {
  const address =
    addressData && typeof addressData === "object"
      ? (addressData as AddressSnapshot)
      : null;

  if (shippingMethod === "PICKUP_STORE") {
    const pickupAddress =
      address?.pickupAddress || "Retirada no endereço da loja";
    const pickupInstructions = address?.pickupInstructions
      ? `\nInstruções: ${address.pickupInstructions}`
      : "";

    return `📍 *Entrega*\nModo: Retirada na loja\nLocal: ${pickupAddress}${pickupInstructions}`;
  }

  if (!address) {
    return "📍 *Entrega*\nEndereço não informado no snapshot.";
  }

  const streetLine = [address.street, address.number]
    .filter(Boolean)
    .join(", ");
  const complement = address.complement
    ? `\nComplemento: ${address.complement}`
    : "";
  const neighborhood = address.neighborhood
    ? `\nBairro: ${address.neighborhood}`
    : "";
  const cityState = [address.city, address.state].filter(Boolean).join("/");
  const cityStateLine = cityState ? `\nCidade/UF: ${cityState}` : "";
  const cepLine = address.cep ? `\nCEP: ${address.cep}` : "";

  return `📍 *Entrega*\nModo: ${shippingMethod || "Envio"}\nEndereço: ${streetLine || "Não informado"}${complement}${neighborhood}${cityStateLine}${cepLine}`;
}

function buildPaidOrderMessage(order: PaidOrderNotificationInput): string {
  const createdAt = new Date(order.createdAt).toLocaleString("pt-BR");
  const itemLines = order.items.slice(0, 40).map((item, index) => {
    const productName = getProductNameFromSnapshot(item.productSnapshot);
    const itemTotal = item.quantity * item.unitPrice;
    return `${index + 1}. ${productName}\n   ${item.quantity} x ${formatCurrency(item.unitPrice)} = ${formatCurrency(itemTotal)}`;
  });

  const hiddenItemsCount = Math.max(0, order.items.length - itemLines.length);
  const extraItemsLine =
    hiddenItemsCount > 0 ? `\n... e mais ${hiddenItemsCount} item(ns)` : "";

  return [
    "✅ *Pedido pago na loja*",
    "",
    `🧾 Pedido: #${order.orderNumber}`,
    `🆔 Order ID: ${order.id}`,
    `📅 Data: ${createdAt}`,
    `📌 Status: ${order.status} / ${order.paymentStatus}`,
    `💳 Pagamento: ${order.paymentMethod || "não informado"}`,
    `🔗 Payment ID MP: ${order.paymentId || "não informado"}`,
    "",
    "👤 *Cliente*",
    `Nome: ${order.user.name || "não informado"}`,
    `E-mail: ${order.user.email}`,
    `Telefone: ${order.user.phone || "não informado"}`,
    "",
    "🛍️ *Itens*",
    ...itemLines,
    extraItemsLine,
    "",
    "💰 *Resumo financeiro*",
    `Subtotal: ${formatCurrency(order.subtotal)}`,
    `Frete: ${formatCurrency(order.shipping)}`,
    `Desconto: ${formatCurrency(order.discount)}`,
    `Total: ${formatCurrency(order.total)}`,
    "",
    formatAddressBlock(order.shippingMethod, order.addressSnapshot),
  ]
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getNotificationNumber(): string {
  const explicit = normalizeWhatsAppNumber(
    process.env.WHATSAPP_NOTIFICATION_NUMBER,
  );
  return explicit || WHATSAPP_NUMBER;
}

function getCloudApiCredentials() {
  const phoneNumberId = (
    process.env.WHATSAPP_CLOUD_PHONE_NUMBER_ID || ""
  ).trim();
  const accessToken = (process.env.WHATSAPP_CLOUD_ACCESS_TOKEN || "").trim();
  const apiVersion = (process.env.WHATSAPP_CLOUD_API_VERSION || "v21.0").trim();

  return {
    phoneNumberId,
    accessToken,
    apiVersion,
  };
}

export async function sendPaidOrderWhatsAppNotification(
  order: PaidOrderNotificationInput,
): Promise<void> {
  const { phoneNumberId, accessToken, apiVersion } = getCloudApiCredentials();
  const to = getNotificationNumber();

  if (!to) {
    console.warn("[whatsapp] Número de notificação não configurado.");
    return;
  }

  if (!phoneNumberId || !accessToken) {
    console.warn(
      "[whatsapp] Credenciais da WhatsApp Cloud API não configuradas. Defina WHATSAPP_CLOUD_PHONE_NUMBER_ID e WHATSAPP_CLOUD_ACCESS_TOKEN.",
    );
    return;
  }

  const bodyText = buildPaidOrderMessage(order);
  const endpoint = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to,
      type: "text",
      text: {
        preview_url: false,
        body: bodyText,
      },
    }),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(
      `Falha ao enviar notificação de WhatsApp (${response.status}): ${details}`,
    );
  }
}
