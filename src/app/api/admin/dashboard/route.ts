import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalOrders,
      pendingOrders,
      paidOrders,
      totalRevenue,
      totalUsers,
      newUsersThisWeek,
      totalProducts,
      recentOrders,
      monthlyRevenue,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.order.count({ where: { status: "PAID" } }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { paymentStatus: "APPROVED" },
      }),
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
      prisma.product.count({ where: { active: true } }),
      prisma.order.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { email: true, name: true } },
          items: { select: { quantity: true } },
        },
      }),
      prisma.order.aggregate({
        _sum: { total: true },
        where: {
          paymentStatus: "APPROVED",
          createdAt: { gte: thirtyDaysAgo },
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalOrders,
        pendingOrders,
        paidOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        monthlyRevenue: monthlyRevenue._sum.total || 0,
        totalUsers,
        newUsersThisWeek,
        totalProducts,
      },
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        total: o.total,
        status: o.status,
        paymentStatus: o.paymentStatus,
        customer: o.user.name || o.user.email,
        itemCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
        createdAt: o.createdAt,
      })),
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    return NextResponse.json({ error: "Erro ao carregar dashboard." }, { status: 500 });
  }
}
