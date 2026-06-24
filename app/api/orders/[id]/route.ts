import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { menuItem: true } },
      statusHistory: { orderBy: { changedAt: "asc" } },
    },
  });
  if (!order) return NextResponse.json({ error: "Không tìm thấy đơn hàng." }, { status: 404 });
  return NextResponse.json(order);
}
