import { NextResponse } from "next/server";
import prisma from "@/lib/db";

type MenuItem = { name: string; price: number; category: string; description: string | null; popular: boolean };

function fmt(p: number) { return p.toLocaleString("vi-VN") + "đ"; }

function match(text: string, ...keywords: string[]) {
  const t = text.toLowerCase();
  return keywords.some((k) => t.includes(k));
}

function buildReply(msg: string, menu: MenuItem[]): string {
  const popular = menu.filter((i) => i.popular);

  // Greeting
  if (match(msg, "xin chào", "hello", "hi", "chào", "alo")) {
    return "Xin chào! Tôi là trợ lý KFC 🍗 Bạn muốn hỏi về món ăn, combo hay cách đặt hàng?";
  }

  // Recommend / what to eat
  if (match(msg, "gợi ý", "nên ăn", "chọn gì", "ăn gì", "đặt gì", "recommend", "hôm nay")) {
    const picks = popular.slice(0, 3).map((i) => `• ${i.name} – ${fmt(i.price)}`).join("\n");
    return `Hôm nay tôi gợi ý những món đang được ưa chuộng nhất:\n\n${picks}\n\nBạn thích loại nào? 😊`;
  }

  // Combo
  if (match(msg, "combo", "set", "bộ")) {
    const combos = menu.filter((i) => i.category.startsWith("combo")).slice(0, 4);
    if (combos.length === 0) return "Hiện tại chúng tôi có nhiều loại combo. Bạn vào mục Thực đơn để xem chi tiết nhé!";
    const list = combos.map((i) => `• ${i.name} – ${fmt(i.price)}`).join("\n");
    return `Các combo của chúng tôi:\n\n${list}\n\nCombo tiết kiệm hơn mua lẻ từ 15–25%! 🎁`;
  }

  // Chicken
  if (match(msg, "gà rán", "gà", "chicken", "fried")) {
    const items = menu.filter((i) => i.category === "ga_ran").slice(0, 4);
    const list = items.map((i) => `• ${i.name} – ${fmt(i.price)}`).join("\n");
    return `Các món Gà Rán của KFC:\n\n${list}\n\nGà KFC dùng công thức 11 loại gia vị bí truyền 🍗`;
  }

  // Burger
  if (match(msg, "burger", "sandwich", "bánh mì")) {
    const items = menu.filter((i) => i.category === "burger_com" && i.name.toLowerCase().includes("burger")).slice(0, 4);
    const list = items.map((i) => `• ${i.name} – ${fmt(i.price)}`).join("\n");
    return `Các loại Burger tại KFC:\n\n${list}`;
  }

  // Rice / pasta
  if (match(msg, "cơm", "mì ý", "pasta", "rice")) {
    const items = menu.filter((i) => i.category === "burger_com" && !i.name.toLowerCase().includes("burger")).slice(0, 4);
    const list = items.map((i) => `• ${i.name} – ${fmt(i.price)}`).join("\n");
    return `Các món Cơm & Mì Ý tại KFC:\n\n${list}`;
  }

  // Drinks
  if (match(msg, "đồ uống", "nước", "pepsi", "drink", "uống")) {
    const items = menu.filter((i) => i.category === "do_uong").slice(0, 4);
    const list = items.map((i) => `• ${i.name} – ${fmt(i.price)}`).join("\n");
    return `Đồ uống hiện có:\n\n${list}`;
  }

  // Sides / snacks
  if (match(msg, "khoai", "popcorn", "salad", "bắp cải", "phô mai viên", "snack", "ăn nhẹ", "món phụ")) {
    const items = menu.filter((i) => i.category === "mon_phu").slice(0, 4);
    const list = items.map((i) => `• ${i.name} – ${fmt(i.price)}`).join("\n");
    return `Các món ăn nhẹ (Sides):\n\n${list}`;
  }

  // New items
  if (match(msg, "món mới", "mới ra", "tiêu chanh", "mắm tỏi", "lắc")) {
    const items = menu.filter((i) => i.category === "mon_moi").slice(0, 4);
    const list = items.map((i) => `• ${i.name} – ${fmt(i.price)}`).join("\n");
    return `Các món mới nhất của KFC:\n\n${list}\n\nĐây là những món đang hot nhất! 🆕`;
  }

  // Deals / discount
  if (match(msg, "ưu đãi", "khuyến mãi", "giảm giá", "deal", "rẻ", "tiết kiệm")) {
    const items = menu.filter((i) => i.category === "uu_dai").slice(0, 4);
    const list = items.map((i) => `• ${i.name} – ${fmt(i.price)}`).join("\n");
    return `Các ưu đãi đang có:\n\n${list}\n\nĐặt ngay kẻo hết! 🔥`;
  }

  // Price / cheapest
  if (match(msg, "rẻ nhất", "giá rẻ", "bao nhiêu tiền", "giá", "price", "cheap")) {
    const sorted = [...menu].sort((a, b) => a.price - b.price).slice(0, 3);
    const list = sorted.map((i) => `• ${i.name} – ${fmt(i.price)}`).join("\n");
    return `Các món giá rẻ nhất:\n\n${list}`;
  }

  // Delivery
  if (match(msg, "giao hàng", "delivery", "ship", "tới nhà", "địa chỉ")) {
    return "KFC hỗ trợ giao hàng tận nơi! 🛵\n\nVào Giỏ hàng → chọn \"Giao hàng về nhà\" → nhập địa chỉ và số điện thoại.\n\nPhí giao hàng: 15.000đ. Thời gian: 30–45 phút.";
  }

  // Order / how to order
  if (match(msg, "đặt hàng", "order", "cách đặt", "làm sao", "hướng dẫn")) {
    return "Cách đặt món tại KFC Sync:\n\n1️⃣ Vào Thực đơn → chọn món\n2️⃣ Nhấn \"Thêm\" để vào Giỏ hàng\n3️⃣ Chọn Ăn tại quán hoặc Giao hàng\n4️⃣ Nhấn \"Đặt hàng\"\n5️⃣ Theo dõi đơn ở trang Đơn hàng";
  }

  // Hours / time
  if (match(msg, "giờ mở cửa", "mấy giờ", "open", "giờ làm")) {
    return "KFC Sync mở cửa từ 8:00 – 22:00 hàng ngày, kể cả cuối tuần và ngày lễ! 🕗";
  }

  // Family / kids
  if (match(msg, "gia đình", "trẻ em", "family", "kids", "cho bé")) {
    const family = menu.filter((i) => i.category === "combo_nhom" || i.category === "combo_2").slice(0, 3);
    const list = family.map((i) => `• ${i.name} – ${fmt(i.price)}`).join("\n");
    return `Cho gia đình và nhóm bạn, tôi gợi ý:\n\n${list}\n\nCác combo nhóm tiết kiệm hơn mua lẻ rất nhiều! 👨‍👩‍👧‍👦`;
  }

  // Spicy
  if (match(msg, "cay", "spicy", "zinger")) {
    const items = menu.filter((i) => i.name.toLowerCase().includes("zinger") || i.name.toLowerCase().includes("cay") || i.name.toLowerCase().includes("mắm tỏi")).slice(0, 4);
    const list = items.map((i) => `• ${i.name} – ${fmt(i.price)}`).join("\n");
    return `Các món cay được yêu thích:\n\n${list}\n\n🌶️ Cảnh báo: khá cay đấy!`;
  }

  // Thank you
  if (match(msg, "cảm ơn", "thanks", "thank you", "ok", "được rồi")) {
    return "Không có gì! Chúc bạn ngon miệng nhé 😊 Nếu cần hỗ trợ thêm, cứ hỏi tôi!";
  }

  // Fallback
  const suggestion = popular[Math.floor(Math.random() * Math.min(3, popular.length))];
  return `Tôi hiểu bạn đang hỏi về "${msg}".\n\nHiện tôi có thể giúp bạn về:\n• Gợi ý món ăn\n• Xem combo\n• Thông tin giá\n• Cách đặt hàng & giao hàng\n\n${suggestion ? `Hôm nay bạn thử "${suggestion.name}" – ${fmt(suggestion.price)} không? 🍗` : "Bạn thử vào Thực đơn để xem đầy đủ nhé!"}`;
}

export async function POST(req: Request) {
  const { message } = await req.json();
  if (!message) return NextResponse.json({ error: "Thiếu tin nhắn." }, { status: 400 });

  const menu = await prisma.menuItem.findMany({
    where: { available: true },
    select: { name: true, price: true, category: true, description: true, popular: true },
  });

  const reply = buildReply(message, menu as MenuItem[]);
  return NextResponse.json({ reply });
}
