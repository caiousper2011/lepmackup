import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { shippingPackageRuleSchema } from "@/lib/validation";

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
    const existing = await prisma.shippingPackageRule.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Regra não encontrada." },
        { status: 404 },
      );
    }

    const body = await request.json();
    const parsed = shippingPackageRuleSchema.partial().safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const data = parsed.data;

    if (
      typeof data.maxItems === "number" &&
      data.maxItems !== existing.maxItems
    ) {
      const conflict = await prisma.shippingPackageRule.findUnique({
        where: { maxItems: data.maxItems },
      });
      if (conflict) {
        return NextResponse.json(
          { error: "Já existe regra com esse limite de itens." },
          { status: 409 },
        );
      }
    }

    const rule = await prisma.shippingPackageRule.update({
      where: { id },
      data,
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "UPDATE",
        entity: "shipping_package_rule",
        entityId: rule.id,
        details: { updatedFields: Object.keys(data) },
      },
    });

    return NextResponse.json({ rule });
  } catch (error) {
    console.error("Admin update shipping rule error:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar regra de frete." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const { id } = await params;

    const existing = await prisma.shippingPackageRule.findUnique({
      where: { id },
    });
    if (!existing) {
      return NextResponse.json(
        { error: "Regra não encontrada." },
        { status: 404 },
      );
    }

    await prisma.shippingPackageRule.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "DELETE",
        entity: "shipping_package_rule",
        entityId: id,
        details: { maxItems: existing.maxItems, name: existing.name },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin delete shipping rule error:", error);
    return NextResponse.json(
      { error: "Erro ao excluir regra de frete." },
      { status: 500 },
    );
  }
}
