"use client";
import { motion } from "framer-motion";
import {
  Clock, Star, TrendingUp, TrendingDown, ArrowRight,
  CheckCircle, Zap, Target, BarChart3, Shield
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Progress } from "@/components/ui/progress";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

export default function TransformationPage() {
  return (
    <PageWrapper maxWidth="7xl" className="pb-24 md:pb-8">
      {/* Header */}
      <div className="text-center mb-12">
        <motion.div {...fadeUp}>
          <Badge className="mb-4 bg-red-50 text-[#E4002B] border-red-200 text-sm px-4 py-1.5">
            🎓 Đồ án tốt nghiệp · Trường Đại học HSB · 2025
          </Badge>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Chuyển đổi số KFC Vincom Bà Triệu
          </h1>
          <p className="text-xl text-gray-500 max-w-3xl mx-auto leading-relaxed">
            Nghiên cứu thực tế về ứng dụng công nghệ AI và dữ liệu thời gian thực để giải quyết hai thách thức vận hành tại KFC Vincom Bà Triệu, Hà Nội.
          </p>
        </motion.div>
      </div>

      {/* Research context */}
      <div className="bg-gradient-to-r from-[#1A1A1A] to-gray-800 text-white rounded-3xl p-8 mb-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <Badge className="bg-white/20 text-white border-white/30 mb-4">📍 Địa điểm nghiên cứu</Badge>
            <h2 className="text-2xl font-black mb-3">KFC Vincom Bà Triệu</h2>
            <p className="text-gray-300 mb-4">191 Bà Triệu, Quận Hai Bà Trưng, Hà Nội</p>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-400" />Khảo sát 450 khách hàng tại cửa hàng</div>
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-400" />Quan sát trực tiếp 3 ca làm việc</div>
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-400" />Phỏng vấn sâu quản lý và nhân viên</div>
              <div className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-400" />Phân tích dữ liệu vận hành 30 ngày</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { value: "450", label: "Khách hàng khảo sát", icon: "👥" },
              { value: "3 ca", label: "Ca làm việc quan sát", icon: "🕐" },
              { value: "30", label: "Ngày thu thập dữ liệu", icon: "📅" },
              { value: "12+", label: "Vấn đề được xác định", icon: "🔍" },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-2xl p-4 text-center">
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-2xl font-black text-white">{s.value}</div>
                <div className="text-xs text-gray-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Problems identified */}
      <motion.div {...fadeUp} className="mb-12">
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-red-50 text-[#E4002B] border-red-200">Vấn đề được xác định</Badge>
          <h2 className="text-3xl font-black text-gray-900">Hai thách thức vận hành cốt lõi</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Problem 1 */}
          <Card className="border-l-4 border-l-red-500 overflow-hidden">
            <div className="bg-red-500 text-white p-4">
              <div className="flex items-center gap-3">
                <Clock className="h-6 w-6" />
                <div>
                  <div className="font-black text-lg">Vấn đề 1</div>
                  <div className="text-red-100">Thời gian chờ đợi quá lâu</div>
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: "Thời gian chờ TB", value: "16-22p", sub: "Giờ bình thường" },
                  { label: "Đỉnh cao", value: "30p", sub: "Khách phàn nàn nhiều nhất" },
                  { label: "Khách không hài lòng", value: "65%", sub: "Về thời gian chờ" },
                ].map((m) => (
                  <div key={m.label} className="text-center bg-red-50 rounded-xl p-3">
                    <div className="text-xl font-black text-[#E4002B]">{m.value}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5 leading-tight">{m.label}</div>
                    <div className="text-[9px] text-gray-400">{m.sub}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <div className="font-semibold text-gray-700 text-sm mb-2">Nguyên nhân gốc rễ:</div>
                {[
                  "Không có hệ thống quản lý hàng đợi thông minh",
                  "Nhập đơn thủ công bằng giấy tờ gây sai sót và chậm trễ",
                  "Thiếu công cụ dự báo và phân bổ nhân lực theo giờ cao điểm",
                  "Không có cơ chế ưu tiên đơn hàng tự động",
                ].map((r) => (
                  <div key={r} className="flex items-start gap-2 text-sm text-gray-600">
                    <TrendingDown className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                    {r}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Problem 2 */}
          <Card className="border-l-4 border-l-amber-500 overflow-hidden">
            <div className="bg-amber-500 text-white p-4">
              <div className="flex items-center gap-3">
                <Star className="h-6 w-6" />
                <div>
                  <div className="font-black text-lg">Vấn đề 2</div>
                  <div className="text-amber-100">Chất lượng không nhất quán</div>
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { label: "Khách báo cáo", value: "58%", sub: "Chất lượng khác nhau" },
                  { label: "Điểm hài lòng", value: "3.7/5", sub: "Dưới KPI 4.0" },
                  { label: "Tuân thủ SOP", value: "81%", sub: "Chưa đạt 90%" },
                ].map((m) => (
                  <div key={m.label} className="text-center bg-amber-50 rounded-xl p-3">
                    <div className="text-xl font-black text-amber-600">{m.value}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5 leading-tight">{m.label}</div>
                    <div className="text-[9px] text-gray-400">{m.sub}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <div className="font-semibold text-gray-700 text-sm mb-2">Nguyên nhân gốc rễ:</div>
                {[
                  "SOP dạng giấy — dễ bỏ qua, khó kiểm soát",
                  "Không có hệ thống đánh giá chất lượng theo thời gian thực",
                  "Quản lý không thể theo dõi từng chi nhánh đồng thời",
                  "Thiếu cơ chế cảnh báo sớm khi chất lượng giảm",
                ].map((r) => (
                  <div key={r} className="flex items-start gap-2 text-sm text-gray-600">
                    <TrendingDown className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    {r}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Digital Transformation Framework */}
      <motion.div {...fadeUp} className="mb-12">
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-blue-50 text-blue-700 border-blue-200">Giải pháp</Badge>
          <h2 className="text-3xl font-black text-gray-900">Khung Chuyển đổi số KFC Sync</h2>
          <p className="text-gray-500 mt-2 max-w-2xl mx-auto">
            Tích hợp FOH + BOH + Analytics + Quality Governance trong một nền tảng duy nhất
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              layer: "FOH",
              title: "Front of House",
              color: "from-[#E4002B] to-[#BB0020]",
              icon: "📱",
              solutions: ["Smart Mobile Ordering", "QR Table Ordering", "Live Order Tracking", "Smart Queue Dashboard", "Customer Feedback"],
            },
            {
              layer: "BOH",
              title: "Back of House",
              color: "from-orange-500 to-orange-600",
              icon: "👨‍🍳",
              solutions: ["Kitchen Command Center", "AI Prioritization Engine", "SOP Management System", "Shift Management"],
            },
            {
              layer: "AI",
              title: "Intelligence Layer",
              color: "from-blue-600 to-blue-700",
              icon: "🤖",
              solutions: ["Priority Score Algorithm", "Traffic Prediction", "Quality Risk Engine", "Performance Analytics"],
            },
            {
              layer: "QG",
              title: "Quality Governance",
              color: "from-purple-600 to-purple-700",
              icon: "🏆",
              solutions: ["Branch Quality Score", "5-Branch Ranking", "Real-time Alerts", "SOP Compliance Track"],
            },
          ].map((item) => (
            <div key={item.layer} className={`rounded-2xl p-5 text-white bg-gradient-to-br ${item.color}`}>
              <div className="text-3xl mb-3">{item.icon}</div>
              <div className="text-xs font-bold opacity-70 mb-1">{item.layer}</div>
              <div className="font-black text-lg mb-3">{item.title}</div>
              <ul className="space-y-1.5">
                {item.solutions.map((s) => (
                  <li key={s} className="flex items-center gap-2 text-sm opacity-90">
                    <CheckCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Before vs After */}
      <motion.div {...fadeUp} className="mb-12">
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-green-50 text-green-700 border-green-200">Tác động dự kiến</Badge>
          <h2 className="text-3xl font-black text-gray-900">Trước và Sau Chuyển đổi số</h2>
        </div>

        <div className="grid gap-4">
          {[
            {
              metric: "Thời gian chờ TB",
              before: "16-22 phút",
              after: "8-12 phút",
              improvement: "-42%",
              beforeVal: 100,
              afterVal: 55,
              icon: <Clock className="h-5 w-5" />,
              color: "#E4002B",
            },
            {
              metric: "Điểm hài lòng khách hàng",
              before: "3.7/5 ⭐",
              after: "4.5/5 ⭐",
              improvement: "+22%",
              beforeVal: 74,
              afterVal: 90,
              icon: <Star className="h-5 w-5" />,
              color: "#F59E0B",
            },
            {
              metric: "Tuân thủ SOP",
              before: "81%",
              after: "95%",
              improvement: "+17%",
              beforeVal: 81,
              afterVal: 95,
              icon: <Shield className="h-5 w-5" />,
              color: "#8B5CF6",
            },
            {
              metric: "Điểm chất lượng chi nhánh",
              before: "83/100",
              after: "91/100",
              improvement: "+10%",
              beforeVal: 83,
              afterVal: 91,
              icon: <Target className="h-5 w-5" />,
              color: "#10B981",
            },
            {
              metric: "Throughput bếp (đơn/giờ)",
              before: "38 đơn",
              after: "58 đơn",
              improvement: "+53%",
              beforeVal: 38,
              afterVal: 58,
              icon: <BarChart3 className="h-5 w-5" />,
              color: "#3B82F6",
            },
          ].map((item) => (
            <Card key={item.metric}>
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 rounded-xl flex-shrink-0" style={{ backgroundColor: item.color + "20", color: item.color }}>
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-900 text-sm">{item.metric}</span>
                      <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">{item.improvement}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Hiện tại (Trước)</div>
                        <div className="text-lg font-black text-red-600">{item.before}</div>
                        <Progress value={item.beforeVal} color="#EF4444" className="mt-1 h-1.5" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-400 mb-1">Mục tiêu (Sau)</div>
                        <div className="text-lg font-black text-green-600">{item.after}</div>
                        <Progress value={item.afterVal} color="#10B981" className="mt-1 h-1.5" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </motion.div>

      {/* Digital Transformation vs Digitalization */}
      <motion.div {...fadeUp} className="mb-12">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-[#1A1A1A] to-gray-700 text-white p-6">
            <h2 className="text-2xl font-black mb-2">Chuyển đổi số vs. Số hóa đơn thuần</h2>
            <p className="text-gray-300">KFC Sync không chỉ số hóa quy trình hiện tại — mà tái thiết kế mô hình vận hành từ gốc</p>
          </div>
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <div className="font-bold text-gray-600 mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm">×</span>
                  Số hóa đơn thuần (Digitalization)
                </div>
                <ul className="space-y-2">
                  {[
                    "Chuyển form giấy sang form điện tử",
                    "Dùng máy POS thay thu ngân",
                    "Gửi email thay fax",
                    "Lưu trữ dữ liệu trên máy tính",
                    "Vẫn giữ nguyên quy trình cũ",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                      <span className="text-red-500 flex-shrink-0">✗</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="font-bold text-[#E4002B] mb-3 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Chuyển đổi số (Digital Transformation)
                </div>
                <ul className="space-y-2">
                  {[
                    "AI tự động phân tích và tối ưu hóa ưu tiên đơn hàng",
                    "Hệ thống tự động phát cảnh báo rủi ro chất lượng",
                    "Dữ liệu thời gian thực kết nối toàn bộ chuỗi giá trị",
                    "Quyết định dựa trên phân tích dự báo, không phải phản ứng",
                    "Trải nghiệm khách hàng được cá nhân hóa hoàn toàn",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" /> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Technology stack */}
      <motion.div {...fadeUp} className="mb-12">
        <div className="text-center mb-8">
          <Badge className="mb-3 bg-indigo-50 text-indigo-700 border-indigo-200">Công nghệ sử dụng</Badge>
          <h2 className="text-3xl font-black text-gray-900">Tech Stack</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: "Next.js 15", desc: "App Router + SSR", icon: "⚡", color: "bg-black text-white" },
            { name: "TypeScript", desc: "Type Safety", icon: "🔷", color: "bg-blue-600 text-white" },
            { name: "Tailwind CSS v4", desc: "Utility-first CSS", icon: "🎨", color: "bg-cyan-500 text-white" },
            { name: "Zustand", desc: "State Management", icon: "🐻", color: "bg-amber-500 text-white" },
            { name: "Recharts", desc: "Data Visualization", icon: "📊", color: "bg-green-600 text-white" },
            { name: "Framer Motion", desc: "UI Animations", icon: "✨", color: "bg-purple-600 text-white" },
            { name: "Radix UI", desc: "Accessible Components", icon: "🎯", color: "bg-gray-800 text-white" },
            { name: "Sonner", desc: "Toast Notifications", icon: "🔔", color: "bg-rose-600 text-white" },
          ].map((tech) => (
            <div key={tech.name} className={`rounded-2xl p-4 text-center ${tech.color}`}>
              <div className="text-3xl mb-2">{tech.icon}</div>
              <div className="font-black text-sm">{tech.name}</div>
              <div className="text-xs opacity-80 mt-0.5">{tech.desc}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Expected ROI */}
      <motion.div {...fadeUp} className="mb-12">
        <Card className="bg-gradient-to-br from-[#E4002B] to-[#BB0020] text-white overflow-hidden">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <TrendingUp className="h-10 w-10 mx-auto mb-3 text-yellow-300" />
              <h2 className="text-3xl font-black mb-2">ROI & Tác động kinh doanh dự kiến</h2>
              <p className="text-red-100">Ước tính tác động sau 12 tháng triển khai đầy đủ</p>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { metric: "Tăng doanh thu", value: "+18-25%", sub: "Do giảm thời gian chờ & tăng trải nghiệm KH", icon: "💰" },
                { metric: "Giảm chi phí vận hành", value: "-12%", sub: "Tối ưu nhân lực và quy trình tự động", icon: "📉" },
                { metric: "Tăng điểm NPS", value: "+30 điểm", sub: "Net Promoter Score từ khách hàng hài lòng", icon: "⭐" },
                { metric: "Tiết kiệm thời gian quản lý", value: "4h/ngày", sub: "Dashboard tự động thay báo cáo thủ công", icon: "⏰" },
              ].map((item) => (
                <div key={item.metric} className="text-center bg-white/15 rounded-2xl p-5">
                  <div className="text-3xl mb-2">{item.icon}</div>
                  <div className="text-3xl font-black text-yellow-300 mb-1">{item.value}</div>
                  <div className="font-bold text-sm mb-1">{item.metric}</div>
                  <div className="text-red-200 text-xs leading-tight">{item.sub}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* CTA */}
      <motion.div {...fadeUp} className="text-center">
        <h2 className="text-3xl font-black text-gray-900 mb-4">Khám phá toàn bộ hệ thống</h2>
        <p className="text-gray-500 mb-8 max-w-xl mx-auto">
          Chọn vai trò để trải nghiệm từng module của KFC Sync — từ đặt món, quản lý bếp đến phân tích dữ liệu toàn hệ thống.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/customer/menu">
            <Button size="lg" className="font-bold w-full sm:w-auto">
              📱 Trải nghiệm FOH <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/kitchen/orders">
            <Button size="lg" variant="outline" className="border-[#E4002B] text-[#E4002B] hover:bg-[#E4002B] hover:text-white font-bold w-full sm:w-auto">
              👨‍🍳 Trải nghiệm BOH <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/manager/dashboard">
            <Button size="lg" variant="dark" className="font-bold w-full sm:w-auto">
              📊 Dashboard Quản lý <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </motion.div>
    </PageWrapper>
  );
}
