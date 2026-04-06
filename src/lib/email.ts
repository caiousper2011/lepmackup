import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY ?? "";
const resend = resendApiKey ? new Resend(resendApiKey) : null;
const FROM = process.env.EMAIL_FROM || "L&PMakeUp <noreply@lepmakeup.com.br>";
const RESEND_FALLBACK_FROM = "L&PMakeUp <onboarding@resend.dev>";

type EmailPayload = {
  from: string;
  to: string;
  subject: string;
  html: string;
};

export type EmailDeliveryMode = "resend" | "resend-fallback" | "simulated";

export interface EmailDeliveryInfo {
  mode: EmailDeliveryMode;
  from: string;
}

function canUseResend() {
  return (
    resend &&
    resendApiKey.startsWith("re_") &&
    !resendApiKey.includes("xxxxxxxx")
  );
}

async function sendEmail(payload: EmailPayload): Promise<EmailDeliveryInfo> {
  if (!canUseResend()) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[email:dev] RESEND_API_KEY não configurada. E-mail simulado para ${payload.to} (${payload.subject})`,
      );
      return { mode: "simulated", from: payload.from };
    }

    throw new Error("RESEND_API_KEY não configurada");
  }

  try {
    await resend!.emails.send(payload);
    return { mode: "resend", from: payload.from };
  } catch (error) {
    const isAlreadyUsingFallback = payload.from
      .toLowerCase()
      .includes("onboarding@resend.dev");

    if (isAlreadyUsingFallback) {
      throw error;
    }

    console.warn(
      `[email] Falha ao enviar com remetente \"${payload.from}\". Tentando fallback \"${RESEND_FALLBACK_FROM}\".`,
    );

    await resend!.emails.send({
      ...payload,
      from: RESEND_FALLBACK_FROM,
    });

    return { mode: "resend-fallback", from: RESEND_FALLBACK_FROM };
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

export async function sendShippingEmail(
  to: string,
  orderNumber: number,
  trackingCode: string,
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
      </div>
    `,
  });
}
