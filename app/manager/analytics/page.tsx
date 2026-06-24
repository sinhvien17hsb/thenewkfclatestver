"use client";
import { usePolling } from "@/lib/hooks";
import { formatCurrency } from "@/lib/utils";
import { Loader2, TrendingUp, Star, Clock } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

interface Analytics {
  totalOrders: number; todayOrders: number; totalRevenue: number; todayRevenue: number;
  avgWaitTime: number;
  satisfaction: { food: number; service: number; waiting: number } | null;
  ordersByStatus: Record<string, number>;
  topProducts: { name: string; imageEmoji: string; total: number }[];
  weeklyData: { date: string; orders: number; revenue: number }[];
}

export default function AnalyticsPage() {
  const { data, loading } = usePolling<Analytics>("/api/analytics", 15000);

  if (loading && !data) {
    return <div className="flex items-center justify-center min-h-screen"><Loader2 className="h-8 w-8 text-[#E4002B] animate-spin" /></div>;
  }
  if (!data) return null;

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-[#E4002B]" /> Phân tích
        </h1>
        <p className="text-gray-500 text-sm mt-0.5">Dữ liệu thực từ database</p>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Tổng đơn", value: data.totalOrders },
          { label: "Đơn hôm nay", value: data.todayOrders },
          { label: "Tổng doanh thu", value: formatCurrency(data.totalRevenue) },
          { label: "Hôm nay", value: formatCurrency(data.todayRevenue) },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
            <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">{label}</div>
            <div className="text-xl font-black text-white">{value}</div>
          </div>
        ))}
      </div>

      {/* Weekly revenue */}
      {data.weeklyData.length > 0 ? (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
          <h2 className="text-sm font-bold text-white mb-4">Doanh thu 7 ngày qua</h2>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.weeklyData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" tick={{ fill: "#9CA3AF", fontSize: 11 }} />
              <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} tickFormatter={(v) => formatCurrency(Number(v))} width={80} />
              <Tooltip
                contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: 12 }}
                labelStyle={{ color: "#F9FAFB", fontSize: 12 }}
                formatter={(v) => [formatCurrency(Number(v)), "Doanh thu"]}
              />
              <Line type="monotone" dataKey="revenue" stroke="#E4002B" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6 text-center text-gray-600">
          Chưa có dữ liệu tuần · Hãy tạo thực đơn và chờ đơn đầu tiên
        </div>
      )}

      {/* Orders bar */}
      {data.weeklyData.length > 0 && (
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
          <h2 className="text-sm font-bold text-white mb-4">Số đơn hàng mỗi ngày</h2>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={data.weeklyData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" tick={{ fill: "#9CA3AF", fontSize: 11 }} />
              <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#111827", border: "1px solid #374151", borderRadius: 12 }}
                formatter={(v) => [v, "Đơn"]}
              />
              <Bar dataKey="orders" fill="#E4002B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {/* Top products */}
        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
          <h2 className="text-sm font-bold text-white mb-3">Món bán chạy nhất</h2>
          {data.topProducts.length === 0 ? (
            <p className="text-gray-600 text-sm">Chưa có dữ liệu</p>
          ) : (
            <div className="space-y-2.5">
              {data.topProducts.slice(0, 8).map((p, i) => (
                <div key={p.name} className="flex items-center gap-2">
                  <span className="text-xs text-gray-600 font-mono w-4 text-right">{i + 1}</span>
                  <span className="text-lg leading-none">{p.imageEmoji}</span>
                  <span className="text-sm text-gray-300 flex-1 truncate">{p.name}</span>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 rounded-full bg-[#E4002B]" style={{ width: `${Math.max(8, (p.total / (data.topProducts[0]?.total || 1)) * 60)}px` }} />
                    <span className="text-xs font-bold text-[#E4002B] w-8 text-right">×{p.total}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Satisfaction + wait */}
        <div className="space-y-3">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4">
            <h2 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-400" /> Đánh giá trung bình
            </h2>
            {!data.satisfaction ? (
              <p className="text-gray-600 text-sm">Chưa có đánh giá</p>
            ) : (
              <div className="space-y-2">
                {[
                  { label: "Món ăn", value: data.satisfaction.food },
                  { label: "Phục vụ", value: data.satisfaction.service },
                  { label: "Thời gian", value: data.satisfaction.waiting },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 w-16">{label}</span>
                    <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${(value / 5) * 100}%` }} />
                    </div>
                    <span className="text-xs font-bold text-white w-8 text-right">{value?.toFixed(1)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-950/40 flex items-center justify-center">
              <Clock className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <div className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Thời gian TB</div>
              <div className="text-2xl font-black text-white">{data.avgWaitTime} phút</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
