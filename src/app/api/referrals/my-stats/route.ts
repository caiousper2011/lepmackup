import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    // Get referral stats
    const referrals = await prisma.user.count({
      where: { referredById: user.id },
    });

    const rewards = await prisma.referralReward.findMany({
      where: { referrerId: user.id },
      include: { referred: { select: { email: true, createdAt: true } } },
      orderBy: { createdAt: "desc" },
    });

    // Get active referral coupons for this user
    const referralCoupons = await prisma.coupon.findMany({
      where: {
        isReferral: true,
        code: { startsWith: `REF-${user.referralCode}` },
        active: true,
      },
    });

    return NextResponse.json({
      referralCode: user.referralCode,
      totalReferrals: referrals,
      rewards,
      activeCoupons: referralCoupons,
    });
  } catch (error) {
    console.error("Referral stats error:", error);
    return NextResponse.json({ error: "Erro ao buscar dados de indicação." }, { status: 500 });
  }
}
