"use client";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Clock, ChefHat, Star, Loader2, Package } from "lucide-react";
import { usePolling } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";

const STAGES = [
  { status: "RECEIVED", label: "Đã nhận đơn", icon: CheckCircle, color: "text-blue-500" },
  { status: "PREPARING", label: "Đang chế biến", icon: ChefHat, color: "text-orange-500" },
  { status: "READY", label: "Sẵn sàng phục vụ", icon: Package, color: "text-green-500" },
  { status: "DELIVERED", label: "Đã phục vụ", icon: Star, color: "text-purple-500" },
];

interface Order {
  id: string; orderNumber: string; tableNumber: string; status: string;
  totalAmount: number; estimatedTime: number; createdAt: string;
  items: { id: string; quantity: number; price: number; notes?: string; menuItem: { name: string; imageEmoji: string } }[];
}

function TrackingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");

  const { data: order, loading } = usePolling<Order>(
    orderId ? `/api/orders/${orderId}` : "",
    3000,
    !!orderId
  );

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-gray-500 font-medium">Không tìm thấy đơn hàng.</p>
          <Button className="mt-4" onClick={() => router.push("/order?table=01")}>Đặt món</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-[#E4002B] animate-spin" />
      </div>
    );
  }

  if (!order) return null;

  const currentStageIndex = STAGES.findIndex((s) => s.status === order.status);

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-6">
      {/* Header */}
      <div className="bg-[#1A1A1A] text-white">
        <div className="max-w-lg mx-auto px-4 py-6">
          <div className="text-xs text-gray-400 mb-1">Theo dõi đơn hàng</div>
          <div className="text-2xl font-black">{order.orderNumber}</div>
          <div className="text-gray-400 text-sm mt-1">Bàn {order.tableNumber}</div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-4 space-y-4">
        {/* Status card */}
        <motion.div
          key={order.status}
          initial={{ scale: 0.97 }}
          animate={{ scale: 1 }}
          className="bg-white rounded-2xl shadow-sm p-5"
        >
          <div className="text-center mb-6">
            {order.status === "DELIVERED" ? (
              <div className="text-6xl mb-2">✅</div>
            ) : (
              <div className="relative w-16 h-16 mx-auto mb-2">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                  <ChefHat className="h-8 w-8 text-[#E4002B]" />
                </div>
                {order.status !== "DELIVERED" && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E4002B] animate-ping" />
                )}
              </div>
            )}
            <div className="font-black text-xl text-gray-900">
              {STAGES[currentStageIndex]?.label ?? "Đang xử lý"}
            </div>
            {order.status !== "DELIVERED" && (
              <div className="flex items-center justify-center gap-1 text-sm text-gray-500 mt-1">
                <Clock className="h-3.5 w-3.5" />
                <span>Thời gian dự kiến: ~{order.estimatedTime} phút</span>
              </div>
            )}
          </div>

          {/* Progress steps */}
          <div className="relative">
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-100" />
            <div
              className="absolute top-4 left-4 h-0.5 bg-[#E4002B] transition-all duration-1000"
              style={{ width: `${(currentStageIndex / (STAGES.length - 1)) * 100}%`, right: "auto" }}
            />
            <div className="relative flex justify-between">
              {STAGES.map((stage, i) => {
                const done = i <= currentStageIndex;
                const Icon = stage.icon;
                return (
                  <div key={stage.status} className="flex flex-col items-center gap-1.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${done ? "bg-[#E4002B] border-[#E4002B]" : "bg-white border-gray-200"}`}>
                      <Icon className={`h-4 w-4 ${done ? "text-white" : "text-gray-300"}`} />
                    </div>
                    <span className={`text-[10px] font-medium text-center max-w-12 leading-tight ${done ? "text-[#E4002B]" : "text-gray-400"}`}>
                      {stage.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* Order items */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <h3 className="font-bold text-sm text-gray-700 mb-3">Món đã đặt</h3>
          <div className="space-y-2">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <span className="text-xl">{item.menuItem.imageEmoji}</span>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{item.menuItem.name}</div>
                  {item.notes && <div className="text-xs text-gray-400">{item.notes}</div>}
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-500">×{item.quantity}</div>
                  <div className="text-sm font-bold text-[#E4002B]">{formatCurrency(item.price * item.quantity)}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 mt-3 pt-3 flex justify-between font-black">
            <span>Tổng cộng</span>
            <span className="text-[#E4002B]">{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>

        {/* Feedback CTA */}
        {order.status === "DELIVERED" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <Button
              className="w-full h-12 rounded-2xl"
              onClick={() => router.push(`/feedback?orderId=${order.id}&table=${order.tableNumber}`)}
            >
              <Star className="h-4 w-4 mr-2" /> Đánh giá trải nghiệm
            </Button>
          </motion.div>
        )}

        <Button
          variant="outline"
          className="w-full rounded-2xl"
          onClick={() => router.push(`/order?table=${order.tableNumber}`)}
        >
          Đặt thêm món
        </Button>
      </div>
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 text-[#E4002B] animate-spin" /></div>}>
      <TrackingContent />
    </Suspense>
  );
}
