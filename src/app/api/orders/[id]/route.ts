import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await getCurrentUser();
    const { id } = await params;

    if (!user) {
      const paymentIdFromQuery =
        request.nextUrl.searchParams.get("payment_id") ||
        request.nextUrl.searchParams.get("collection_id") ||
        "";

      if (!paymentIdFromQuery) {
        return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
      }

      const order = await prisma.order.findFirst({
        where: { id, paymentId: paymentIdFromQuery },
        select: {
          id: true,
          orderNumber: true,
          total: true,
          status: true,
          paymentStatus: true,
          items: {
            select: {
              quantity: true,
              productSnapshot: true,
            },
          },
        },
      });

      if (!order) {
        return NextResponse.json(
          { error: "Pedido não encontrado." },
          { status: 404 },
        );
      }

      return NextResponse.json({ order });
    }

    const order = await prisma.order.findFirst({
      where: { id, userId: user.id },
      include: {
        items: { include: { product: true } },
        address: true,
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
    console.error("Get order detail error:", error);
    return NextResponse.json(
      { error: "Erro ao buscar pedido." },
      { status: 500 },
    );
  }
}
