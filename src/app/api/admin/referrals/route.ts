import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);

    const [rewards, total] = await Promise.all([
      prisma.referralReward.findMany({
        include: {
          referrer: { select: { email: true, name: true, referralCode: true } },
          referred: { select: { email: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.referralReward.count(),
    ]);

    // Aggregate stats
    const totalReferrals = await prisma.user.count({
      where: { referredById: { not: null } },
    });

    const topReferrers = await prisma.user.findMany({
      where: { referrals: { some: {} } },
      select: {
        id: true,
        email: true,
        name: true,
        referralCode: true,
        _count: { select: { referrals: true } },
      },
      orderBy: { referrals: { _count: "desc" } },
      take: 10,
    });

    return NextResponse.json({
      rewards,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
      stats: { totalReferrals },
      topReferrers,
    });
  } catch (error) {
    console.error("Admin referrals error:", error);
    return NextResponse.json({ error: "Erro ao listar indicações." }, { status: 500 });
  }
}
