"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle, Clock, Filter, Bell, X } from "lucide-react";
import { toast } from "sonner";
import { useManagerStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageWrapper, PageHeader } from "@/components/layout/PageWrapper";
import { formatTimeAgo } from "@/lib/utils";
import type { Alert, AlertSeverity, AlertType } from "@/lib/types";

const TYPE_LABELS: Record<AlertType, string> = {
  quality_drop: "Chất lượng giảm",
  sop_violation: "Vi phạm SOP",
  wait_time: "Thời gian chờ",
  satisfaction: "Hài lòng KH",
  understaffed: "Thiếu nhân viên",
  kitchen_overload: "Bếp quá tải",
};

const TYPE_ICONS: Record<AlertType, string> = {
  quality_drop: "🍗",
  sop_violation: "📋",
  wait_time: "⏱️",
  satisfaction: "😞",
  understaffed: "👥",
  kitchen_overload: "🔥",
};

const SEVERITY_CONFIG: Record<AlertSeverity, { label: string; color: string; bg: string; border: string }> = {
  critical: { label: "Khẩn cấp", color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
  warning: { label: "Cảnh báo", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
  info: { label: "Thông tin", color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200" },
};

export default function AlertsPage() {
  const { alerts, resolveAlert } = useManagerStore();
  const [filterSeverity, setFilterSeverity] = useState<AlertSeverity | "all">("all");
  const [filterStatus, setFilterStatus] = useState<"active" | "resolved" | "all">("active");
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null);

  const filtered = alerts.filter((a) => {
    if (filterSeverity !== "all" && a.severity !== filterSeverity) return false;
    if (filterStatus === "active" && a.resolved) return false;
    if (filterStatus === "resolved" && !a.resolved) return false;
    return true;
  });

  const activeAlerts = alerts.filter((a) => !a.resolved);
  const criticalCount = activeAlerts.filter((a) => a.severity === "critical").length;
  const warningCount = activeAlerts.filter((a) => a.severity === "warning").length;

  const handleResolve = (alert: Alert) => {
    resolveAlert(alert.id);
    toast.success(`Đã giải quyết: ${alert.title}`, { duration: 3000 });
  };

  return (
    <PageWrapper maxWidth="7xl">
      <PageHeader
        title="Quality Risk Alert Engine"
        description="Cảnh báo rủi ro chất lượng · Phát hiện sự cố tự động"
        icon={<Bell className="h-5 w-5" />}
        dark
        badge={
          criticalCount > 0 ? (
            <Badge className="bg-red-100 text-red-700 border-red-200 animate-pulse">
              🚨 {criticalCount} khẩn cấp
            </Badge>
          ) : undefined
        }
      />

      {/* Alert summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: "Khẩn cấp", count: criticalCount, color: "text-red-600", bg: "bg-red-50 border-red-200", icon: "🚨" },
          { label: "Cảnh báo", count: warningCount, color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: "⚠️" },
          { label: "Đã giải quyết", count: alerts.filter((a) => a.resolved).length, color: "text-green-600", bg: "bg-green-50 border-green-200", icon: "✅" },
        ].map((s) => (
          <Card key={s.label} className={`border-2 ${s.bg}`}>
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-1">{s.icon}</div>
              <div className={`text-3xl font-black ${s.color}`}>{s.count}</div>
              <div className="text-sm text-gray-600">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-500">Lọc:</span>
        </div>
        <div className="flex gap-2">
          {(["all", "active", "resolved"] as const).map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filterStatus === s ? "bg-[#E4002B] text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
              {s === "all" ? "Tất cả" : s === "active" ? "Đang hoạt động" : "Đã giải quyết"}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(["all", "critical", "warning", "info"] as const).map((s) => (
            <button key={s} onClick={() => setFilterSeverity(s)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${filterSeverity === s ? "bg-gray-800 text-white" : "bg-white border border-gray-200 text-gray-600"}`}>
              {s === "all" ? "Mức độ" : SEVERITY_CONFIG[s as AlertSeverity]?.label ?? s}
            </button>
          ))}
        </div>
      </div>

      {/* Alert list */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">🎉</div>
            <p className="font-medium">Không có cảnh báo nào!</p>
          </div>
        ) : (
          <AnimatePresence>
            {filtered.map((alert) => {
              const config = SEVERITY_CONFIG[alert.severity];
              const isExpanded = expandedAlert === alert.id;

              return (
                <motion.div
                  key={alert.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className={`border-2 overflow-hidden ${alert.resolved ? "opacity-60 border-gray-200" : `${config.border} ${config.bg}`}`}>
                    {!alert.resolved && alert.severity === "critical" && (
                      <div className="bg-red-500 text-white text-center py-1 text-xs font-bold">
                        🚨 KHẨN CẤP · Cần xử lý ngay
                      </div>
                    )}
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl flex-shrink-0 mt-0.5">{TYPE_ICONS[alert.type]}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="font-bold text-gray-900 text-sm">{alert.title}</div>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge className={`text-[10px] px-1.5 py-0 ${config.color} ${config.bg} border-none`}>
                                  {config.label}
                                </Badge>
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                  {TYPE_LABELS[alert.type]}
                                </Badge>
                                <span className="text-[10px] text-gray-400">{alert.branchName.replace("KFC ", "")}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              {alert.resolved ? (
                                <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                                  <CheckCircle className="h-3 w-3 mr-1" /> Đã xử lý
                                </Badge>
                              ) : (
                                <Button size="sm" className="h-7 text-xs" onClick={() => handleResolve(alert)}>
                                  <CheckCircle className="h-3 w-3 mr-1" /> Giải quyết
                                </Button>
                              )}
                              <button onClick={() => setExpandedAlert(isExpanded ? null : alert.id)} className="p-1 text-gray-400 hover:text-gray-600">
                                {isExpanded ? <X className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                              </button>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 mt-2">{alert.description}</p>

                          {alert.metric !== undefined && alert.threshold !== undefined && (
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-gray-500">Giá trị hiện tại:</span>
                              <span className={`text-sm font-bold ${alert.severity === "critical" ? "text-red-600" : "text-amber-600"}`}>{alert.metric}</span>
                              <span className="text-xs text-gray-400">Ngưỡng: {alert.threshold}</span>
                            </div>
                          )}

                          <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimeAgo(alert.createdAt)}</span>
                          </div>

                          {/* Expanded content */}
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="mt-4 space-y-3"
                            >
                              <div className="bg-white/80 rounded-xl p-3 border border-current/10">
                                <div className="text-xs font-bold text-gray-600 mb-1">🔍 Nguyên nhân gốc rễ</div>
                                <p className="text-sm text-gray-700">{alert.rootCause}</p>
                              </div>
                              <div className="bg-white/80 rounded-xl p-3 border border-current/10">
                                <div className="text-xs font-bold text-gray-600 mb-1">💡 Hành động đề xuất</div>
                                <p className="text-sm text-gray-700">{alert.suggestedAction}</p>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </PageWrapper>
  );
}
