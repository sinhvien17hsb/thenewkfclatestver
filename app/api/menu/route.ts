import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getSessionUser } from "@/lib/auth-server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  const items = await prisma.menuItem.findMany({
    where: {
      available: true,
      ...(category ? { category } : {}),
      ...(search ? { name: { contains: search } } : {}),
    },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  if (!user || user.role !== "MANAGER") {
    return NextResponse.json({ error: "Không có quyền." }, { status: 403 });
  }

  const { name, description, category, price, imageEmoji, available } = await req.json();
  if (!name || !category || !price) {
    return NextResponse.json({ error: "Thiếu thông tin bắt buộc." }, { status: 400 });
  }

  const item = await prisma.menuItem.create({
    data: { name, description, category, price: Number(price), imageEmoji: imageEmoji ?? "🍽️", available: available ?? true },
  });
  return NextResponse.json(item, { status: 201 });
}
