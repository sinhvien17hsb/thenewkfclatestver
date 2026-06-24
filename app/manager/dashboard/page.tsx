"use client";
import { usePolling } from "@/lib/hooks";
import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import { TrendingUp, ShoppingBag, DollarSign, Clock, Star, AlertCircle, Loader2 } from "lucide-react";
import Link from "next/link";

interface Analytics {
  totalOrders: number; todayOrders: number; totalRevenue: number; todayRevenue: number;
  avgWaitTime: number; satisfaction: { food: number; service: number; waiting: number } | null;
  ordersByStatus: Record<string, number>; topProducts: { name: string; imageEmoji: string; total: number }[];
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  RECEIVED: { label: "Đơn mới", color: "text-blue-400" },
  PREPARING: { label: "Đang làm", color: "text-orange-400" },
  READY: { label: "Sẵn sàng", color: "text-green-400" },
  DELIVERED: { label: "Đã phục vụ", color: "text-gray-400" },
};

function StatCard({ icon: Icon, label, value, sub, color }: { icon: React.ElementType; label: string; value: string; sub?: string; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="bg-gray-900 rounded-2xl border border-gray-800 p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
        <div className="w-8 h-8 rounded-xl bg-gray-800 flex items-center justify-center">
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
      </div>
      <div className="text-2xl font-black text-white">{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </motion.div>
  );
}

export default function ManagerDashboard() {
  const { data, loading } = usePolling<Analytics>("/api/analytics", 10000);

  if (loading && !data) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 text-[#E4002B] animate-spin" /></div>;
  }
  if (!data) return null;

  const avgSat = data.satisfaction
    ? ((data.satisfaction.food + data.satisfaction.service + data.satisfaction.waiting) / 3)
    : null;

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-black text-white">Tổng quan hôm nay</h1>
        <p className="text-gray-500 text-sm mt-0.5">Dữ liệu thời gian thực</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={ShoppingBag} label="Đơn hôm nay" value={String(data.todayOrders)} sub={`Tổng: ${data.totalOrders} đơn`} color="text-blue-400" />
        <StatCard icon={DollarSign} label="Doanh thu hôm nay" value={formatCurrency(data.todayRevenue)} sub={`Tổng: ${formatCurrency(data.totalRevenue)}`} color="text-green-400" />
        <StatCard icon={Clock} label="Thời gian TB" value={`${data.avgWaitTime}p`} sub="Từ đặt đến hoàn thành" color="text-orange-400" />
        <StatCard icon={Star} label="Mức hài lòng" value={avgSat ? `${avgSat.toFixed(1)}/5` : "Chưa có"} sub="Đánh giá khách hàng" color="text-yellow-400" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { href: "/manager/analytics", label: "Xem phân tích chi tiết →", color: "bg-blue-950/40 border-blue-900 text-blue-400" },
          { href: "/manager/menu", label: "Quản lý thực đơn →", color: "bg-orange-950/40 border-orange-900 text-orange-400" },
          { href: "/manager/inventory", label: "Kiểm tra kho →", color: "bg-yellow-950/40 border-yellow-900 text-yellow-400" },
          { href: "/manager/employees", label: "Quản lý nhân viên →", color: "bg-purple-950/40 border-purple-900 text-purple-400" },
        ].map(({ href, label, color }) => (
          <Link key={href} href={href} className={`rounded-2xl border px-4 py-3 text-sm font-semibold hover:opacity-80 transition-opacity ${color}`}>{label}</Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
          <h2 className="text-sm font-bold text-white mb-3">Trạng thái đơn hàng</h2>
          <div className="space-y-2">
            {Object.entries(data.ordersByStatus).length === 0 ? (
              <p className="text-gray-600 text-sm">Chưa có đơn nào</p>
            ) : Object.entries(data.ordersByStatus).map(([status, count]) => {
              const meta = STATUS_LABELS[status] ?? { label: status, color: "text-gray-400" };
              return (
                <div key={status} className="flex items-center justify-between">
                  <span className={`text-sm ${meta.color}`}>{meta.label}</span>
                  <span className="font-black text-white">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
          <h2 className="text-sm font-bold text-white mb-3">Món bán chạy</h2>
          <div className="space-y-2">
            {data.topProducts.length === 0 ? (
              <p className="text-gray-600 text-sm">Chưa có dữ liệu</p>
            ) : data.topProducts.slice(0, 5).map((p, i) => (
              <div key={p.name} className="flex items-center gap-2">
                <span className="text-xs text-gray-600 w-4 font-mono">{i + 1}</span>
                <span className="text-base leading-none">{p.imageEmoji}</span>
                <span className="text-sm text-gray-200 flex-1 truncate">{p.name}</span>
                <span className="text-xs font-bold text-[#E4002B]">×{p.total}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {data.satisfaction && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
          <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-400" /> Đánh giá khách hàng
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Món ăn", value: data.satisfaction.food },
              { label: "Phục vụ", value: data.satisfaction.service },
              { label: "Thời gian", value: data.satisfaction.waiting },
            ].map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-black text-white">{value ? value.toFixed(1) : "—"}</div>
                <div className="text-xs text-gray-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.totalOrders === 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 flex items-start gap-3 text-gray-500">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-semibold text-gray-300">Chưa có dữ liệu</div>
            <div className="text-xs mt-0.5">Thêm thực đơn, chia sẻ QR bàn với khách và chờ đơn đầu tiên.</div>
          </div>
        </div>
      )}
    </div>
  );
}
