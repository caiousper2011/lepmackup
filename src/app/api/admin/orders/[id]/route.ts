import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { sendShippingEmail, sendOrderCancellationEmail } from "@/lib/email";
import {
  findPaymentIdByExternalReference,
  refundPayment,
} from "@/lib/mercadopago";
import { z } from "zod";

const updateOrderSchema = z.object({
  status: z
    .enum([
      "PENDING",
      "PAID",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "REFUNDED",
    ])
    .optional(),
  trackingCode: z.string().max(100).optional(),
  trackingUrl: z.string().max(500).optional(),
  shippingLabelUrl: z.string().max(1000).optional(),
  melhorEnvioShipmentId: z.string().max(100).optional(),
});

function emptyToNull(value: string | undefined): string | null {
  if (value === undefined) return null;
  const normalized = value.trim();
  return normalized ? normalized : null;
}

function buildDefaultTrackingUrl(trackingCode: string): string {
  return `https://rastreamento.correios.com.br/app/index.php?objetos=${encodeURIComponent(trackingCode)}`;
}

function normalizePaymentId(value: string | null | undefined): string | null {
  if (!value) return null;
  const normalized = value.trim();
  return normalized ? normalized : null;
}

function isNumericPaymentId(value: string | null | undefined): boolean {
  if (!value) return false;
  return /^\d+$/.test(value.trim());
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: { select: { email: true, name: true, phone: true } },
        items: { include: { product: true } },
        address: true,
        coupon: true,
        webhookLogs: { orderBy: { createdAt: "desc" }, take: 10 },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Pedido não encontrado." },
        { status: 404 },
      );
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Admin get order error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar pedido." },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const parsed = updateOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const existing = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        items: {
          select: {
            productId: true,
            quantity: true,
          },
        },
      },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Pedido não encontrado." },
        { status: 404 },
      );
    }

    const data = parsed.data;

    const updateData: Record<string, unknown> = {};
    if (data.status !== undefined) updateData.status = data.status;
    if (data.trackingCode !== undefined) {
      updateData.trackingCode = emptyToNull(data.trackingCode);
    }
    if (data.trackingUrl !== undefined) {
      updateData.trackingUrl = emptyToNull(data.trackingUrl);
    }
    if (data.shippingLabelUrl !== undefined) {
      updateData.shippingLabelUrl = emptyToNull(data.shippingLabelUrl);
    }
    if (data.melhorEnvioShipmentId !== undefined) {
      updateData.melhorEnvioShipmentId = emptyToNull(
        data.melhorEnvioShipmentId,
      );
    }

    const normalizedTrackingCode =
      (updateData.trackingCode as string | null | undefined) ??
      existing.trackingCode;

    if (
      normalizedTrackingCode &&
      data.trackingUrl === undefined &&
      !existing.trackingUrl
    ) {
      updateData.trackingUrl = buildDefaultTrackingUrl(normalizedTrackingCode);
    }

    if (data.status === "CANCELLED") {
      const nonCancellable = ["DELIVERED", "SHIPPED", "CANCELLED", "REFUNDED"];
      if (nonCancellable.includes(existing.status)) {
        return NextResponse.json(
          {
            error:
              "Pedidos entregues, enviados, já cancelados ou reembolsados não podem ser cancelados.",
          },
          { status: 400 },
        );
      }
    }

    const isCancelling = data.status === "CANCELLED";
    const wasPaid = ["PAID", "PROCESSING"].includes(existing.status);
    let refundedPaymentId: string | null = null;

    if (isCancelling && wasPaid) {
      const currentPaymentId = normalizePaymentId(existing.paymentId);
      const legacyNumericMercadoPagoId = isNumericPaymentId(
        existing.mercadoPagoId,
      )
        ? normalizePaymentId(existing.mercadoPagoId)
        : null;

      let paymentIdToRefund = currentPaymentId || legacyNumericMercadoPagoId;

      if (!paymentIdToRefund) {
        try {
          paymentIdToRefund = await findPaymentIdByExternalReference(
            existing.id,
            ["approved", "authorized"],
          );
        } catch (paymentLookupError) {
          console.error(
            "Failed to resolve paymentId for refund:",
            paymentLookupError,
          );
        }
      }

      if (!paymentIdToRefund) {
        return NextResponse.json(
          {
            error:
              "Pedido pago sem paymentId confirmado no Mercado Pago. Reconcilie o pagamento e tente novamente.",
          },
          { status: 409 },
        );
      }

      try {
        await refundPayment(paymentIdToRefund);
        updateData.status = "REFUNDED";
        updateData.paymentStatus = "REFUNDED";
        if (!currentPaymentId) {
          updateData.paymentId = paymentIdToRefund;
        }
        refundedPaymentId = paymentIdToRefund;
      } catch (refundError) {
        console.error("Refund failed:", refundError);
        return NextResponse.json(
          {
            error:
              "Falha ao processar reembolso no MercadoPago. Tente novamente.",
          },
          { status: 502 },
        );
      }
    }

    const order = isCancelling
      ? await prisma.$transaction(async (tx) => {
          const updatedOrder = await tx.order.update({
            where: { id },
            data: updateData,
          });

          for (const item of existing.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stockQuantity: {
                  increment: item.quantity,
                },
              },
            });
          }

          return updatedOrder;
        })
      : await prisma.order.update({
          where: { id },
          data: updateData,
        });

    if (isCancelling && existing.user) {
      sendOrderCancellationEmail(
        existing.user.email,
        existing.orderNumber,
        Number(existing.total),
        Boolean(refundedPaymentId),
      ).catch((emailErr) =>
        console.error("Cancellation email failed:", emailErr),
      );
    }

    const nextStatus =
      (updateData.status as string | undefined) || existing.status;
    const nextTrackingCode =
      (updateData.trackingCode as string | null | undefined) ??
      existing.trackingCode;
    const nextTrackingUrl =
      (updateData.trackingUrl as string | null | undefined) ||
      existing.trackingUrl;

    const shouldSendShippingEmail =
      Boolean(existing.user) &&
      Boolean(nextTrackingCode) &&
      nextStatus === "SHIPPED" &&
      (existing.status !== "SHIPPED" ||
        data.trackingCode !== undefined ||
        data.trackingUrl !== undefined);

    if (shouldSendShippingEmail && existing.user && nextTrackingCode) {
      await sendShippingEmail(
        existing.user.email,
        existing.orderNumber,
        nextTrackingCode,
        nextTrackingUrl,
      );
    }

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "UPDATE",
        entity: "order",
        entityId: order.id,
        details: {
          updatedFields: Object.keys(updateData),
          previousStatus: existing.status,
        },
      },
    });

    return NextResponse.json({ order });
  } catch (error) {
    console.error("Admin update order error:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar pedido." },
      { status: 500 },
    );
  }
}
