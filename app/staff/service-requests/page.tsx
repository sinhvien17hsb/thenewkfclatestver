"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCircle, Loader2, RefreshCw, Clock, Droplets, FileText, CreditCard, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { usePolling } from "@/lib/hooks";

interface ServiceRequest {
  id: string; tableNumber: string; type: string;
  status: string; createdAt: string; completedAt?: string;
}

const TYPE_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  WATER: { label: "Nước uống", icon: Droplets, color: "text-blue-400" },
  TISSUE: { label: "Giấy ăn", icon: FileText, color: "text-yellow-400" },
  BILL: { label: "Thanh toán", icon: CreditCard, color: "text-green-400" },
  ASSISTANCE: { label: "Hỗ trợ", icon: HelpCircle, color: "text-purple-400" },
};

function elapsed(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  return `${Math.floor(diff / 60)}m`;
}

export default function ServiceRequestsPage() {
  const { data: requests, loading, refetch } = usePolling<ServiceRequest[]>("/api/service-requests", 4000);
  const [completing, setCompleting] = useState<string | null>(null);
  const [filter, setFilter] = useState<"PENDING" | "COMPLETED">("PENDING");

  const handleComplete = async (id: string) => {
    setCompleting(id);
    try {
      const res = await fetch(`/api/service-requests/${id}/complete`, { method: "PATCH" });
      if (!res.ok) throw new Error("Failed");
      toast.success("Đã xử lý yêu cầu!");
      refetch();
    } catch {
      toast.error("Không thể cập nhật.");
    } finally {
      setCompleting(null);
    }
  };

  const filtered = (requests ?? []).filter((r) => r.status === filter);
  const pendingCount = (requests ?? []).filter((r) => r.status === "PENDING").length;

  return (
    <div className="p-4 min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Bell className="h-5 w-5 text-[#E4002B]" />
            Yêu cầu bàn
          </h1>
          <p className="text-gray-500 text-xs mt-0.5">Cập nhật mỗi 4 giây</p>
        </div>
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <span className="bg-[#E4002B] text-white text-xs font-black px-2 py-1 rounded-full animate-pulse">
              {pendingCount} mới
            </span>
          )}
          <button onClick={refetch} className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-400">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {(["PENDING", "COMPLETED"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`flex-1 py-2 rounded-xl text-sm font-bold transition-colors ${
              filter === s ? "bg-[#E4002B] text-white" : "bg-gray-900 text-gray-400 hover:bg-gray-800"
            }`}
          >
            {s === "PENDING" ? `Đang chờ (${pendingCount})` : "Đã xử lý"}
          </button>
        ))}
      </div>

      {loading && !requests ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 text-[#E4002B] animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-700">
          <Bell className="h-12 w-12 mb-3" />
          <p>{filter === "PENDING" ? "Không có yêu cầu đang chờ" : "Chưa có yêu cầu nào"}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map((req) => {
              const meta = TYPE_META[req.type] ?? { label: req.type, icon: HelpCircle, color: "text-gray-400" };
              const Icon = meta.icon;
              const isOld = (Date.now() - new Date(req.createdAt).getTime()) > 5 * 60 * 1000;
              return (
                <motion.div
                  key={req.id}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  className={`bg-gray-900 rounded-2xl border overflow-hidden ${
                    req.status === "PENDING" && isOld
                      ? "border-red-800 ring-1 ring-red-800/40"
                      : "border-gray-800"
                  }`}
                >
                  {req.status === "PENDING" && isOld && (
                    <div className="bg-red-900/70 text-red-200 text-center py-1 text-xs font-bold">
                      ⚠️ Chờ quá lâu
                    </div>
                  )}
                  <div className="p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`h-5 w-5 ${meta.color}`} />
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{meta.label}</div>
                        <div className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                          <span className="bg-gray-800 px-1.5 py-0.5 rounded-md">Bàn {req.tableNumber}</span>
                          <Clock className="h-3 w-3" />
                          {elapsed(req.createdAt)}
                        </div>
                      </div>
                    </div>

                    {req.status === "PENDING" ? (
                      <button
                        onClick={() => handleComplete(req.id)}
                        disabled={completing === req.id}
                        className="flex items-center gap-1.5 bg-green-700 hover:bg-green-600 text-white text-xs font-bold px-3 py-2 rounded-xl transition-colors disabled:opacity-50 flex-shrink-0"
                      >
                        {completing === req.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <CheckCircle className="h-3.5 w-3.5" />
                        )}
                        Xong
                      </button>
                    ) : (
                      <span className="text-xs text-green-500 font-semibold flex items-center gap-1">
                        <CheckCircle className="h-3.5 w-3.5" /> Đã xử lý
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
