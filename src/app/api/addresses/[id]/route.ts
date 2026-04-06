import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { addressSchema } from "@/lib/validation";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.address.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Endereço não encontrado." }, { status: 404 });
    }

    const body = await request.json();
    const parsed = addressSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;

    if (data.isDefault) {
      await prisma.address.updateMany({
        where: { userId: user.id, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.update({
      where: { id },
      data,
    });

    return NextResponse.json({ address });
  } catch (error) {
    console.error("Update address error:", error);
    return NextResponse.json({ error: "Erro ao atualizar endereço." }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.address.findFirst({
      where: { id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Endereço não encontrado." }, { status: 404 });
    }

    // Check if address is used in pending orders
    const pendingOrders = await prisma.order.count({
      where: {
        addressId: id,
        status: { in: ["PENDING", "PAID", "PROCESSING", "SHIPPED"] },
      },
    });

    if (pendingOrders > 0) {
      return NextResponse.json(
        { error: "Não é possível excluir endereço com pedidos em andamento." },
        { status: 400 }
      );
    }

    await prisma.address.delete({ where: { id } });

    // If deleted was default, set another as default
    if (existing.isDefault) {
      const first = await prisma.address.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      });
      if (first) {
        await prisma.address.update({
          where: { id: first.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete address error:", error);
    return NextResponse.json({ error: "Erro ao excluir endereço." }, { status: 500 });
  }
}
