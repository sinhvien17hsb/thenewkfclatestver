"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock, AlertTriangle, ChefHat, ShieldCheck, Package,
  CheckCircle, Cpu, RefreshCw, Filter, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { usePolling } from "@/lib/hooks";
import {
  formatCurrency, getStatusLabel, getPriorityLabel,
  getPriorityColor, getStatusColor, getElapsedTime,
  calculatePriorityScore, getPriorityFromScore,
} from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PageWrapper, PageHeader } from "@/components/layout/PageWrapper";
import { Card, CardContent } from "@/components/ui/card";

type OrderStatus = "queued" | "preparing" | "quality_check" | "ready" | "completed" | "cancelled";
type Priority = "critical" | "high" | "medium" | "low";

interface DbOrderItem {
  id: string; quantity: number; price: number; notes?: string | null;
  menuItem: { name: string; imageEmoji: string };
}
interface DbOrder {
  id: string; orderNumber: string; tableNumber: string;
  customerName?: string | null; status: OrderStatus;
  totalAmount: number; estimatedTime: number; createdAt: string;
  items: DbOrderItem[];
}

interface RichOrder extends DbOrder {
  elapsedTime: number;
  priority: Priority;
  priorityScore: number;
  priorityReason: string;
  complexityScore: number;
}

function enrichOrder(o: DbOrder): RichOrder {
  const elapsedTime = getElapsedTime(o.createdAt);
  const complexityScore = Math.min(o.items.length * 2, 10);
  const priorityScore = calculatePriorityScore(elapsedTime, o.items.length, "dine_in", 70);
  const priority = getPriorityFromScore(priorityScore);
  let priorityReason = "Đơn bình thường. Đang chờ xử lý.";
  if (elapsedTime > 15) priorityReason = `Đã chờ ${elapsedTime} phút. Cần ưu tiên!`;
  else if (o.items.length >= 4) priorityReason = `Đơn lớn (${o.items.length} món). Cần xử lý nhanh.`;
  else if (priority === "high") priorityReason = `Đơn quan trọng. Ưu tiên xử lý.`;
  return { ...o, elapsedTime, priority, priorityScore, complexityScore, priorityReason };
}

const COLUMNS: { status: OrderStatus; label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }[] = [
  { status: "queued",        label: "Chờ xử lý",    icon: Clock,        color: "text-amber-600",  bg: "bg-amber-50 border-amber-200" },
  { status: "preparing",     label: "Đang làm",     icon: ChefHat,      color: "text-blue-600",   bg: "bg-blue-50 border-blue-200" },
  { status: "quality_check", label: "Kiểm tra CL",  icon: ShieldCheck,  color: "text-purple-600", bg: "bg-purple-50 border-purple-200" },
  { status: "ready",         label: "Sẵn sàng",     icon: Package,      color: "text-green-600",  bg: "bg-green-50 border-green-200" },
];

const NEXT_STATUS: Record<OrderStatus, OrderStatus | null> = {
  queued: "preparing", preparing: "quality_check", quality_check: "ready",
  ready: "completed", completed: null, cancelled: null,
};

const STATUS_ACTIONS: Record<OrderStatus, string> = {
  queued: "Bắt đầu làm", preparing: "Chuyển kiểm tra CL",
  quality_check: "Xác nhận đạt", ready: "Đã giao",
  completed: "", cancelled: "",
};

