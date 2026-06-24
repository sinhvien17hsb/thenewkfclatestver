"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock, ChefHat, ShieldCheck, Package, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { useKitchenStore } from "@/lib/store";
import { formatCurrency, getStatusLabel, formatTimeAgo } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent } from "@/components/ui/card";
import type { Order } from "@/lib/types";

const ORDER_STAGES = [
  { key: "queued", label: "Chờ xử lý", icon: Clock, color: "text-amber-500" },
  { key: "preparing", label: "Đang làm", icon: ChefHat, color: "text-blue-500" },
  { key: "quality_check", label: "Kiểm tra CL", icon: ShieldCheck, color: "text-purple-500" },
  { key: "ready", label: "Sẵn sàng", icon: Package, color: "text-green-500" },
  { key: "completed", label: "Hoàn thành", icon: CheckCircle, color: "text-gray-500" },
];

const STAGE_INDEX: Record<string, number> = {
  queued: 0,
  preparing: 1,
  quality_check: 2,
  ready: 3,
  completed: 4,
};

const STAGE_PROGRESS: Record<string, number> = {
  queued: 15,
  preparing: 40,
  quality_check: 70,
  ready: 90,
  completed: 100,
};

export default function OrdersPage() {
  const { customerOrders } = useAppStore();
  const kitchenOrders = useKitchenStore((s) => s.orders);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 10000);
    return () => clearInterval(interval);
  }, []);

  const allOrders = [...customerOrders, ...kitchenOrders.slice(0, 3)].slice(0, 6);

  if (allOrders.length === 0) {
    return (
      <PageWrapper maxWidth="2xl">
        <div className="text-center py-20">
          <div className="text-8xl mb-4">📦</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Chưa có đơn hàng nào</h2>
          <p className="text-gray-500 mb-6">Đặt món ngay để bắt đầu theo dõi!</p>
          <Link href="/customer/menu">
            <Button size="lg">Đặt món ngay</Button>
          </Link>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper maxWidth="2xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/customer/menu">
            <Button variant="ghost" size="icon-sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Theo dõi đơn hàng</h1>
            <p className="text-sm text-gray-500">{allOrders.length} đơn hàng</p>
          </div>
        </div>
        <button
          onClick={() => setTick((t) => t + 1)}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
        >
          <RefreshCw className="h-4 w-4" />
        </button>
      </div>

      {/* Queue status banner */}
      <div className="bg-gradient-to-r from-[#E4002B] to-[#BB0020] text-white rounded-2xl p-4 mb-6 flex items-center gap-4">
        <div className="text-3xl">🚦</div>
        <div>
          <div className="font-bold">Trạng thái hàng đợi hiện tại</div>
          <div className="text-sm text-red-100 flex items-center gap-3 mt-0.5">
            <span>Đang chờ: <strong className="text-white">7 đơn</strong></span>
            <span>Thời gian chờ TB: <strong className="text-yellow-300">~12 phút</strong></span>
            <span className="hidden sm:inline">Tải bếp: <strong className="text-white">72%</strong></span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {allOrders.map((order) => (
          <OrderTrackingCard key={order.id} order={order} tick={tick} />
        ))}
      </div>
    </PageWrapper>
  );
}

function OrderTrackingCard({ order, tick: _tick }: { order: Order; tick: number }) {
  const stageIdx = STAGE_INDEX[order.status] ?? 0;
  const progress = STAGE_PROGRESS[order.status] ?? 0;

  const statusColors: Record<string, string> = {
    queued: "border-amber-200 bg-amber-50",
    preparing: "border-blue-200 bg-blue-50",
    quality_check: "border-purple-200 bg-purple-50",
    ready: "border-green-200 bg-green-50",
    completed: "border-gray-200 bg-gray-50",
  };

  const isReady = order.status === "ready";
  const isCompleted = order.status === "completed";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className={`overflow-hidden ${isReady ? "ring-2 ring-green-400" : ""}`}>
        {isReady && (
          <div className="bg-green-500 text-white text-center py-2 text-sm font-bold animate-pulse">
            🔔 Đơn hàng của bạn đã sẵn sàng! Vui lòng lấy món.
          </div>
        )}
        <CardContent className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="font-black text-lg text-gray-900">{order.orderNumber}</div>
              <div className="text-sm text-gray-500">
                {order.tableNumber ? `Bàn ${order.tableNumber}` : "Mang về"} · {order.customerName}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">{formatTimeAgo(order.createdAt)}</div>
            </div>
            <div className="text-right">
              <Badge className={`${statusColors[order.status]} border text-xs`}>
                {getStatusLabel(order.status)}
              </Badge>
              <div className="text-sm font-bold text-gray-900 mt-1">{formatCurrency(order.totalAmount)}</div>
            </div>
          </div>

          {/* Progress */}
          {!isCompleted && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">Tiến độ</span>
                {order.estimatedTime > 0 && (
                  <span className="text-sm font-bold text-amber-600">
                    ⏱ ~{order.estimatedTime} phút
                  </span>
                )}
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          {/* Timeline */}
          <div className="flex items-center justify-between mb-4">
            {ORDER_STAGES.map((stage, idx) => {
              const isActive = idx === stageIdx && !isCompleted;
              const isDone = idx < stageIdx || isCompleted;
              const Icon = stage.icon;
              return (
                <div key={stage.key} className="flex flex-col items-center flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-all ${
                      isDone
                        ? "bg-green-500 text-white"
                        : isActive
                        ? "bg-[#E4002B] text-white ring-4 ring-red-100"
                        : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className={`text-[10px] text-center leading-tight ${isActive ? "font-bold text-[#E4002B]" : isDone ? "text-green-600" : "text-gray-400"}`}>
                    {stage.label}
                  </span>
                  {idx < ORDER_STAGES.length - 1 && (
                    <div className="hidden sm:block absolute" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Items summary */}
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-xs font-medium text-gray-500 mb-2">Các món đã đặt:</div>
            <div className="space-y-1">
              {order.items.slice(0, 3).map((item, i) => (
                <div key={i} className="flex justify-between text-xs text-gray-700">
                  <span>{item.name} × {item.quantity}</span>
                  <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
              {order.items.length > 3 && (
                <div className="text-xs text-gray-400">+{order.items.length - 3} món khác</div>
              )}
            </div>
          </div>

          {/* Priority info */}
          {order.priorityReason && !isCompleted && (
            <div className={`mt-3 text-xs rounded-lg p-2.5 border flex items-start gap-2 ${
              order.priority === "critical" ? "bg-red-50 border-red-200 text-red-700" :
              order.priority === "high" ? "bg-orange-50 border-orange-200 text-orange-700" :
              "bg-blue-50 border-blue-200 text-blue-700"
            }`}>
              <span className="flex-shrink-0 mt-0.5">ℹ️</span>
              <span>{order.priorityReason}</span>
            </div>
          )}

          {isCompleted && (
            <div className="mt-3">
              <Link href="/customer/feedback">
                <Button variant="outline" className="w-full border-[#E4002B] text-[#E4002B] hover:bg-[#E4002B] hover:text-white text-sm">
                  ⭐ Đánh giá đơn hàng này
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
