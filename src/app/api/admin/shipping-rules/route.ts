import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { shippingPackageRuleSchema } from "@/lib/validation";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const rules = await prisma.shippingPackageRule.findMany({
      orderBy: { maxItems: "asc" },
    });

    return NextResponse.json({ rules });
  } catch (error) {
    console.error("Admin list shipping rules error:", error);
    return NextResponse.json(
      { error: "Erro ao listar regras de frete." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const parsed = shippingPackageRuleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const data = parsed.data;

    const existing = await prisma.shippingPackageRule.findUnique({
      where: { maxItems: data.maxItems },
    });

    if (existing) {
      return NextResponse.json(
        {
          error:
            "Já existe uma regra para esse limite de itens. Edite a regra existente.",
        },
        { status: 409 },
      );
    }

    const rule = await prisma.shippingPackageRule.create({
      data: {
        ...data,
        active: data.active ?? true,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "CREATE",
        entity: "shipping_package_rule",
        entityId: rule.id,
        details: {
          name: rule.name,
          maxItems: rule.maxItems,
          dimensions: `${rule.widthCm}x${rule.lengthCm}x${rule.heightCm}`,
        },
      },
    });

    return NextResponse.json({ rule }, { status: 201 });
  } catch (error) {
    console.error("Admin create shipping rule error:", error);
    return NextResponse.json(
      { error: "Erro ao criar regra de frete." },
      { status: 500 },
    );
  }
}
