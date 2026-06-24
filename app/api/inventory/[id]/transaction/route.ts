import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionUser } from "@/lib/auth-server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user || user.role !== "MANAGER") return NextResponse.json({ error: "Không có quyền." }, { status: 403 });

  const { id } = await params;
  const { type, quantity, note } = await req.json();

  if (!["ADD", "REMOVE", "ADJUST"].includes(type) || quantity == null) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ." }, { status: 400 });
  }

  const item = await prisma.inventoryItem.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Không tìm thấy." }, { status: 404 });

  let newStock = item.currentStock;
  if (type === "ADD") newStock += Number(quantity);
  else if (type === "REMOVE") newStock = Math.max(0, newStock - Number(quantity));
  else newStock = Number(quantity); // ADJUST

  const [updated] = await prisma.$transaction([
    prisma.inventoryItem.update({ where: { id }, data: { currentStock: newStock } }),
    prisma.inventoryTransaction.create({
      data: { itemId: id, type, quantity: Number(quantity), note: note ?? null },
    }),
  ]);

  return NextResponse.json(updated);
}
