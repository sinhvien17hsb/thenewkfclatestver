import { NextResponse } from "next/server";
import prisma from "@/lib/db";

function generateOrderNumber(): string {
  const now = new Date();
  const time = `${now.getHours().toString().padStart(2, "0")}${now.getMinutes().toString().padStart(2, "0")}`;
  const rand = Math.floor(Math.random() * 900 + 100);
  return `KFC${time}${rand}`;
}

const DELIVERY_FEE = 15000;

export async function POST(req: Request) {
  try {
    const { tableNumber, customerName, items, orderType, deliveryAddress, deliveryPhone } = await req.json();

    const isDelivery = orderType === "delivery";

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Thông tin đơn hàng không hợp lệ." }, { status: 400 });
    }
    if (isDelivery && (!deliveryAddress || !deliveryPhone)) {
      return NextResponse.json({ error: "Vui lòng nhập địa chỉ và số điện thoại giao hàng." }, { status: 400 });
    }
    if (!isDelivery && !tableNumber) {
      return NextResponse.json({ error: "Vui lòng nhập số bàn." }, { status: 400 });
    }

    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: items.map((i: { menuItemId: string }) => i.menuItemId) } },
    });

    const subtotal = items.reduce((sum: number, item: { menuItemId: string; quantity: number }) => {
      const mi = menuItems.find((m) => m.id === item.menuItemId);
      return sum + (mi?.price ?? 0) * item.quantity;
    }, 0);

    const total = isDelivery ? subtotal + DELIVERY_FEE : subtotal;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const order = await (prisma.order.create as any)({
      data: {
        orderNumber: generateOrderNumber(),
        tableNumber: isDelivery ? "DELIVERY" : String(tableNumber),
        customerName: customerName ?? null,
        orderType: isDelivery ? "delivery" : "dine_in",
        deliveryAddress: isDelivery ? deliveryAddress : null,
        deliveryPhone: isDelivery ? deliveryPhone : null,
        status: "queued",
        totalAmount: total,
        estimatedTime: isDelivery ? Math.max(30, items.length * 4 + 20) : Math.max(10, items.length * 4),
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
