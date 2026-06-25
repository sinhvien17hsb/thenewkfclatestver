import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionUser } from "@/lib/auth-server";

const VALID_STATUSES = ["queued", "preparing", "quality_check", "ready", "completed", "cancelled"];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getSessionUser();

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
        create: [{ status, ...(user ? { changedById: user.id } : {}) }],
      },
    },
    include: { items: { include: { menuItem: true } } },
  });

  return NextResponse.json(order);
}
