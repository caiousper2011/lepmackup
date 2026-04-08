import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { sendShippingEmail } from "@/lib/email";
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
});

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

    if (data.status === "CANCELLED" && existing.status !== "PENDING") {
      return NextResponse.json(
        { error: "Somente pedidos pendentes podem ser cancelados." },
        { status: 400 },
      );
    }

    const order =
      data.status === "CANCELLED" && existing.status === "PENDING"
        ? await prisma.$transaction(async (tx) => {
            const updatedOrder = await tx.order.update({
              where: { id },
              data,
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
            data,
          });

    // If status changed to SHIPPED and tracking code provided, send email
    if (data.status === "SHIPPED" && data.trackingCode && existing.user) {
      await sendShippingEmail(
        existing.user.email,
        existing.orderNumber,
        data.trackingCode,
      );
    }

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "UPDATE",
        entity: "order",
        entityId: order.id,
        details: {
          updatedFields: Object.keys(data),
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
