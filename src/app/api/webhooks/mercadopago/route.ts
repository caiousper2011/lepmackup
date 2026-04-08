import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPaymentApprovedEmail } from "@/lib/email";
import { confirmOrderPaymentByPaymentId } from "@/lib/payment-confirmation";
import { getMercadoPagoRuntimeConfig } from "@/lib/mercadopago";
import { Prisma } from "@/generated/prisma/client";
import crypto from "crypto";

function getWebhookSecret(): string {
  try {
    return getMercadoPagoRuntimeConfig().webhookSecret || "";
  } catch {
    return (process.env.MERCADOPAGO_WEBHOOK_SECRET || "").trim();
  }
}

function parseSignatureHeader(signature: string): {
  ts: string | null;
  v1: string | null;
} {
  const parts = signature.split(",").map((part) => part.trim());
  const ts = parts.find((part) => part.startsWith("ts="))?.replace("ts=", "");
  const v1 = parts.find((part) => part.startsWith("v1="))?.replace("v1=", "");

  return { ts: ts || null, v1: v1 || null };
}

function safeHexCompare(expected: string, actual: string): boolean {
  try {
    const expectedBuffer = Buffer.from(expected, "hex");
    const actualBuffer = Buffer.from(actual, "hex");

    if (
      !expectedBuffer.length ||
      expectedBuffer.length !== actualBuffer.length
    ) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, actualBuffer);
  } catch {
    return false;
  }
}

function verifyWebhookSignature(
  request: NextRequest,
  dataId: string,
): { valid: boolean; reason?: string } {
  // In production, verify the x-signature header from Mercado Pago
  const xSignature = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id");
  const webhookSecret = getWebhookSecret();

  // IPN legacy notifications may not include x-signature
  if (!xSignature) return { valid: true };

  if (!webhookSecret) {
    // In dev/test without secret, accept all webhooks
    if (process.env.NODE_ENV !== "production") return { valid: true };
    return { valid: false, reason: "webhook_secret_missing" };
  }

  try {
    const { ts, v1 } = parseSignatureHeader(xSignature);
    if (!ts || !v1) {
      return { valid: false, reason: "signature_header_invalid" };
    }
    if (!xRequestId) {
      return { valid: false, reason: "request_id_missing" };
    }
    if (!dataId) {
      return { valid: false, reason: "data_id_missing" };
    }

    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
    const expectedHash = crypto
      .createHmac("sha256", webhookSecret)
      .update(manifest)
      .digest("hex");

    return {
      valid: safeHexCompare(expectedHash, v1),
      reason: "signature_mismatch",
    };
  } catch {
    return { valid: false, reason: "signature_verification_error" };
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, message: "Webhook Mercado Pago ativo" });
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const requestUrl = new URL(request.url);

    let body: Record<string, unknown> = {};

    try {
      body = rawBody ? (JSON.parse(rawBody) as Record<string, unknown>) : {};
    } catch {
      const formBody = new URLSearchParams(rawBody);
      body = Object.fromEntries(formBody.entries());
    }

    const externalIdFromBody =
      ((body.data as { id?: unknown } | undefined)?.id as
        | string
        | number
        | undefined) ??
      (body.id as string | number | undefined) ??
      requestUrl.searchParams.get("data.id") ??
      requestUrl.searchParams.get("id") ??
      undefined;

    const eventType =
      (body.type as string | undefined) ||
      (body.action as string | undefined) ||
      (body.topic as string | undefined) ||
      requestUrl.searchParams.get("topic") ||
      "unknown";

    const signatureValidation = verifyWebhookSignature(
      request,
      externalIdFromBody?.toString() || "",
    );

    const webhookLog = await prisma.webhookLog.create({
      data: {
        eventType,
        externalId: externalIdFromBody?.toString(),
        payload: body as Prisma.InputJsonValue,
      },
    });

    if (!signatureValidation.valid) {
      await prisma.webhookLog.update({
        where: { id: webhookLog.id },
        data: {
          processed: true,
          error: `invalid_signature: ${signatureValidation.reason || "unknown"}`,
        },
      });

      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const normalizedEventType = eventType.toLowerCase();
    const isPaymentEvent =
      normalizedEventType === "payment" ||
      normalizedEventType.startsWith("payment.") ||
      normalizedEventType.includes("payment");

    // Only process payment events
    if (!isPaymentEvent) {
      await prisma.webhookLog.update({
        where: { id: webhookLog.id },
        data: { processed: true },
      });
      return NextResponse.json({ received: true });
    }

    const paymentId = externalIdFromBody?.toString();
    if (!paymentId) {
      return NextResponse.json({ received: true });
    }

    const confirmation = await confirmOrderPaymentByPaymentId(paymentId);

    if (!confirmation.ok) {
      await prisma.webhookLog.update({
        where: { id: webhookLog.id },
        data: {
          processed: true,
          error: `${confirmation.code}: ${confirmation.message}`,
        },
      });
      return NextResponse.json({ received: true });
    }

    // Link webhook log to order
    await prisma.webhookLog.update({
      where: { id: webhookLog.id },
      data: { orderId: confirmation.order.id, processed: true },
    });

    // Send notifications for approved payments
    if (
      confirmation.mpStatus === "approved" &&
      confirmation.order.userEmail &&
      confirmation.updated
    ) {
      await sendPaymentApprovedEmail(
        confirmation.order.userEmail,
        confirmation.order.orderNumber,
      );
    }

    return NextResponse.json({
      received: true,
      status: confirmation.mpStatus,
      updated: confirmation.updated,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    // Return non-2xx so Mercado Pago retries and notification is not lost
    return NextResponse.json({ error: "processing_error" }, { status: 500 });
  }
}
