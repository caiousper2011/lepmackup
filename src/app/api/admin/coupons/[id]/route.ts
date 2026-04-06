import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { couponSchema } from "@/lib/validation";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Cupom não encontrado." }, { status: 404 });
    }

    const body = await request.json();
    const parsed = couponSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...data,
        expiresAt: data.expiresAt !== undefined
          ? data.expiresAt ? new Date(data.expiresAt) : null
          : undefined,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "UPDATE",
        entity: "coupon",
        entityId: coupon.id,
        details: { updatedFields: Object.keys(data) },
      },
    });

    return NextResponse.json({ coupon });
  } catch (error) {
    console.error("Admin update coupon error:", error);
    return NextResponse.json({ error: "Erro ao atualizar cupom." }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Cupom não encontrado." }, { status: 404 });
    }

    // Soft delete
    await prisma.coupon.update({
      where: { id },
      data: { active: false },
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "DELETE",
        entity: "coupon",
        entityId: id,
        details: { code: existing.code },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin delete coupon error:", error);
    return NextResponse.json({ error: "Erro ao excluir cupom." }, { status: 500 });
  }
}
