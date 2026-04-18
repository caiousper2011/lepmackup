import sgMail from "@sendgrid/mail";

const sendGridApiKey = process.env.SENDGRID_API_KEY?.trim() ?? "";
if (sendGridApiKey) {
  sgMail.setApiKey(sendGridApiKey);
}
const FROM = process.env.EMAIL_FROM || "L&PMakeUp <noreply@lepmakeup.com.br>";

type EmailPayload = {
  from: string;
  to: string;
  subject: string;
  html: string;
};

type SendGridApiErrorDetail = {
  message?: string;
  field?: string;
  help?: string;
};

type SendGridLikeError = Error & {
  code?: number;
  response?: {
    body?: {
      errors?: SendGridApiErrorDetail[];
    };
  };
};

export type EmailDeliveryMode = "sendgrid";

export interface EmailDeliveryInfo {
  mode: EmailDeliveryMode;
  from: string;
}

function assertSendGridConfigured() {
  if (!sendGridApiKey) {
    throw new Error("SENDGRID_API_KEY não configurada");
  }
}

function mapSendGridError(error: unknown): Error {
  const sendGridError = error as SendGridLikeError;
  const statusCode = sendGridError?.code;
  const details = sendGridError?.response?.body?.errors ?? [];
  const detailsText = details
    .map((item) => item.message)
    .filter((value): value is string => Boolean(value))
    .join(" | ");

  if (statusCode === 403) {
    const lowerDetails = detailsText.toLowerCase();

    if (lowerDetails.includes("sender identity")) {
      return new Error(
        "SENDGRID_FORBIDDEN: EMAIL_FROM não está verificado no SendGrid (Single Sender ou Domain Authentication).",
      );
    }

    return new Error(
      "SENDGRID_FORBIDDEN: API Key sem permissão de Mail Send ou conta/billing bloqueado no SendGrid.",
    );
  }

  if (statusCode === 401) {
    return new Error("SENDGRID_UNAUTHORIZED: API Key inválida ou revogada.");
  }

  if (detailsText) {
    return new Error(`SENDGRID_ERROR: ${detailsText}`);
  }

  if (sendGridError instanceof Error) {
    return sendGridError;
  }

  return new Error("SENDGRID_ERROR: Falha desconhecida ao enviar e-mail.");
}

async function sendEmail(payload: EmailPayload): Promise<EmailDeliveryInfo> {
  assertSendGridConfigured();

  try {
    await sgMail.send(payload);
    return { mode: "sendgrid", from: payload.from };
  } catch (error: unknown) {
    const mappedError = mapSendGridError(error);
    console.error(
      `[email] Falha ao enviar via SendGrid para ${payload.to} (${payload.subject})`,
      mappedError.message,
      (error as SendGridLikeError)?.response?.body,
    );
    throw mappedError;
  }
}

