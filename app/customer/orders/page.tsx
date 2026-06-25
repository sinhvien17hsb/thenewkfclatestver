"use client";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock, ChefHat, ShieldCheck, Package, ArrowLeft, RefreshCw, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { formatCurrency, getStatusLabel, formatTimeAgo } from "@/lib/utils";
import { translate } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { Card, CardContent } from "@/components/ui/card";

interface OrderItem { name: string; quantity: number; price: number }
interface TrackedOrder {
  id: string;
  orderNumber: string;
  tableNumber?: string;
  customerName?: string | null;
  status: string;
  totalAmount: number;
  estimatedTime: number;
  createdAt: string;
  items: OrderItem[];
}

const ORDER_STAGE_KEYS = [
  { key: "queued",        labelKey: "status_queued" as const,        icon: Clock,        color: "text-amber-500" },
  { key: "preparing",     labelKey: "status_preparing" as const,     icon: ChefHat,      color: "text-blue-500" },
  { key: "quality_check", labelKey: "status_quality_check" as const, icon: ShieldCheck,  color: "text-purple-500" },
  { key: "ready",         labelKey: "status_ready" as const,         icon: Package,      color: "text-green-500" },
  { key: "completed",     labelKey: "status_completed" as const,     icon: CheckCircle,  color: "text-gray-500" },
];

const STAGE_INDEX: Record<string, number> = { queued: 0, preparing: 1, quality_check: 2, ready: 3, completed: 4 };
const STAGE_PROGRESS: Record<string, number> = { queued: 15, preparing: 40, quality_check: 70, ready: 90, completed: 100 };

const STATUS_COLORS: Record<string, string> = {
  queued: "border-amber-200 bg-amber-50",
  preparing: "border-blue-200 bg-blue-50",
  quality_check: "border-purple-200 bg-purple-50",
  ready: "border-green-200 bg-green-50",
  completed: "border-gray-200 bg-gray-50",
};

export default function OrdersPage() {
  const { customerOrders, updateCustomerOrderStatus, language } = useAppStore();
  const tr = (key: Parameters<typeof translate>[0]) => translate(key, language);
  const [refreshing, setRefreshing] = useState(false);

  const refreshStatuses = useCallback(async () => {
    setRefreshing(true);
    const active = customerOrders.filter((o) => o.status !== "completed" && o.status !== "cancelled");
    await Promise.all(
      active.map(async (o) => {
        try {
          const res = await fetch(`/api/orders/${o.id}`);
          if (res.ok) {
            const data = await res.json();
            updateCustomerOrderStatus(o.id, data.status);
          }
        } catch { /* silent */ }
      })
    );
    setRefreshing(false);
  }, [customerOrders, updateCustomerOrderStatus]);

  useEffect(() => {
    if (customerOrders.length === 0) return;
    refreshStatuses();
    const t = setInterval(refreshStatuses, 10000);
    return () => clearInterval(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (customerOrders.length === 0) {
    return (
      <PageWrapper maxWidth="2xl">
        <div className="text-center py-20">
          <div className="text-8xl mb-4">📦</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{tr("orders_empty")}</h2>
          <p className="text-gray-500 mb-6">{tr("orders_empty_desc")}</p>
          <Link href="/customer/menu">
            <Button size="lg">{tr("orders_order_now")}</Button>
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
            <h1 className="text-2xl font-black text-gray-900">{tr("orders_title")}</h1>
            <p className="text-sm text-gray-500">{customerOrders.length} {tr("orders_count")}</p>
          </div>
        </div>
        <button
          onClick={refreshStatuses}
          className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
        </button>
      </div>

      <div className="space-y-4">
        {customerOrders.map((order) => (
          <OrderTrackingCard key={order.id} order={order} language={language} />
        ))}
      </div>
    </PageWrapper>
  );
}

function OrderTrackingCard({ order, language }: { order: TrackedOrder; language: import("@/lib/i18n").Lang }) {
  const tr = (key: Parameters<typeof translate>[0]) => translate(key, language);
  const stageIdx = STAGE_INDEX[order.status] ?? 0;
  const progress = STAGE_PROGRESS[order.status] ?? 0;
  const isReady = order.status === "ready";
  const isCompleted = order.status === "completed";

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={`overflow-hidden ${isReady ? "ring-2 ring-green-400" : ""}`}>
        {isReady && (
          <div className="bg-green-500 text-white text-center py-2 text-sm font-bold animate-pulse">
            {tr("orders_ready_banner")}
          </div>
        )}
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="font-black text-lg text-gray-900">{order.orderNumber}</div>
              <div className="text-sm text-gray-500">
                {order.tableNumber ? `${tr("orders_table")} ${order.tableNumber}` : tr("orders_takeaway")} · {order.customerName ?? (language === "en" ? "Guest" : "Khách hàng")}
              </div>
              <div className="text-xs text-gray-400 mt-0.5">{formatTimeAgo(order.createdAt)}</div>
            </div>
            <div className="text-right">
              <Badge className={`${STATUS_COLORS[order.status] ?? ""} border text-xs`}>
                {getStatusLabel(order.status)}
              </Badge>
              <div className="text-sm font-bold text-gray-900 mt-1">{formatCurrency(order.totalAmount)}</div>
            </div>
          </div>

          {!isCompleted && (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-600">{tr("orders_progress")}</span>
                {order.estimatedTime > 0 && (
                  <span className="text-sm font-bold text-amber-600">⏱ ~{order.estimatedTime} {language === "en" ? "min" : "phút"}</span>
                )}
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            {ORDER_STAGE_KEYS.map((stage, idx) => {
              const isActive = idx === stageIdx && !isCompleted;
              const isDone = idx < stageIdx || isCompleted;
              const Icon = stage.icon;
              return (
                <div key={stage.key} className="flex flex-col items-center flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 transition-all ${
                    isDone ? "bg-green-500 text-white" : isActive ? "bg-[#E4002B] text-white ring-4 ring-red-100" : "bg-gray-100 text-gray-400"
                  }`}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className={`text-[10px] text-center leading-tight ${
                    isActive ? "font-bold text-[#E4002B]" : isDone ? "text-green-600" : "text-gray-400"
                  }`}>{tr(stage.labelKey)}</span>
                </div>
              );
            })}
          </div>

          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-xs font-medium text-gray-500 mb-2">{tr("orders_items")}</div>
            <div className="space-y-1">
              {order.items.slice(0, 3).map((item, i) => (
                <div key={i} className="flex justify-between text-xs text-gray-700">
                  <span>{item.name} × {item.quantity}</span>
                  <span className="font-medium">{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
              {order.items.length > 3 && (
                <div className="text-xs text-gray-400">+{order.items.length - 3} {tr("orders_more")}</div>
              )}
            </div>
          </div>

          {isCompleted && (
            <div className="mt-3">
              <Link href="/customer/feedback">
                <Button variant="outline" className="w-full border-[#E4002B] text-[#E4002B] hover:bg-[#E4002B] hover:text-white text-sm">
                  {tr("orders_review")}
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
