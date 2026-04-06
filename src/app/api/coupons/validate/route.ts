import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { couponValidateSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = couponValidateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { code, itemCount, subtotal } = parsed.data;

    const coupon = await prisma.coupon.findUnique({
      where: { code, active: true },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: "Cupom não encontrado ou inativo." },
        { status: 404 }
      );
    }

    // Check expiry
    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Este cupom expirou." },
        { status: 400 }
      );
    }

    // Check usage limit
    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json(
        { error: "Limite de uso deste cupom foi atingido." },
        { status: 400 }
      );
    }

    // Check min items
    if (coupon.minItems > 0 && itemCount < coupon.minItems) {
      return NextResponse.json(
        { error: `Mínimo de ${coupon.minItems} itens para usar este cupom.` },
        { status: 400 }
      );
    }

    // Check min value
    if (coupon.minValue > 0 && subtotal < coupon.minValue) {
      return NextResponse.json(
        { error: `Valor mínimo de R$ ${coupon.minValue.toFixed(2)} para usar este cupom.` },
        { status: 400 }
      );
    }

    // Calculate discount
    let discount = 0;
    if (coupon.type === "PERCENT") {
      discount = (subtotal * coupon.value) / 100;
    } else {
      discount = Math.min(coupon.value, subtotal);
    }

    return NextResponse.json({
      valid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
      },
      discount: Math.round(discount * 100) / 100,
    });
  } catch (error) {
    console.error("Coupon validate error:", error);
    return NextResponse.json(
      { error: "Erro ao validar cupom." },
      { status: 500 }
    );
  }
}
