import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  const orders = await prisma.order.findMany({
    where: { status: { in: ["RECEIVED", "PREPARING", "READY"] } },
    include: { items: { include: { menuItem: true } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(orders);
}
