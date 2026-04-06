import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPaymentApprovedEmail } from "@/lib/email";
import { confirmOrderPaymentByPaymentId } from "@/lib/payment-confirmation";
import { Prisma } from "@/generated/prisma/client";
import crypto from "crypto";

const MP_WEBHOOK_SECRET = process.env.MERCADOPAGO_WEBHOOK_SECRET || "";

function verifyWebhookSignature(request: NextRequest): boolean {
  // In production, verify the x-signature header from Mercado Pago
  const xSignature = request.headers.get("x-signature");
  const xRequestId = request.headers.get("x-request-id");

  // IPN legacy notifications may not include x-signature
  if (!xSignature) return true;

  if (!MP_WEBHOOK_SECRET || !xSignature) {
    // In dev/test without secret, accept all webhooks
    if (process.env.NODE_ENV !== "production") return true;
    return false;
  }

  try {
    // MP signature format: ts=<timestamp>,v1=<hash>
    const parts = xSignature.split(",");
    const tsRaw = parts.find((p) => p.startsWith("ts="))?.replace("ts=", "");
    const v1Raw = parts.find((p) => p.startsWith("v1="))?.replace("v1=", "");

    if (!tsRaw || !v1Raw) return false;

    // Parse data_id from query params
    const dataId = new URL(request.url).searchParams.get("data.id") || "";

    const manifest = `id:${dataId};request-id:${xRequestId};ts:${tsRaw};`;
    const hmac = crypto
      .createHmac("sha256", MP_WEBHOOK_SECRET)
      .update(manifest)
      .digest("hex");

    return hmac === v1Raw;
  } catch {
    return false;
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

    // Verify signature
    if (!verifyWebhookSignature(request)) {
      console.warn("Invalid webhook signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    // Log webhook
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

    const webhookLog = await prisma.webhookLog.create({
      data: {
        eventType,
        externalId: externalIdFromBody?.toString(),
        payload: body as Prisma.InputJsonValue,
      },
    });

    const isPaymentEvent =
      eventType === "payment" ||
      eventType === "payment.updated" ||
      eventType === "created_payment";

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
    if (confirmation.mpStatus === "approved" && confirmation.order.userEmail) {
      try {
        await sendPaymentApprovedEmail(
          confirmation.order.userEmail,
          confirmation.order.orderNumber,
        );
      } catch {
        // Don't fail webhook for email errors
      }
    }

    return NextResponse.json({
      received: true,
      status: confirmation.mpStatus,
      updated: confirmation.updated,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    // Always return 200 to MP to prevent retries on our errors
    return NextResponse.json({ received: true, error: "processing_error" });
  }
}
