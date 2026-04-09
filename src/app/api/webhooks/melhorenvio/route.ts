import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import {
  processMelhorEnvioWebhookEvent,
  type MelhorEnvioWebhookPayload,
} from "@/lib/shipping";

function getAppSecret(): string {
  return (process.env.MELHOR_ENVIO_APP_SECRET || "").trim();
}

function verifySignature(
  body: string,
  signatureHeader: string | null,
): boolean {
  const secret = getAppSecret();

  // If no secret configured, skip verification (dev/sandbox)
  if (!secret) {
    console.warn(
      "[me-webhook] MELHOR_ENVIO_APP_SECRET não configurado — verificação de assinatura desativada.",
    );
    return true;
  }

  if (!signatureHeader) {
    console.warn("[me-webhook] Webhook recebido sem header X-ME-Signature.");
    return false;
  }

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("base64");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature),
      Buffer.from(signatureHeader),
    );
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  // Verify HMAC-SHA256 signature
  const signature = request.headers.get("x-me-signature");
  if (!verifySignature(rawBody, signature)) {
    console.error("[me-webhook] Assinatura inválida — rejeitando webhook.");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: MelhorEnvioWebhookPayload;
  try {
    payload = JSON.parse(rawBody) as MelhorEnvioWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!payload.event || !payload.data) {
    return NextResponse.json(
      { error: "Missing event or data" },
      { status: 400 },
    );
  }

  console.info(
    `[me-webhook] Evento recebido: ${payload.event} | shipmentId: ${payload.data.id}`,
  );

  try {
    const result = await processMelhorEnvioWebhookEvent(payload);

    return NextResponse.json({
      ok: true,
      processed: result.processed,
      action: result.action,
    });
  } catch (error) {
    console.error("[me-webhook] Erro ao processar webhook:", error);
    return NextResponse.json(
      { error: "Internal processing error" },
      { status: 500 },
    );
  }
}
