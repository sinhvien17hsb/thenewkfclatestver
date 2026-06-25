import { NextResponse } from "next/server";
import prisma from "@/lib/db";

function fmt(n: number) { return n.toLocaleString("vi-VN") + "đ"; }
function pct(a: number, b: number) { return b === 0 ? "0%" : ((a / b) * 100).toFixed(1) + "%"; }
function match(text: string, ...kw: string[]) {
  const t = text.toLowerCase();
  return kw.some((k) => t.includes(k));
}

export async function POST(req: Request) {
  const { message } = await req.json();
  if (!message) return NextResponse.json({ error: "Thiếu tin nhắn." }, { status: 400 });

  const now = new Date();
  const todayStart = new Date(now); todayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date(now); weekStart.setDate(now.getDate() - 7);
  const monthStart = new Date(now); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);

  // Greeting
  if (match(message, "xin chào", "hello", "hi", "chào")) {
    const todayOrders = await prisma.order.count({ where: { createdAt: { gte: todayStart } } });
    const todayRevenue = await prisma.order.aggregate({ where: { createdAt: { gte: todayStart }, status: { not: "cancelled" } }, _sum: { totalAmount: true } });
    const rev = todayRevenue._sum.totalAmount ?? 0;
    return NextResponse.json({ reply: `Xin chào Quản lý! 👋\n\n📊 Tóm tắt hôm nay (${now.toLocaleDateString("vi-VN")}):\n• Tổng đơn: ${todayOrders} đơn\n• Doanh thu: ${fmt(rev)}\n\nTôi có thể phân tích doanh thu, sản phẩm bán chạy, hiệu suất nhân viên và nhiều hơn nữa. Bạn cần xem gì?` });
  }

  // Revenue today
  if (match(message, "doanh thu hôm nay", "revenue hôm nay", "today revenue", "doanh số hôm nay")) {
    const agg = await prisma.order.aggregate({ where: { createdAt: { gte: todayStart }, status: { not: "cancelled" } }, _sum: { totalAmount: true }, _count: true });
    const rev = agg._sum.totalAmount ?? 0;
    const count = agg._count;
    const avg = count > 0 ? rev / count : 0;
    return NextResponse.json({ reply: `💰 Doanh thu hôm nay (${now.toLocaleDateString("vi-VN")}):\n\n• Tổng doanh thu: ${fmt(rev)}\n• Số đơn thành công: ${count}\n• Giá trị trung bình/đơn: ${fmt(avg)}` });
  }

  // Revenue this week
  if (match(message, "tuần này", "doanh thu tuần", "week", "7 ngày")) {
    const agg = await prisma.order.aggregate({ where: { createdAt: { gte: weekStart }, status: { not: "cancelled" } }, _sum: { totalAmount: true }, _count: true });
    const rev = agg._sum.totalAmount ?? 0;
    const count = agg._count;
    return NextResponse.json({ reply: `📅 Doanh thu 7 ngày qua:\n\n• Tổng doanh thu: ${fmt(rev)}\n• Tổng số đơn: ${count}\n• Trung bình/ngày: ${fmt(rev / 7)}\n• Trung bình/đơn: ${fmt(count > 0 ? rev / count : 0)}` });
  }

  // Revenue this month
  if (match(message, "tháng này", "doanh thu tháng", "month")) {
    const agg = await prisma.order.aggregate({ where: { createdAt: { gte: monthStart }, status: { not: "cancelled" } }, _sum: { totalAmount: true }, _count: true });
    const rev = agg._sum.totalAmount ?? 0;
    const count = agg._count;
    const daysElapsed = Math.max(1, Math.ceil((now.getTime() - monthStart.getTime()) / 86400000));
    return NextResponse.json({ reply: `📅 Doanh thu tháng ${now.getMonth() + 1}/${now.getFullYear()}:\n\n• Tổng doanh thu: ${fmt(rev)}\n• Tổng số đơn: ${count}\n• Số ngày đã qua: ${daysElapsed} ngày\n• Trung bình/ngày: ${fmt(rev / daysElapsed)}\n• Trung bình/đơn: ${fmt(count > 0 ? rev / count : 0)}` });
  }

  // Top products
  if (match(message, "sản phẩm bán chạy", "món bán nhiều", "top món", "best seller", "phổ biến nhất")) {
    const items = await prisma.orderItem.groupBy({ by: ["menuItemId"], _sum: { quantity: true }, orderBy: { _sum: { quantity: "desc" } }, take: 5 });
    const ids = items.map((i) => i.menuItemId);
    const menuItems = await prisma.menuItem.findMany({ where: { id: { in: ids } } });
    const lines = items.map((i) => {
      const m = menuItems.find((mi) => mi.id === i.menuItemId);
      return `• ${m?.name ?? "Không rõ"}: ${i._sum.quantity ?? 0} phần`;
    });
    return NextResponse.json({ reply: `🏆 Top 5 sản phẩm bán chạy nhất:\n\n${lines.join("\n")}\n\nDữ liệu tổng hợp từ toàn bộ lịch sử đơn hàng.` });
  }

  // Order status breakdown
  if (match(message, "tình trạng đơn", "order status", "đơn đang xử lý", "pipeline", "bếp")) {
    const statuses = await prisma.order.groupBy({ by: ["status"], _count: true, where: { createdAt: { gte: todayStart } } });
    const statusLabels: Record<string, string> = { queued: "⏳ Chờ xử lý", preparing: "🔥 Đang làm", quality_check: "✅ Kiểm tra CL", ready: "🛎️ Sẵn sàng", completed: "✔️ Hoàn thành", cancelled: "❌ Hủy" };
    const lines = statuses.map((s) => `${statusLabels[s.status] ?? s.status}: ${s._count}`);
    return NextResponse.json({ reply: `📋 Tình trạng đơn hàng hôm nay:\n\n${lines.join("\n")}` });
  }

  // Customer satisfaction / feedback
  if (match(message, "đánh giá", "feedback", "hài lòng", "satisfaction", "review", "chất lượng dịch vụ")) {
    const feedbacks = await prisma.feedback.findMany({ where: { createdAt: { gte: weekStart } }, select: { foodRating: true, serviceRating: true, waitingRating: true } });
    if (feedbacks.length === 0) return NextResponse.json({ reply: "Chưa có đánh giá nào trong 7 ngày qua." });
    const avg = (key: keyof typeof feedbacks[0]) => (feedbacks.reduce((s, f) => s + (f[key] as number), 0) / feedbacks.length).toFixed(1);
    return NextResponse.json({ reply: `⭐ Đánh giá khách hàng (7 ngày qua, ${feedbacks.length} lượt):\n\n• Chất lượng món ăn: ${avg("foodRating")}/5\n• Chất lượng dịch vụ: ${avg("serviceRating")}/5\n• Thời gian chờ: ${avg("waitingRating")}/5` });
  }

  // Delivery vs dine-in
  if (match(message, "giao hàng", "delivery", "tại quán", "dine in", "kênh bán")) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [delivery, dinein, total] = await Promise.all([
      (prisma.order.count as any)({ where: { createdAt: { gte: weekStart }, orderType: "delivery", status: { not: "cancelled" } } }),
      (prisma.order.count as any)({ where: { createdAt: { gte: weekStart }, orderType: { not: "delivery" }, status: { not: "cancelled" } } }),
      prisma.order.count({ where: { createdAt: { gte: weekStart }, status: { not: "cancelled" } } }),
    ]);
    return NextResponse.json({ reply: `🛵 Phân tích kênh bán hàng (7 ngày qua):\n\n• Giao hàng: ${delivery} đơn (${pct(delivery, total)})\n• Tại quán: ${dinein} đơn (${pct(dinein, total)})\n• Tổng: ${total} đơn\n\n${delivery > dinein ? "📈 Giao hàng chiếm đa số — cân nhắc tối ưu quy trình giao hàng." : "🪑 Khách tại quán chiếm đa số — tập trung trải nghiệm tại chỗ."}` });
  }

  // Menu / items
  if (match(message, "thực đơn", "menu", "món ăn", "số lượng món")) {
    const [total, byCategory] = await Promise.all([
      prisma.menuItem.count({ where: { available: true } }),
      prisma.menuItem.groupBy({ by: ["category"], _count: true, where: { available: true } }),
    ]);
    const catNames: Record<string, string> = { uu_dai: "Ưu Đãi", mon_moi: "Món Mới", combo_1: "Combo 1 Người", combo_2: "Combo 2 Người", combo_nhom: "Combo Nhóm", ga_ran: "Gà Rán", burger_com: "Burger–Cơm–Mì Ý", mon_phu: "Thức Ăn Nhẹ", do_uong: "Đồ Uống & Tráng Miệng" };
    const lines = byCategory.map((c) => `• ${catNames[c.category] ?? c.category}: ${c._count} món`);
    return NextResponse.json({ reply: `🍽️ Tổng quan thực đơn:\n\n• Tổng số món: ${total} món đang bán\n\n${lines.join("\n")}` });
  }

  // Recommendation / advice
  if (match(message, "gợi ý", "khuyến nghị", "nên làm gì", "cải thiện", "tăng doanh thu", "advice")) {
    const [todayRev, weekRev, topItem] = await Promise.all([
      prisma.order.aggregate({ where: { createdAt: { gte: todayStart }, status: { not: "cancelled" } }, _sum: { totalAmount: true }, _count: true }),
      prisma.order.aggregate({ where: { createdAt: { gte: weekStart }, status: { not: "cancelled" } }, _sum: { totalAmount: true } }),
      prisma.orderItem.groupBy({ by: ["menuItemId"], _sum: { quantity: true }, orderBy: { _sum: { quantity: "desc" } }, take: 1 }),
    ]);
    const dayAvg = (weekRev._sum.totalAmount ?? 0) / 7;
    const todayRevNum = todayRev._sum.totalAmount ?? 0;
    const trend = todayRevNum >= dayAvg ? "📈 tốt hơn" : "📉 thấp hơn";
    let topName = "không có dữ liệu";
    if (topItem[0]) {
      const mi = await prisma.menuItem.findUnique({ where: { id: topItem[0].menuItemId }, select: { name: true } });
      topName = mi?.name ?? topName;
    }
    return NextResponse.json({ reply: `💡 Phân tích & Khuyến nghị:\n\n📊 Hôm nay ${trend} trung bình tuần\n• Hôm nay: ${fmt(todayRevNum)}\n• TB tuần: ${fmt(dayAvg)}\n\n🏆 Món bán chạy nhất: ${topName}\n→ Đảm bảo luôn đủ nguyên liệu cho món này\n\n💡 Gợi ý:\n• Đẩy mạnh combo vào giờ cao điểm (11h–13h, 17h–20h)\n• Kiểm tra mức hài lòng khách hàng thường xuyên\n• Theo dõi tỷ lệ hủy đơn để phát hiện vấn đề` });
  }

  // Cancelled orders
  if (match(message, "hủy đơn", "cancelled", "đơn hủy")) {
    const [cancelled, total] = await Promise.all([
      prisma.order.count({ where: { createdAt: { gte: weekStart }, status: "cancelled" } }),
      prisma.order.count({ where: { createdAt: { gte: weekStart } } }),
    ]);
    return NextResponse.json({ reply: `❌ Đơn hủy (7 ngày qua):\n\n• Số đơn hủy: ${cancelled}\n• Tổng đơn: ${total}\n• Tỷ lệ hủy: ${pct(cancelled, total)}\n\n${cancelled > 5 ? "⚠️ Tỷ lệ hủy đơn cao — cần kiểm tra nguyên nhân: thời gian chờ, hết nguyên liệu, hay lỗi kỹ thuật?" : "✅ Tỷ lệ hủy đơn ở mức chấp nhận được."}` });
  }

  // General summary
  if (match(message, "tổng quan", "overview", "tóm tắt", "summary", "báo cáo")) {
    const [todayAgg, weekAgg, activeOrders, feedbackCount] = await Promise.all([
      prisma.order.aggregate({ where: { createdAt: { gte: todayStart }, status: { not: "cancelled" } }, _sum: { totalAmount: true }, _count: true }),
      prisma.order.aggregate({ where: { createdAt: { gte: weekStart }, status: { not: "cancelled" } }, _sum: { totalAmount: true }, _count: true }),
      prisma.order.count({ where: { status: { in: ["queued", "preparing", "quality_check"] } } }),
      prisma.feedback.count({ where: { createdAt: { gte: weekStart } } }),
    ]);
    return NextResponse.json({ reply: `📊 Tổng quan hoạt động:\n\n🌅 Hôm nay:\n• Doanh thu: ${fmt(todayAgg._sum.totalAmount ?? 0)}\n• Số đơn: ${todayAgg._count}\n• Đơn đang xử lý: ${activeOrders}\n\n📅 7 ngày qua:\n• Doanh thu: ${fmt(weekAgg._sum.totalAmount ?? 0)}\n• Số đơn: ${weekAgg._count}\n• Đánh giá nhận được: ${feedbackCount} lượt` });
  }

  // Fallback
  return NextResponse.json({ reply: `Tôi có thể phân tích các chỉ số sau cho bạn:\n\n💰 Doanh thu: hôm nay, tuần này, tháng này\n📋 Tình trạng đơn hàng & pipeline bếp\n🏆 Sản phẩm bán chạy nhất\n⭐ Đánh giá & hài lòng khách hàng\n🛵 Kênh bán (giao hàng vs tại quán)\n❌ Tỷ lệ hủy đơn\n💡 Khuyến nghị cải thiện\n\nBạn muốn xem chỉ số nào?` });
}
