import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { confirmOrderPaymentByPaymentId } from "@/lib/payment-confirmation";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { id } = await params;

    const order = await prisma.order.findFirst({
      where: { id, userId: user.id },
      select: { id: true, paymentId: true, paymentStatus: true },
    });

    if (!order) {
      return NextResponse.json(
        { error: "Pedido não encontrado." },
        { status: 404 },
      );
    }

    let paymentIdFromBody: string | undefined;

    try {
      const body = (await request.json()) as { paymentId?: unknown };
      if (typeof body.paymentId === "string" && body.paymentId.trim()) {
        paymentIdFromBody = body.paymentId.trim();
      }
    } catch {
      // optional body
    }

    const paymentId = paymentIdFromBody || order.paymentId || undefined;

    if (!paymentId) {
      return NextResponse.json({
        confirmed: false,
        message: "Pagamento ainda não identificado para este pedido.",
        paymentStatus: order.paymentStatus,
      });
    }

    const confirmation = await confirmOrderPaymentByPaymentId(paymentId, id);

    if (!confirmation.ok) {
      return NextResponse.json({
        confirmed: false,
        message: confirmation.message,
        code: confirmation.code,
        paymentStatus: order.paymentStatus,
      });
    }

    return NextResponse.json({
      confirmed: confirmation.order.paymentStatus === "APPROVED",
      updated: confirmation.updated,
      mpStatus: confirmation.mpStatus,
      orderStatus: confirmation.order.status,
      paymentStatus: confirmation.order.paymentStatus,
    });
  } catch (error) {
    console.error("Confirm order payment error:", error);
    return NextResponse.json(
      { error: "Erro ao confirmar pagamento." },
      { status: 500 },
    );
  }
}
