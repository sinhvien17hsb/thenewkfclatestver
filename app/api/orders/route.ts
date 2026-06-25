import { NextResponse } from "next/server";
import prisma from "@/lib/db";

function generateOrderNumber(): string {
  const now = new Date();
  const time = `${now.getHours().toString().padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}`;
  const rand = Math.floor(Math.random() * 900 + 100);
  return `KFC${time}${rand}`;
}

export async function POST(req: Request) {
  try {
    const { tableNumber, customerName, items } = await req.json();

    if (!tableNumber || !items || items.length === 0) {
      return NextResponse.json({ error: "Thông tin đơn hàng không hợp lệ." }, { status: 400 });
    }

    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: items.map((i: { menuItemId: string }) => i.menuItemId) } },
    });

    const total = items.reduce((sum: number, item: { menuItemId: string; quantity: number }) => {
      const mi = menuItems.find((m) => m.id === item.menuItemId);
      return sum + (mi?.price ?? 0) * item.quantity;
    }, 0);

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        tableNumber: String(tableNumber),
        customerName: customerName ?? null,
        status: "queued",
        totalAmount: total,
        estimatedTime: Math.max(10, items.length * 4),
        items: {
          create: items.map((item: { menuItemId: string; quantity: number; notes?: string }) => {
            const mi = menuItems.find((m) => m.id === item.menuItemId)!;
            return {
              menuItemId: item.menuItemId,
              quantity: item.quantity,
              price: mi.price,
              notes: item.notes ?? null,
            };
          }),
        },
        statusHistory: {
          create: [{ status: "queued" }],
        },
      },
      include: { items: { include: { menuItem: true } } },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Lỗi hệ thống." }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const tableNumber = searchParams.get("tableNumber");
  const status = searchParams.get("status");

  const orders = await prisma.order.findMany({
    where: {
      ...(tableNumber ? { tableNumber } : {}),
      ...(status ? { status } : {}),
    },
    include: { items: { include: { menuItem: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(orders);
}
