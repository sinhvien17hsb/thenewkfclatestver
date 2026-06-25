import { NextResponse } from "next/server";
import prisma from "@/lib/db";

function match(text: string, ...kw: string[]) {
  const t = text.toLowerCase();
  return kw.some((k) => t.includes(k));
}

function buildStaffReply(msg: string, activeOrders: number, queuedCount: number): string {
  // Greetings
  if (match(msg, "xin chào", "hello", "hi", "chào")) {
    return `Chào bạn! 👋 Tôi là trợ lý KFC dành cho nhân viên.\n\nTôi có thể giúp bạn:\n• Quy trình chế biến món ăn\n• Quản lý đơn hàng\n• Kiểm tra chất lượng\n• Vệ sinh & an toàn thực phẩm`;
  }

  // Order status
  if (match(msg, "đơn hàng", "order", "bao nhiêu đơn", "đơn chờ", "queue")) {
    return `📋 Tình trạng đơn hàng hiện tại:\n• Tổng đơn đang xử lý: ${activeOrders}\n• Đơn đang chờ (queued): ${queuedCount}\n\nHãy ưu tiên xử lý các đơn đã chờ lâu nhất nhé!`;
  }

  // Chicken frying SOP
  if (match(msg, "gà rán", "chiên gà", "rán gà", "fried chicken", "nhiệt độ dầu", "dầu chiên")) {
    return `🍗 Quy trình chiên gà KFC:\n\n1. Nhiệt độ dầu: 165–175°C\n2. Gà đã tẩm bột để ráo 5–10 phút trước khi chiên\n3. Thời gian chiên: 12–15 phút (gà nguyên miếng)\n4. Nhiệt độ bên trong tối thiểu: 75°C\n5. Để ráo dầu 2 phút trước khi phục vụ\n\n⚠️ Không tái sử dụng dầu quá 8 giờ liên tục.`;
  }

  // Tender / strips
  if (match(msg, "tender", "strips", "gà tenders")) {
    return `🍗 Quy trình Gà Tenders:\n\n1. Dầu: 175°C\n2. Thời gian chiên: 6–8 phút\n3. Màu vàng đều, giòn\n4. Nhiệt độ bên trong: ≥ 75°C\n5. Phục vụ ngay sau khi chiên`;
  }

  // Popcorn chicken
  if (match(msg, "popcorn", "gà viên", "nuggets")) {
    return `🍿 Quy trình Gà Viên Popcorn:\n\n1. Dầu: 175°C\n2. Thời gian chiên: 4–5 phút\n3. Lắc giỏ 1 lần giữa quá trình\n4. Màu vàng đều, giòn rụm\n5. Đóng hộp ngay, không để quá 30 phút`;
  }

  // Fries / khoai tây
  if (match(msg, "khoai tây", "fries", "khoai chiên")) {
    return `🍟 Quy trình Khoai Tây Chiên:\n\n1. Dầu: 175°C\n2. Khoai từ tủ đông, không rã đông trước\n3. Thời gian chiên: 3–4 phút\n4. Lắc sau 1.5 phút\n5. Rắc muối ngay sau khi vớt ra\n6. Thời gian phục vụ tối đa: 7 phút`;
  }

  // Burger / sandwich
  if (match(msg, "burger", "bánh burger", "sandwich", "zinger")) {
    return `🍔 Quy trình Burger:\n\n1. Bánh mì nướng: 15 giây, nhiệt độ 190°C\n2. Sốt phủ đều không chảy ra mép\n3. Rau: tươi, khô ráo\n4. Xếp theo thứ tự: bánh dưới → sốt → rau → gà → bánh trên\n5. Gói chắc, phục vụ trong 10 phút`;
  }

  // Rice
  if (match(msg, "cơm", "rice", "nấu cơm")) {
    return `🍚 Quy trình Cơm:\n\n1. Tỷ lệ gạo:nước = 1:1.2\n2. Nấu đến khi chín, giữ ấm ≥ 60°C\n3. Không giữ cơm quá 4 giờ\n4. Định lượng mỗi phần: 180g\n5. Rưới sốt trước khi phục vụ`;
  }

  // Quality check
  if (match(msg, "kiểm tra chất lượng", "quality", "chất lượng", "qa", "qc")) {
    return `✅ Tiêu chuẩn kiểm tra chất lượng KFC:\n\n🌡️ Nhiệt độ:\n• Món nóng: ≥ 65°C\n• Đồ uống lạnh: ≤ 5°C\n\n👀 Ngoại quan:\n• Màu vàng đều, không cháy\n• Không bị gãy vỡ\n• Khẩu phần đúng định lượng\n\n⏱️ Thời gian:\n• Gà rán: tối đa 30 phút sau chiên\n• Khoai chiên: tối đa 7 phút\n• Burger: tối đa 10 phút`;
  }

  // Hygiene / cleaning
  if (match(msg, "vệ sinh", "clean", "lau", "dọn dẹp", "hygiene")) {
    return `🧹 Quy trình vệ sinh ca làm việc:\n\n⏰ Mỗi giờ:\n• Lau mặt bếp và khu vực chế biến\n• Kiểm tra sàn khu bếp\n\n🔁 Mỗi 2 giờ:\n• Thay dầu chiên nếu cần\n• Vệ sinh dụng cụ đang dùng\n\n🔚 Cuối ca:\n• Vệ sinh toàn bộ thiết bị\n• Dọn dầu chiên\n• Kiểm tra kho lạnh\n• Lau sàn toàn khu bếp`;
  }

  // Oil / dầu chiên
  if (match(msg, "thay dầu", "dầu", "oil", "dầu cũ")) {
    return `🛢️ Quy trình quản lý dầu chiên:\n\n• Nhiệt độ hoạt động: 165–175°C\n• Thay dầu sau mỗi 8 giờ hoạt động liên tục\n• Kiểm tra màu: dầu đen/tối → thay ngay\n• Lọc dầu mỗi 4 giờ\n• Ghi nhật ký thay dầu theo form`;
  }

  // Food storage / bảo quản
  if (match(msg, "bảo quản", "tủ lạnh", "đông lạnh", "kho", "storage", "hết hạn")) {
    return `❄️ Quy trình bảo quản thực phẩm:\n\n🧊 Tủ đông: ≤ -18°C\n• Gà sống, gà tẩm bột\n• Khoai tây chưa chế biến\n\n🌡️ Tủ mát: 0–4°C\n• Rau, nguyên liệu tươi\n• Sốt đóng gói đã mở\n\n📦 Nguyên tắc FIFO:\n• Hàng nhập trước dùng trước\n• Dán nhãn ngày nhập & hạn dùng`;
  }

  // Shift / ca làm việc
  if (match(msg, "ca làm", "shift", "giờ làm", "lịch", "bàn giao")) {
    return `⏰ Quy trình bàn giao ca:\n\n✅ Checklist bàn giao:\n• Tình trạng đơn hàng đang xử lý\n• Mức dầu chiên và chất lượng dầu\n• Tồn kho nguyên liệu\n• Vệ sinh khu vực\n• Thiết bị hoạt động bình thường\n• Ghi log sự cố (nếu có)`;
  }

  // Emergency / incident
  if (match(msg, "sự cố", "cháy", "tai nạn", "emergency", "khẩn cấp", "hỏng")) {
    return `🚨 Xử lý sự cố khẩn cấp:\n\n🔥 Cháy nổ: Tắt thiết bị → sử dụng bình chữa cháy → sơ tán → gọi 114\n\n⚡ Điện: Ngắt aptomat khu vực → báo kỹ thuật\n\n🤕 Tai nạn: Sơ cứu ngay → báo quản lý → ghi biên bản\n\n📞 Liên hệ ngay quản lý ca hoặc giám sát!`;
  }

  // Customer complaint
  if (match(msg, "khách phàn nàn", "khiếu nại", "complaint", "khách hàng bực")) {
    return `👥 Xử lý phàn nàn khách hàng:\n\n1. Lắng nghe, không ngắt lời\n2. Xin lỗi chân thành\n3. Xác nhận vấn đề cụ thể\n4. Đề xuất giải pháp: đổi món / hoàn tiền / ưu đãi\n5. Báo cáo giám sát ca\n6. Ghi nhận vào hệ thống phản hồi`;
  }

  // Fallback
  return `Tôi hiểu bạn đang hỏi về: "${msg}"\n\nTôi có thể giúp bạn về:\n• 🍗 Quy trình chế biến (gà rán, burger, khoai, cơm...)\n• 📋 Quản lý đơn hàng\n• ✅ Kiểm tra chất lượng\n• 🧹 Vệ sinh & an toàn\n• ⏰ Ca làm việc & bàn giao\n• 🚨 Xử lý sự cố\n\nHãy hỏi cụ thể hơn nhé!`;
}

export async function POST(req: Request) {
  const { message } = await req.json();
  if (!message) return NextResponse.json({ error: "Thiếu tin nhắn." }, { status: 400 });

  const [activeOrders, queuedOrders] = await Promise.all([
    prisma.order.count({ where: { status: { notIn: ["completed", "cancelled"] } } }),
    prisma.order.count({ where: { status: "queued" } }),
  ]);

  const reply = buildStaffReply(message, activeOrders, queuedOrders);
  return NextResponse.json({ reply });
}