export default function KitchenOrdersPage() {
  const { data: rawOrders, loading, refetch } = usePolling<DbOrder[]>("/api/kitchen/orders", 5000);
  const [filterPriority, setFilterPriority] = useState<string>("all");

  const orders = (rawOrders ?? []).map(enrichOrder);
  const activeOrders = orders.filter((o) => o.status !== "completed" && o.status !== "cancelled");
  const filteredOrders = filterPriority === "all" ? activeOrders : activeOrders.filter((o) => o.priority === filterPriority);
  const kitchenLoad = Math.min(Math.round(activeOrders.length * 12), 100);
  const isHighTraffic = kitchenLoad > 70;

  const getColumnOrders = (status: OrderStatus) =>
    filteredOrders.filter((o) => o.status === status).sort((a, b) => b.priorityScore - a.priorityScore);

  const handleAdvance = async (order: RichOrder) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) throw new Error("Failed");
      refetch();
      toast.success(`${order.orderNumber} — ${STATUS_ACTIONS[order.status]}`, { duration: 2000 });
    } catch {
      toast.error("Không thể cập nhật.");
    }
  };

  if (loading && !rawOrders) {
    return (
      <PageWrapper maxWidth="7xl" className="pb-6">
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-[#E4002B]" />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper maxWidth="7xl" className="pb-6">
      <PageHeader
        title="Kitchen Command Center"
        description="Quản lý đơn hàng thời gian thực · Kanban Board"
        icon={<ChefHat className="h-5 w-5" />}
        actions={
          <button onClick={refetch} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Đơn đang xử lý",  value: activeOrders.length.toString(), icon: "⚙️", color: "text-blue-600" },
          { label: "Chờ xử lý",       value: activeOrders.filter((o) => o.status === "queued").length.toString(), icon: "⏳", color: "text-amber-600" },
          { label: "Tải bếp",         value: `${kitchenLoad}%`, icon: "🔥", color: kitchenLoad > 80 ? "text-red-600" : "text-amber-600" },
          { label: "Trạng thái",      value: isHighTraffic ? "Cao điểm" : "Bình thường", icon: isHighTraffic ? "🚨" : "✅", color: isHighTraffic ? "text-red-600" : "text-green-600" },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-3 flex items-center gap-3">
            <span className="text-2xl">{stat.icon}</span>
            <div>
              <div className={`text-xl font-black ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-gray-500">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {isHighTraffic && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-xl p-3 mb-6 flex items-center gap-3"
        >
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <div>
            <span className="font-bold text-red-800">⚡ Cảnh báo đỉnh cao khách hàng!</span>
            <span className="text-red-600 text-sm ml-2">Tải bếp {kitchenLoad}% — Ưu tiên đơn khẩn cấp</span>
          </div>
        </motion.div>
      )}

      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
        <Filter className="h-4 w-4 text-gray-400 flex-shrink-0" />
        {["all", "critical", "high", "medium", "low"].map((p) => (
          <button
            key={p}
            onClick={() => setFilterPriority(p)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filterPriority === p ? "bg-[#E4002B] text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-[#E4002B]"
            }`}
          >
            {p === "all" ? "Tất cả" : getPriorityLabel(p)}
          </button>
        ))}
        <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{filteredOrders.length} đơn</span>
      </div>

      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-2xl p-4 mb-6 flex items-center gap-4">
        <Cpu className="h-8 w-8 text-blue-300 flex-shrink-0" />
        <div className="flex-1">
          <div className="font-bold text-sm">🤖 AI Order Prioritization Engine</div>
          <div className="text-blue-200 text-xs mt-0.5">
            Đang phân tích: thời gian chờ + kích thước đơn + tải bếp ({kitchenLoad}%)
          </div>
        </div>
        <div className="text-right text-xs">
          <div className="text-yellow-300 font-bold">{activeOrders.filter((o) => o.priority === "critical").length} đơn khẩn cấp</div>
          <div className="text-blue-200">{activeOrders.filter((o) => o.priority === "high").length} đơn ưu tiên cao</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {COLUMNS.map(({ status, label, icon: Icon, color, bg }) => {
          const colOrders = getColumnOrders(status);
          return (
            <div key={status} className="flex flex-col min-h-[400px]">
              <div className={`rounded-xl border-2 ${bg} px-4 py-2.5 mb-3 flex items-center justify-between`}>
                <div className="flex items-center gap-2">
                  <Icon className={`h-4 w-4 ${color}`} />
                  <span className={`font-bold text-sm ${color}`}>{label}</span>
                </div>
                <span className={`text-xs font-black px-2 py-0.5 rounded-full bg-white ${color}`}>{colOrders.length}</span>
              </div>

              <div className="space-y-3 flex-1">
                <AnimatePresence>
                  {colOrders.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl h-24 flex items-center justify-center text-gray-300 text-sm">
                      Không có đơn
                    </div>
                  ) : (
                    colOrders.map((order) => (
                      <KanbanCard key={order.id} order={order} onAdvance={() => handleAdvance(order)} />
                    ))
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </PageWrapper>
  );
}

function KanbanCard({ order, onAdvance }: { order: RichOrder; onAdvance: () => void }) {
  const isCritical = order.priority === "critical";
  const nextAction = STATUS_ACTIONS[order.status];

  return (
    <motion.div layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}>
      <Card className={`overflow-hidden ${isCritical ? "ring-2 ring-red-400 shadow-lg shadow-red-100" : ""}`}>
        {isCritical && (
          <div className="bg-red-500 text-white text-center py-1 text-xs font-bold flex items-center justify-center gap-1">
            <AlertTriangle className="h-3 w-3" /> KHẨN CẤP
          </div>
        )}
        <CardContent className="p-3">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="font-black text-sm text-gray-900">{order.orderNumber}</div>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className="text-[11px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-bold">Bàn {order.tableNumber}</span>
                {order.customerName && (
                  <span className="text-[11px] bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded font-semibold">👤 {order.customerName}</span>
                )}
              </div>
            </div>
            <Badge className={`text-[10px] px-1.5 py-0.5 ${getPriorityColor(order.priority)}`}>
              {getPriorityLabel(order.priority)}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { val: `${order.elapsedTime}p`, label: "Đã chờ", cls: order.elapsedTime > 15 ? "text-red-600" : "text-gray-800" },
              { val: String(order.complexityScore), label: "Phức tạp", cls: "text-blue-600" },
              { val: String(order.priorityScore), label: "Ưu tiên", cls: "text-purple-600" },
            ].map(({ val, label, cls }) => (
              <div key={label} className="bg-gray-50 rounded-lg p-1.5 text-center">
                <div className={`text-sm font-black ${cls}`}>{val}</div>
                <div className="text-[9px] text-gray-400">{label}</div>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 rounded-lg p-2 mb-3">
            {order.items.slice(0, 2).map((item, i) => (
              <div key={i} className="text-xs text-gray-700 flex justify-between">
                <span className="truncate mr-1">{item.menuItem.name}</span>
                <span className="text-gray-500 flex-shrink-0">×{item.quantity}</span>
              </div>
            ))}
            {order.items.length > 2 && (
              <div className="text-xs text-gray-400">+{order.items.length - 2} món...</div>
            )}
            <div className="text-xs font-bold text-[#E4002B] mt-1">{formatCurrency(order.totalAmount)}</div>
          </div>

          <div className="text-[10px] text-gray-500 mb-2 bg-blue-50 rounded px-2 py-1 flex items-start gap-1">
            <Cpu className="h-3 w-3 text-blue-400 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-2">{order.priorityReason}</span>
          </div>

          {nextAction && (
            <Button
              size="sm"
              onClick={onAdvance}
              className="w-full h-7 text-xs"
              variant={isCritical ? "default" : "outline"}
            >
              {order.status === "ready" ? <CheckCircle className="h-3 w-3 mr-1" /> : null}
              {nextAction}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
