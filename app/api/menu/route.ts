import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const availableOnly = searchParams.get("available") === "true";

    const items = await prisma.menuItem.findMany({
      where: {
        ...(availableOnly ? { available: true } : {}),
        ...(category ? { category } : {}),
        ...(search ? { name: { contains: search } } : {}),
      },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(items);
  } catch (e) {
    console.error("[menu GET]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { name, description, category, price, imageEmoji, imageUrl, available, popular, prepTime } = await req.json();
  if (!name || !category || !price) {
    return NextResponse.json({ error: "Thiếu thông tin bắt buộc." }, { status: 400 });
  }

  const item = await prisma.menuItem.create({
    data: {
      name,
      description,
      category,
      price: Number(price),
      imageEmoji: imageEmoji ?? "🍽️",
      imageUrl: imageUrl ?? "",
      available: available ?? true,
      popular: popular ?? false,
      prepTime: prepTime ? Number(prepTime) : 10,
    },
  });
  return NextResponse.json(item, { status: 201 });
}
