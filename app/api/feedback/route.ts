import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  const { orderId, tableNumber, foodRating, serviceRating, waitingRating, comment } = await req.json();
  if (!orderId || !foodRating || !serviceRating || !waitingRating) {
    return NextResponse.json({ error: "Thiếu thông tin." }, { status: 400 });
  }

  const existing = await prisma.feedback.findUnique({ where: { orderId } });
  if (existing) {
    return NextResponse.json({ error: "Đã gửi đánh giá cho đơn hàng này." }, { status: 409 });
  }

  const feedback = await prisma.feedback.create({
    data: {
      orderId,
      tableNumber: String(tableNumber ?? ""),
      foodRating: Number(foodRating),
      serviceRating: Number(serviceRating),
      waitingRating: Number(waitingRating),
      comment: comment ?? null,
    },
  });
  return NextResponse.json(feedback, { status: 201 });
}

export async function GET() {
  const feedbacks = await prisma.feedback.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(feedbacks);
}
