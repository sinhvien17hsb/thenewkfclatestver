import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  const requests = await prisma.serviceRequest.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json(requests);
}

export async function POST(req: Request) {
  const { tableNumber, type } = await req.json();
  if (!tableNumber || !type) {
    return NextResponse.json({ error: "Thiếu thông tin." }, { status: 400 });
  }
  const request = await prisma.serviceRequest.create({
    data: { tableNumber: String(tableNumber), type },
  });
  return NextResponse.json(request, { status: 201 });
}
