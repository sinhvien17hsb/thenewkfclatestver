import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionUser } from "@/lib/auth-server";

const VALID_STATUSES = ["RECEIVED", "PREPARING", "READY", "DELIVERED"];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Chưa đăng nhập." }, { status: 401 });

  const { id } = await params;
  const { status } = await req.json();

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Trạng thái không hợp lệ." }, { status: 400 });
  }

  const order = await prisma.order.update({
    where: { id },
    data: {
      status,
      statusHistory: {
        create: [{ status, changedById: user.id }],
      },
    },
    include: { items: { include: { menuItem: true } } },
  });

  return NextResponse.json(order);
}
