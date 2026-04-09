import { getPaymentById } from "@/lib/mercadopago";
import { prisma } from "@/lib/prisma";
import { sendPaidOrderWhatsAppNotification } from "@/lib/whatsapp";
import { autoGenerateShippingLabel } from "@/lib/shipping";

const PAYMENT_STATUS_MAP = {
  approved: { order: "PAID", payment: "APPROVED" },
  in_process: { order: "PENDING", payment: "IN_PROCESS" },
  rejected: { order: "PENDING", payment: "REJECTED" },
  cancelled: { order: "CANCELLED", payment: "CANCELLED" },
  refunded: { order: "REFUNDED", payment: "REFUNDED" },
} as const;

type KnownMercadoPagoStatus = keyof typeof PAYMENT_STATUS_MAP;

interface MercadoPagoPaymentData {
  external_reference?: string | number;
  status?: string;
  payment_method_id?: string | null;
}

export type ConfirmPaymentResult =
  | {
      ok: true;
      updated: boolean;
      mpStatus: string;
      order: {
        id: string;
        orderNumber: number;
        status: string;
        paymentStatus: string;
        paymentId: string | null;
        paymentMethod: string | null;
        userEmail: string | null;
      };
    }
  | {
      ok: false;
      code:
        | "payment_not_found"
        | "missing_external_reference"
        | "order_not_found"
        | "order_mismatch"
        | "unknown_status";
      message: string;
    };

export async function confirmOrderPaymentByPaymentId(
  paymentId: string,
  expectedOrderId?: string,
): Promise<ConfirmPaymentResult> {
  let mpPaymentRaw: unknown;

  try {
    mpPaymentRaw = await getPaymentById(paymentId);
  } catch {
    return {
      ok: false,
      code: "payment_not_found",
      message: "Pagamento não encontrado no Mercado Pago.",
    };
  }

  const paymentData = (mpPaymentRaw ?? {}) as MercadoPagoPaymentData;
  const externalRef = paymentData.external_reference?.toString().trim();

  if (!externalRef) {
    return {
      ok: false,
      code: "missing_external_reference",
      message: "Pagamento sem external_reference.",
    };
  }

  const mpStatus = (paymentData.status || "").toLowerCase();
  const statusMapping =
    PAYMENT_STATUS_MAP[mpStatus as KnownMercadoPagoStatus] || null;

  if (!statusMapping) {
    return {
      ok: false,
      code: "unknown_status",
      message: `Status desconhecido do Mercado Pago: ${mpStatus}`,
    };
  }

  const order = await prisma.order.findUnique({
    where: { id: externalRef },
    include: {
      user: { select: { email: true, name: true, phone: true } },
      items: {
        select: {
          quantity: true,
          unitPrice: true,
          productSnapshot: true,
        },
      },
    },
  });

  if (!order) {
    return {
      ok: false,
      code: "order_not_found",
      message: "Pedido da referência externa não encontrado.",
    };
  }

  if (expectedOrderId && order.id !== expectedOrderId) {
    return {
      ok: false,
      code: "order_mismatch",
      message: "Pagamento não pertence ao pedido informado.",
    };
  }

  const paymentMethod = paymentData.payment_method_id?.toString() || null;
  const isApprovingNow =
    order.paymentStatus !== "APPROVED" && statusMapping.payment === "APPROVED";

  const needsUpdate =
    order.status !== statusMapping.order ||
    order.paymentStatus !== statusMapping.payment ||
    order.paymentId !== paymentId ||
    order.paymentMethod !== paymentMethod;

  const persistedOrder = needsUpdate
    ? await prisma.order.update({
        where: { id: order.id },
        data: {
          status: statusMapping.order,
          paymentStatus: statusMapping.payment,
          paymentId,
          paymentMethod,
        },
        include: {
          user: { select: { email: true, name: true, phone: true } },
          items: {
            select: {
              quantity: true,
              unitPrice: true,
              productSnapshot: true,
            },
          },
        },
      })
    : order;

  if (isApprovingNow && order.couponId) {
    await prisma.coupon.update({
      where: { id: order.couponId },
      data: { usedCount: { increment: 1 } },
    });
  }

  if (isApprovingNow) {
    try {
      await sendPaidOrderWhatsAppNotification({
        id: persistedOrder.id,
        orderNumber: persistedOrder.orderNumber,
        status: persistedOrder.status,
        paymentStatus: persistedOrder.paymentStatus,
        paymentId: persistedOrder.paymentId,
        paymentMethod: persistedOrder.paymentMethod,
        subtotal: persistedOrder.subtotal,
        shipping: persistedOrder.shipping,
        discount: persistedOrder.discount,
        total: persistedOrder.total,
        shippingMethod: persistedOrder.shippingMethod,
        addressSnapshot: persistedOrder.addressSnapshot,
        createdAt: persistedOrder.createdAt,
        user: {
          name: persistedOrder.user?.name || null,
          email: persistedOrder.user?.email || "",
          phone: persistedOrder.user?.phone || null,
        },
        items: persistedOrder.items.map((item) => ({
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          productSnapshot: item.productSnapshot,
        })),
      });
    } catch (error) {
      console.error(
        "[payment-confirmation] WhatsApp notification error:",
        error,
      );
    }
  }

  // Auto-generate shipping label after payment approval (best-effort)
  if (
    isApprovingNow &&
    persistedOrder.shippingMethod?.startsWith("MELHOR_ENVIO_")
  ) {
    try {
      const labelResult = await autoGenerateShippingLabel(persistedOrder.id);
      if (labelResult) {
        console.info(
          `[payment-confirmation] Auto label generated for order ${persistedOrder.orderNumber}: shipment ${labelResult.shipmentId}`,
        );
      }
    } catch (error) {
      console.error(
        "[payment-confirmation] Auto shipping label failed (can be generated manually):",
        error,
      );
    }
  }

  return {
    ok: true,
    updated: needsUpdate,
    mpStatus,
    order: {
      id: persistedOrder.id,
      orderNumber: persistedOrder.orderNumber,
      status: persistedOrder.status,
      paymentStatus: persistedOrder.paymentStatus,
      paymentId: persistedOrder.paymentId,
      paymentMethod: persistedOrder.paymentMethod,
      userEmail: persistedOrder.user?.email || null,
    },
  };
}
