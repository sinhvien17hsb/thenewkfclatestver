import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionUser } from "@/lib/auth-server";

const VALID_STATUSES = ["queued", "preparing", "quality_check", "ready", "completed", "cancelled"];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getSessionUser();
    const { id } = await params;
    const { status } = await req.json();

    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Trạng thái không hợp lệ." }, { status: 400 });
    }

    // Mock users (id starts with "mock_") don't exist in the Employee table,
    // so skip changedById to avoid FK constraint violation.
    const changedById = user && !user.id.startsWith("mock_") ? user.id : undefined;

    const order = await prisma.order.update({
      where: { id },
      data: {
        status,
        statusHistory: {
          create: [{ status, ...(changedById ? { changedById } : {}) }],
        },
      },
      include: { items: { include: { menuItem: true } } },
    });

    return NextResponse.json(order);
  } catch (e) {
    console.error("[order status PATCH]", e);
    return NextResponse.json({ error: "Không thể cập nhật trạng thái." }, { status: 500 });
  }
}
