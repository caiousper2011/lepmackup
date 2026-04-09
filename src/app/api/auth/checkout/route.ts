import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createUserSession } from "@/lib/auth";
import { z } from "zod";
import crypto from "crypto";

const checkoutAuthSchema = z.object({
  email: z.string().email("E-mail inválido").max(255).toLowerCase().trim(),
});

function generateReferralCode(): string {
  return crypto.randomBytes(4).toString("hex").toUpperCase();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = checkoutAuthSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { email } = parsed.data;

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Auto-create user with unique referral code
      let referralCode = generateReferralCode();
      let attempts = 0;
      while (attempts < 5) {
        const existing = await prisma.user.findUnique({
          where: { referralCode },
        });
        if (!existing) break;
        referralCode = generateReferralCode();
        attempts++;
      }

      user = await prisma.user.create({
        data: {
          email,
          referralCode,
        },
      });
    }

    // Create session
    await createUserSession(user.id, user.email);

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        referralCode: user.referralCode,
      },
    });
  } catch (error) {
    console.error("Checkout auth error:", error);
    return NextResponse.json(
      { error: "Erro ao autenticar. Tente novamente." },
      { status: 500 },
    );
  }
}
