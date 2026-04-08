import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { confirmOrderPaymentByPaymentId } from "@/lib/payment-confirmation";

function parsePaymentIds(input: unknown): string[] {
  if (!Array.isArray(input)) return [];

  const ids = input
    .map((value) => {
      if (typeof value === "string") return value.trim();
      if (typeof value === "number") return value.toString().trim();
      return "";
    })
    .filter(Boolean);

  return [...new Set(ids)];
}

function parseBoolean(input: unknown, fallback: boolean): boolean {
  if (typeof input === "boolean") return input;
  if (typeof input === "string") {
    const normalized = input.trim().toLowerCase();
    if (["1", "true", "yes", "y", "sim"].includes(normalized)) return true;
    if (["0", "false", "no", "n", "nao", "não"].includes(normalized)) {
      return false;
    }
  }
  return fallback;
}

function parseLimit(input: unknown, fallback: number): number {
  if (typeof input === "number" && Number.isFinite(input)) {
    return Math.max(1, Math.min(500, Math.trunc(input)));
  }

  if (typeof input === "string" && input.trim()) {
    const parsed = Number(input);
    if (Number.isFinite(parsed)) {
      return Math.max(1, Math.min(500, Math.trunc(parsed)));
    }
  }

  return fallback;
}

function parseSince(input: unknown): Date | null {
  if (typeof input !== "string" || !input.trim()) return null;
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function isPaymentEventType(value: string): boolean {
  return value.toLowerCase().includes("payment");
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    let body: Record<string, unknown> = {};
    try {
      body = (await request.json()) as Record<string, unknown>;
    } catch {
      // body opcional
    }

    const onlyFailedSignature = parseBoolean(body.onlyFailedSignature, true);
    const limit = parseLimit(body.limit, 200);
    const since = parseSince(body.since);

    let paymentIds = parsePaymentIds(body.paymentIds);
    let sourceLogCount = 0;

    if (paymentIds.length === 0) {
      const where: Record<string, unknown> = {
        externalId: { not: null },
        eventType: { contains: "payment", mode: "insensitive" },
      };

      if (onlyFailedSignature) {
        where.error = { startsWith: "invalid_signature" };
      }

      if (since) {
        where.createdAt = { gte: since };
      }

      const logs = await prisma.webhookLog.findMany({
        where,
        select: {
          id: true,
          externalId: true,
          eventType: true,
        },
        orderBy: { createdAt: "desc" },
        take: limit,
      });

      sourceLogCount = logs.length;

      paymentIds = [
        ...new Set(
          logs
            .filter((log) => isPaymentEventType(log.eventType))
            .map((log) => log.externalId?.trim() || "")
            .filter(Boolean),
        ),
      ];
    }

    if (paymentIds.length === 0) {
      return NextResponse.json({
        ok: true,
        processed: 0,
        approved: 0,
        updated: 0,
        failed: 0,
        message: "Nenhum paymentId elegível para reconciliação.",
      });
    }

    const results: Array<{
      paymentId: string;
      ok: boolean;
      code?: string;
      message?: string;
      mpStatus?: string;
      updated?: boolean;
      orderId?: string;
      orderNumber?: number;
      paymentStatus?: string;
      linkedLogs?: number;
    }> = [];

    let approved = 0;
    let updated = 0;

    for (const paymentId of paymentIds) {
      const confirmation = await confirmOrderPaymentByPaymentId(paymentId);

      if (!confirmation.ok) {
        results.push({
          paymentId,
          ok: false,
          code: confirmation.code,
          message: confirmation.message,
        });
        continue;
      }

      if (confirmation.order.paymentStatus === "APPROVED") approved += 1;
      if (confirmation.updated) updated += 1;

      const linked = await prisma.webhookLog.updateMany({
        where: {
          externalId: paymentId,
          eventType: { contains: "payment", mode: "insensitive" },
        },
        data: {
          orderId: confirmation.order.id,
          processed: true,
          error: null,
        },
      });

      results.push({
        paymentId,
        ok: true,
        mpStatus: confirmation.mpStatus,
        updated: confirmation.updated,
        orderId: confirmation.order.id,
        orderNumber: confirmation.order.orderNumber,
        paymentStatus: confirmation.order.paymentStatus,
        linkedLogs: linked.count,
      });
    }

    const failed = results.filter((item) => !item.ok).length;

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "RECONCILE",
        entity: "mercadopago_webhook",
        details: {
          totalPaymentIds: paymentIds.length,
          sourceLogCount,
          onlyFailedSignature,
          approved,
          updated,
          failed,
          since: since?.toISOString() || null,
        },
      },
    });

    return NextResponse.json({
      ok: true,
      processed: paymentIds.length,
      approved,
      updated,
      failed,
      sourceLogCount,
      results,
    });
  } catch (error) {
    console.error("Admin reconcile Mercado Pago webhook error:", error);
    return NextResponse.json(
      { error: "Erro ao reconciliar pagamentos via logs de webhook." },
      { status: 500 },
    );
  }
}
