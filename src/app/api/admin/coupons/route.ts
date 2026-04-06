import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import { couponSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.coupon.count(),
    ]);

    return NextResponse.json({
      coupons,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Admin list coupons error:", error);
    return NextResponse.json({ error: "Erro ao listar cupons." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const body = await request.json();
    const parsed = couponSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const existing = await prisma.coupon.findUnique({ where: { code: data.code } });
    if (existing) {
      return NextResponse.json(
        { error: "Já existe um cupom com esse código." },
        { status: 409 }
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        ...data,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      },
    });

    await prisma.auditLog.create({
      data: {
        adminId: admin.id,
        action: "CREATE",
        entity: "coupon",
        entityId: coupon.id,
        details: { code: coupon.code },
      },
    });

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error) {
    console.error("Admin create coupon error:", error);
    return NextResponse.json({ error: "Erro ao criar cupom." }, { status: 500 });
  }
}
