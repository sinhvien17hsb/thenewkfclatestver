import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionUser } from "@/lib/auth-server";

export async function GET() {
  const items = await prisma.inventoryItem.findMany({
    include: { transactions: { orderBy: { createdAt: "desc" }, take: 5 } },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "MANAGER") {
    return NextResponse.json({ error: "Không có quyền." }, { status: 403 });
  }
  const { name, unit, currentStock, minimumStock } = await req.json();
  if (!name || !unit) {
    return NextResponse.json({ error: "Thiếu thông tin." }, { status: 400 });
  }
  const item = await prisma.inventoryItem.create({
    data: {
      name,
      unit,
      currentStock: Number(currentStock ?? 0),
      minimumStock: Number(minimumStock ?? 0),
    },
  });
  return NextResponse.json(item, { status: 201 });
}
