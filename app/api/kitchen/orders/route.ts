import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  const orders = await prisma.order.findMany({
    where: { status: { in: ["queued", "preparing", "quality_check", "ready"] } },
    include: { items: { include: { menuItem: true } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(orders);
}