export async function sendOTPEmail(to: string, code: string) {
  return sendEmail({
    from: FROM,
    to,
    subject: `Seu código de acesso L&PMakeUp: ${code}`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background: linear-gradient(135deg, #f43f5e, #ec4899); border-radius: 50%; width: 56px; height: 56px; line-height: 56px; color: white; font-weight: bold; font-size: 18px;">L&P</div>
        </div>
        <h2 style="text-align: center; color: #1a1a2e; margin-bottom: 8px;">Seu código de acesso</h2>
        <p style="text-align: center; color: #666; font-size: 14px; margin-bottom: 24px;">
          Use o código abaixo para acessar sua conta na L&PMakeUp.
        </p>
        <div style="background: #fff1f2; border: 2px solid #fecdd3; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #e11d48;">${code}</span>
        </div>
        <p style="text-align: center; color: #999; font-size: 12px;">
          Este código expira em <strong>10 minutos</strong>.<br/>
          Se você não solicitou este código, ignore este e-mail.
        </p>
        <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 24px 0;" />
        <p style="text-align: center; color: #ccc; font-size: 11px;">
          L&PMakeUp — Maquiagem Profissional
        </p>
      </div>
    `,
  });
}

export async function sendOrderConfirmationEmail(
  to: string,
  orderNumber: number,
  total: number,
) {
  await sendEmail({
    from: FROM,
    to,
    subject: `Pedido #${orderNumber} confirmado! — L&PMakeUp`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background: linear-gradient(135deg, #f43f5e, #ec4899); border-radius: 50%; width: 56px; height: 56px; line-height: 56px; color: white; font-weight: bold; font-size: 18px;">L&P</div>
        </div>
        <h2 style="text-align: center; color: #1a1a2e;">Pedido Confirmado! 🎉</h2>
        <p style="text-align: center; color: #666; font-size: 14px;">
          Seu pedido <strong>#${orderNumber}</strong> foi recebido com sucesso.
        </p>
        <div style="background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
          <p style="margin: 0; color: #166534; font-size: 14px;">Total do pedido</p>
          <p style="margin: 4px 0 0; font-size: 28px; font-weight: bold; color: #166534;">R$ ${total.toFixed(2)}</p>
        </div>
        <p style="text-align: center; color: #666; font-size: 14px;">
          Acompanhe seu pedido na sua área de cliente.
        </p>
        <div style="text-align: center; margin-top: 24px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/minha-conta/pedidos" style="display: inline-block; background: linear-gradient(135deg, #f43f5e, #ec4899); color: white; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px;">Ver Meus Pedidos</a>
        </div>
      </div>
    `,
  });
}

export async function sendPaymentApprovedEmail(
  to: string,
  orderNumber: number,
) {
  await sendEmail({
    from: FROM,
    to,
    subject: `Pagamento aprovado — Pedido #${orderNumber} | L&PMakeUp`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="text-align: center; color: #166534;">✅ Pagamento Aprovado!</h2>
        <p style="text-align: center; color: #666;">O pagamento do pedido <strong>#${orderNumber}</strong> foi aprovado. Estamos preparando seu envio!</p>
      </div>
    `,
  });
}

type AdminNotificationAddress = {
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

type AdminNotificationItem = {
  quantity: number;
  unitPrice: number;
  productSnapshot: unknown;
};

export interface PaidOrderAdminNotification {
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
  items: AdminNotificationItem[];
}

function formatAdminCurrency(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function getAdminProductName(productSnapshot: unknown): string {
  if (!productSnapshot || typeof productSnapshot !== "object") {
    return "Produto";
  }
  const snapshot = productSnapshot as Record<string, unknown>;
  const shortName = snapshot.shortName;
  const name = snapshot.name;
  if (typeof shortName === "string" && shortName.trim()) return shortName.trim();
  if (typeof name === "string" && name.trim()) return name.trim();
  return "Produto";
}

function formatAdminAddress(
  shippingMethod: string | null,
  addressData: unknown,
): string {
  const address =
    addressData && typeof addressData === "object"
      ? (addressData as AdminNotificationAddress)
      : null;

  if (shippingMethod === "PICKUP_STORE") {
    const pickupAddress =
      address?.pickupAddress || "Retirada no endereço da loja";
    const pickupInstructions = address?.pickupInstructions
      ? `<br/><strong>Instruções:</strong> ${address.pickupInstructions}`
      : "";
    return `<strong>Modo:</strong> Retirada na loja<br/><strong>Local:</strong> ${pickupAddress}${pickupInstructions}`;
  }

  if (!address) {
    return "Endereço não informado no snapshot.";
  }

  const streetLine = [address.street, address.number].filter(Boolean).join(", ");
  const complement = address.complement
    ? `<br/><strong>Complemento:</strong> ${address.complement}`
    : "";
  const neighborhood = address.neighborhood
    ? `<br/><strong>Bairro:</strong> ${address.neighborhood}`
    : "";
  const cityState = [address.city, address.state].filter(Boolean).join("/");
  const cityStateLine = cityState
    ? `<br/><strong>Cidade/UF:</strong> ${cityState}`
    : "";
  const cepLine = address.cep ? `<br/><strong>CEP:</strong> ${address.cep}` : "";

  return `<strong>Modo:</strong> ${shippingMethod || "Envio"}<br/><strong>Endereço:</strong> ${streetLine || "Não informado"}${complement}${neighborhood}${cityStateLine}${cepLine}`;
}

export async function sendPaidOrderAdminNotificationEmail(
  order: PaidOrderAdminNotification,
): Promise<void> {
  const to = (process.env.ADMIN_NOTIFICATION_EMAIL || "").trim();
  if (!to) {
    console.warn(
      "[email] ADMIN_NOTIFICATION_EMAIL não configurado. Pulando aviso interno de pedido pago.",
    );
    return;
  }

  const createdAt = new Date(order.createdAt).toLocaleString("pt-BR");
  const itemsRows = order.items
    .slice(0, 40)
    .map((item, index) => {
      const productName = getAdminProductName(item.productSnapshot);
      const itemTotal = item.quantity * item.unitPrice;
      return `
        <tr>
          <td style="padding: 6px 8px; border-bottom: 1px solid #eee; font-size: 13px;">${index + 1}. ${productName}</td>
          <td style="padding: 6px 8px; border-bottom: 1px solid #eee; font-size: 13px; text-align: center;">${item.quantity}</td>
          <td style="padding: 6px 8px; border-bottom: 1px solid #eee; font-size: 13px; text-align: right;">${formatAdminCurrency(item.unitPrice)}</td>
          <td style="padding: 6px 8px; border-bottom: 1px solid #eee; font-size: 13px; text-align: right;"><strong>${formatAdminCurrency(itemTotal)}</strong></td>
        </tr>
      `;
    })
    .join("");

  const hiddenItemsCount = Math.max(0, order.items.length - 40);
  const extraItemsRow =
    hiddenItemsCount > 0
      ? `<tr><td colspan="4" style="padding: 6px 8px; font-size: 12px; color: #777; font-style: italic;">... e mais ${hiddenItemsCount} item(ns)</td></tr>`
      : "";

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 640px; margin: 0 auto; padding: 24px; color: #1a1a2e;">
      <h2 style="margin: 0 0 4px; color: #166534;">✅ Novo pedido pago</h2>
      <p style="margin: 0 0 24px; color: #666; font-size: 14px;">Um cliente concluiu o pagamento. Prepare o envio.</p>

      <div style="background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 14px;"><strong>Pedido:</strong> #${order.orderNumber}</p>
        <p style="margin: 4px 0 0; font-size: 13px;"><strong>Order ID:</strong> ${order.id}</p>
        <p style="margin: 4px 0 0; font-size: 13px;"><strong>Data:</strong> ${createdAt}</p>
        <p style="margin: 4px 0 0; font-size: 13px;"><strong>Status:</strong> ${order.status} / ${order.paymentStatus}</p>
        <p style="margin: 4px 0 0; font-size: 13px;"><strong>Pagamento:</strong> ${order.paymentMethod || "não informado"}</p>
        <p style="margin: 4px 0 0; font-size: 13px;"><strong>Payment ID MP:</strong> ${order.paymentId || "não informado"}</p>
      </div>

      <h3 style="margin: 0 0 8px; font-size: 15px;">👤 Cliente</h3>
      <div style="background: #f9fafb; border-radius: 10px; padding: 12px 14px; font-size: 13px; margin-bottom: 20px;">
        <p style="margin: 0;"><strong>Nome:</strong> ${order.user.name || "não informado"}</p>
        <p style="margin: 4px 0 0;"><strong>E-mail:</strong> ${order.user.email}</p>
        <p style="margin: 4px 0 0;"><strong>Telefone:</strong> ${order.user.phone || "não informado"}</p>
      </div>

      <h3 style="margin: 0 0 8px; font-size: 15px;">🛍️ Itens</h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background: #f9fafb;">
            <th style="padding: 8px; text-align: left; font-size: 12px; color: #666;">Produto</th>
            <th style="padding: 8px; text-align: center; font-size: 12px; color: #666;">Qtd</th>
            <th style="padding: 8px; text-align: right; font-size: 12px; color: #666;">Unit.</th>
            <th style="padding: 8px; text-align: right; font-size: 12px; color: #666;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsRows}
          ${extraItemsRow}
        </tbody>
      </table>

      <h3 style="margin: 0 0 8px; font-size: 15px;">💰 Resumo financeiro</h3>
      <div style="background: #f9fafb; border-radius: 10px; padding: 12px 14px; font-size: 13px; margin-bottom: 20px;">
        <p style="margin: 0;"><strong>Subtotal:</strong> ${formatAdminCurrency(order.subtotal)}</p>
        <p style="margin: 4px 0 0;"><strong>Frete:</strong> ${formatAdminCurrency(order.shipping)}</p>
        <p style="margin: 4px 0 0;"><strong>Desconto:</strong> ${formatAdminCurrency(order.discount)}</p>
        <p style="margin: 8px 0 0; font-size: 15px;"><strong>Total:</strong> ${formatAdminCurrency(order.total)}</p>
      </div>

      <h3 style="margin: 0 0 8px; font-size: 15px;">📍 Entrega</h3>
      <div style="background: #f9fafb; border-radius: 10px; padding: 12px 14px; font-size: 13px;">
        ${formatAdminAddress(order.shippingMethod, order.addressSnapshot)}
      </div>
    </div>
  `;

  await sendEmail({
    from: FROM,
    to,
    subject: `🛒 Novo pedido pago #${order.orderNumber} — preparar envio`,
    html,
  });
}

export async function sendShippingEmail(
  to: string,
  orderNumber: number,
  trackingCode: string,
  trackingUrl?: string | null,
) {
  await sendEmail({
    from: FROM,
    to,
    subject: `Pedido #${orderNumber} enviado! 📦 | L&PMakeUp`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <h2 style="text-align: center; color: #1a1a2e;">📦 Pedido Enviado!</h2>
        <p style="text-align: center; color: #666;">Seu pedido <strong>#${orderNumber}</strong> está a caminho!</p>
        ${trackingCode ? `<div style="background: #eff6ff; border: 2px solid #bfdbfe; border-radius: 12px; padding: 16px; text-align: center; margin: 24px 0;"><p style="margin: 0; color: #1e40af; font-size: 13px;">Código de rastreio</p><p style="margin: 4px 0 0; font-size: 20px; font-weight: bold; color: #1e40af;">${trackingCode}</p></div>` : ""}
        ${trackingUrl ? `<div style="text-align: center; margin-top: 12px;"><a href="${trackingUrl}" style="display: inline-block; background: #2563eb; color: white; padding: 10px 18px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 13px;">Acompanhar entrega</a></div>` : ""}
      </div>
    `,
  });
}

export async function sendOrderCancellationEmail(
  to: string,
  orderNumber: number,
  total: number,
  wasRefunded: boolean,
) {
  await sendEmail({
    from: FROM,
    to,
    subject: `Pedido #${orderNumber} cancelado — L&PMakeUp`,
    html: `
      <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-block; background: linear-gradient(135deg, #f43f5e, #ec4899); border-radius: 50%; width: 56px; height: 56px; line-height: 56px; color: white; font-weight: bold; font-size: 18px;">L&P</div>
        </div>
        <h2 style="text-align: center; color: #1a1a2e;">Pedido Cancelado</h2>
        <p style="text-align: center; color: #666; font-size: 14px; line-height: 1.6;">
          Pedimos sinceras desculpas, mas infelizmente o pedido <strong>#${orderNumber}</strong> foi cancelado.
        </p>
        ${
          wasRefunded
            ? `
        <div style="background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
          <p style="margin: 0; color: #166534; font-size: 14px;">Reembolso processado</p>
          <p style="margin: 4px 0 0; font-size: 24px; font-weight: bold; color: #166534;">R$ ${total.toFixed(2)}</p>
          <p style="margin: 8px 0 0; color: #166534; font-size: 12px;">O valor será devolvido ao seu meio de pagamento original em até 10 dias úteis.</p>
        </div>
        `
            : `
        <div style="background: #fef3c7; border: 2px solid #fde68a; border-radius: 12px; padding: 16px; text-align: center; margin: 24px 0;">
          <p style="margin: 0; color: #92400e; font-size: 13px;">O pedido foi cancelado antes do pagamento ser confirmado. Nenhuma cobrança será realizada.</p>
        </div>
        `
        }
        <p style="text-align: center; color: #666; font-size: 14px; line-height: 1.6;">
          Lamentamos o transtorno. Se tiver alguma dúvida, entre em contato conosco pelo WhatsApp.
        </p>
        <div style="text-align: center; margin-top: 24px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://lpmakeup.com.br"}/" style="display: inline-block; background: linear-gradient(135deg, #f43f5e, #ec4899); color: white; padding: 12px 32px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 14px;">Voltar à Loja</a>
        </div>
        <hr style="border: none; border-top: 1px solid #f0f0f0; margin: 24px 0;" />
        <p style="text-align: center; color: #ccc; font-size: 11px;">
          L&PMakeUp — Maquiagem Profissional
        </p>
      </div>
    `,
  });
}
