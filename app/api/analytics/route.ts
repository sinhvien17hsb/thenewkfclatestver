import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 6);

  const [
    totalOrders,
    todayOrders,
    totalRevenue,
    todayRevenue,
    avgWait,
    topItems,
    feedbackStats,
    ordersByStatus,
    recentOrders,
    weeklyOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.order.aggregate({ _sum: { totalAmount: true } }),
    prisma.order.aggregate({ where: { createdAt: { gte: todayStart } }, _sum: { totalAmount: true } }),
    prisma.order.aggregate({ _avg: { estimatedTime: true } }),
    prisma.orderItem.groupBy({
      by: ["menuItemId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
    prisma.feedback.aggregate({
      _avg: { foodRating: true, serviceRating: true, waitingRating: true },
    }),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { items: { include: { menuItem: true } } },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: weekStart } },
      select: { createdAt: true, totalAmount: true },
    }),
  ]);

  type TopItem = { menuItemId: string; _sum: { quantity: number | null } };
  const menuItemIds = (topItems as TopItem[]).map((t) => t.menuItemId);
  const menuItems = await prisma.menuItem.findMany({ where: { id: { in: menuItemIds } } });

  type MenuItemRow = { id: string; name: string; imageEmoji: string };
  const topProducts = (topItems as TopItem[]).map((t) => {
    const item = (menuItems as MenuItemRow[]).find((m) => m.id === t.menuItemId);
    return {
      name: item?.name ?? "Unknown",
      imageEmoji: item?.imageEmoji ?? "🍗",
      total: t._sum.quantity ?? 0,
    };
  });

  // Group weekly orders by day
  const dayMap: Record<string, { orders: number; revenue: number }> = {};
  for (let i = 6; i >= 0; i--) {
    const d = new Date(todayStart);
    d.setDate(d.getDate() - i);
    dayMap[d.toISOString().split("T")[0]] = { orders: 0, revenue: 0 };
  }
  weeklyOrders.forEach((o) => {
    const key = new Date(o.createdAt).toISOString().split("T")[0];
    if (dayMap[key]) {
      dayMap[key].orders++;
      dayMap[key].revenue += o.totalAmount;
    }
  });
  const weeklyData = Object.entries(dayMap).map(([date, v]) => ({
    date: new Date(date).toLocaleDateString("vi-VN", { weekday: "short", day: "numeric" }),
    ...v,
  }));

  return NextResponse.json({
    totalOrders,
    todayOrders,
    totalRevenue: totalRevenue._sum.totalAmount ?? 0,
    todayRevenue: todayRevenue._sum.totalAmount ?? 0,
    avgWaitTime: Math.round(avgWait._avg.estimatedTime ?? 0),
    topProducts,
    satisfaction: {
      food: Number((feedbackStats._avg.foodRating ?? 0).toFixed(1)),
      service: Number((feedbackStats._avg.serviceRating ?? 0).toFixed(1)),
      waiting: Number((feedbackStats._avg.waitingRating ?? 0).toFixed(1)),
    },
    ordersByStatus: Object.fromEntries(ordersByStatus.map((r) => [r.status, r._count._all])),
    recentOrders,
    weeklyData,
  });
}
