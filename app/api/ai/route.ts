import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  const { message, context } = await req.json();
  if (!message) return NextResponse.json({ error: "Thiếu tin nhắn." }, { status: 400 });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "AI chưa được cấu hình." }, { status: 503 });

  const menuItems = await prisma.menuItem.findMany({ where: { available: true } });

  const menuContext = menuItems
    .map((m) => `${m.imageEmoji} ${m.name} - ${m.price.toLocaleString("vi-VN")}đ (${m.category})${m.description ? `: ${m.description}` : ""}`)
    .join("\n");

  const systemPrompt = `Bạn là trợ lý AI của nhà hàng KFC Sync. Trả lời bằng tiếng Việt, ngắn gọn, thân thiện và chuyên nghiệp.

THỰC ĐƠN HIỆN TẠI:
${menuContext || "Thực đơn đang được cập nhật."}

${context === "manager" ? `Bạn đang hỗ trợ quản lý cửa hàng. Cung cấp phân tích kinh doanh, gợi ý vận hành, và insights về hiệu suất.` : `Bạn đang hỗ trợ khách hàng. Giúp gợi ý món ăn, trả lời câu hỏi về thực đơn, và hướng dẫn đặt hàng.`}

Quy tắc:
- Không bịa đặt thông tin không có trong thực đơn
- Nếu không có dữ liệu, hãy nói thật lịch sự
- Luôn đề xuất món cụ thể từ thực đơn khi được hỏi về gợi ý`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(`${systemPrompt}\n\nKhách hàng: ${message}`);
    const text = result.response.text();
    return NextResponse.json({ reply: text });
  } catch (e) {
    console.error("Gemini error:", e);
    return NextResponse.json({ error: "Không thể kết nối AI lúc này." }, { status: 503 });
  }
}
