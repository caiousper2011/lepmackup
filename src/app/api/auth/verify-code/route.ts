import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCodeSchema } from "@/lib/validation";
import { createUserSession } from "@/lib/auth";
import { generateReferralCode } from "@/lib/utils";
import { rateLimitLogin } from "@/lib/rate-limit";
import { getClientIp } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = verifyCodeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    const { email, code } = parsed.data;

    // Rate limit
    const ip = getClientIp(request);
    const limit = rateLimitLogin(ip);
    if (!limit.allowed) {
      return NextResponse.json(
        { error: "Muitas tentativas. Tente novamente mais tarde." },
        { status: 429 },
      );
    }

    // Find valid OTP
    const otp = await prisma.otpCode.findFirst({
      where: {
        email,
        code,
        used: false,
        expiresAt: { gt: new Date() },
        attempts: { lt: 3 },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) {
      // Increment attempts on latest OTP
      const latestOtp = await prisma.otpCode.findFirst({
        where: { email, used: false },
        orderBy: { createdAt: "desc" },
      });
      if (latestOtp) {
        await prisma.otpCode.update({
          where: { id: latestOtp.id },
          data: { attempts: { increment: 1 } },
        });
      }

      return NextResponse.json(
        { error: "Código inválido ou expirado." },
        { status: 400 },
      );
    }

    // Mark OTP as used
    await prisma.otpCode.update({
      where: { id: otp.id },
      data: { used: true },
    });

    // Find or create user
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Check for referral cookie (passed in body)
      const referralCode = body.referralCode as string | undefined;
      let referredById: string | undefined;

      if (referralCode) {
        const referrer = await prisma.user.findUnique({
          where: { referralCode },
        });
        if (referrer) {
          referredById = referrer.id;
        }
      }

      // Generate unique referral code
      let newReferralCode = generateReferralCode();
      let exists = await prisma.user.findUnique({
        where: { referralCode: newReferralCode },
      });
      while (exists) {
        newReferralCode = generateReferralCode();
        exists = await prisma.user.findUnique({
          where: { referralCode: newReferralCode },
        });
      }

      user = await prisma.user.create({
        data: {
          email,
          referralCode: newReferralCode,
          referredById,
        },
      });

      // If referred, create referral reward entries
      if (referredById) {
        await prisma.referralReward.create({
          data: {
            referrerId: referredById,
            referredId: user.id,
            rewardType: "COUPON",
            granted: false,
          },
        });
      }
    }

    // Create session
    await createUserSession(user.id, user.email);

    return NextResponse.json({
      message: "Login realizado com sucesso!",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        referralCode: user.referralCode,
      },
    });
  } catch (error) {
    console.error("Verify code error:", error);
    return NextResponse.json(
      { error: "Erro ao verificar código. Tente novamente." },
      { status: 500 },
    );
  }
}
