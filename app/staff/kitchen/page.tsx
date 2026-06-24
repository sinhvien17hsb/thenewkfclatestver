"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle, ChefHat, Package, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { usePolling } from "@/lib/hooks";
import { formatCurrency } from "@/lib/utils";

interface OrderItem {
  id: string; quantity: number; notes?: string;
  menuItem: { name: string; imageEmoji: string };
}
interface Order {
  id: string; orderNumber: string; tableNumber: string;
  status: string; totalAmount: number; createdAt: string;
  estimatedTime: number; items: OrderItem[];
}

const COLUMNS: { status: string; label: string; next: string | null; nextLabel: string | null; color: string; bg: string; icon: React.ElementType }[] = [
  { status: "RECEIVED", label: "Đơn mới", next: "PREPARING", nextLabel: "Bắt đầu làm", color: "text-blue-400", bg: "bg-blue-950/40 border-blue-900", icon: Clock },
  { status: "PREPARING", label: "Đang làm", next: "READY", nextLabel: "Hoàn thành", color: "text-orange-400", bg: "bg-orange-950/40 border-orange-900", icon: ChefHat },
  { status: "READY", label: "Sẵn sàng", next: "DELIVERED", nextLabel: "Đã phục vụ", color: "text-green-400", bg: "bg-green-950/40 border-green-900", icon: Package },
];

function elapsed(createdAt: string): string {
  const diff = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  return `${Math.floor(diff / 60)}m ${diff % 60}s`;
}

function OrderCard({ order, nextStatus, nextLabel, onAdvance }: {
  order: Order; nextStatus: string | null; nextLabel: string | null; onAdvance: () => void;
}) {
  const [advancing, setAdvancing] = useState(false);
  const waitMinutes = Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000);
  const isOverdue = waitMinutes >= order.estimatedTime;

  const handleAdvance = async () => {
    if (!nextStatus) return;
    setAdvancing(true);
    try {
      const res = await fetch(`/api/orders/${order.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!res.ok) throw new Error("Failed");
      toast.success(`${order.orderNumber} → ${nextLabel}`);
      onAdvance();
    } catch {
      toast.error("Không thể cập nhật.");
    } finally {
      setAdvancing(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`bg-gray-900 rounded-2xl border ${isOverdue ? "border-red-800 ring-1 ring-red-800/50" : "border-gray-800"} overflow-hidden`}
    >
      {isOverdue && (
        <div className="bg-red-900/80 text-red-200 text-center py-1 text-xs font-bold animate-pulse">
          ⚠️ QUÁ THỜI GIAN
        </div>
      )}
      <div className="p-3.5">
        <div className="flex items-center justify-between mb-2">
          <span className="font-black text-white text-sm">{order.orderNumber}</span>
          <div className="flex items-center gap-2">
            <span className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full">Bàn {order.tableNumber}</span>
            <span className={`text-xs font-mono ${isOverdue ? "text-red-400" : "text-gray-400"}`}>{elapsed(order.createdAt)}</span>
          </div>
        </div>

        <div className="space-y-1 mb-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-2 text-sm">
              <span className="text-base leading-none">{item.menuItem.imageEmoji}</span>
              <span className="text-gray-200 flex-1">{item.menuItem.name}</span>
              <span className="text-gray-400 font-mono">×{item.quantity}</span>
            </div>
          ))}
          {order.items.some((i) => i.notes) && (
            <div className="mt-1 bg-yellow-950/40 border border-yellow-900 rounded-lg px-2 py-1.5">
              {order.items.filter((i) => i.notes).map((i) => (
                <div key={i.id} className="text-xs text-yellow-300">
                  {i.menuItem.name}: {i.notes}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">{formatCurrency(order.totalAmount)}</span>
          {nextLabel && (
            <button
              onClick={handleAdvance}
              disabled={advancing}
              className="flex items-center gap-1.5 bg-[#E4002B] hover:bg-[#BB0020] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50"
            >
              {advancing ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
              {nextLabel}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function KitchenPage() {
  const { data: orders, loading, refetch } = usePolling<Order[]>("/api/kitchen/orders", 3000);

  const getByStatus = (status: string) =>
    (orders ?? []).filter((o) => o.status === status);

  return (
    <div className="p-4 min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-black text-white">Kitchen Board</h1>
          <p className="text-gray-500 text-xs mt-0.5">Cập nhật mỗi 3 giây · {orders?.length ?? 0} đơn đang xử lý</p>
        </div>
        <button onClick={refetch} className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading && !orders ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-[#E4002B] animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map(({ status, label, next, nextLabel, color, bg, icon: Icon }) => {
            const col = getByStatus(status);
            return (
              <div key={status}>
                <div className={`rounded-xl border-2 ${bg} px-3 py-2 mb-3 flex items-center justify-between`}>
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${color}`} />
                    <span className={`font-bold text-sm ${color}`}>{label}</span>
                  </div>
                  <span className={`text-xs font-black px-2 py-0.5 rounded-full bg-gray-900/50 ${color}`}>
                    {col.length}
                  </span>
                </div>

                <div className="space-y-3">
                  <AnimatePresence>
                    {col.length === 0 ? (
                      <div className="border-2 border-dashed border-gray-800 rounded-2xl h-24 flex items-center justify-center text-gray-700 text-sm">
                        Không có đơn
                      </div>
                    ) : (
                      col.map((order) => (
                        <OrderCard
                          key={order.id}
                          order={order}
                          nextStatus={next}
                          nextLabel={nextLabel}
                          onAdvance={refetch}
                        />
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
