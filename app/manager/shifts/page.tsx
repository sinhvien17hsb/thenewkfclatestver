"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Clock, AlertTriangle, CheckCircle,
  Sun, Sunset, Moon, Plus, X, Loader2, ChefHat, CreditCard, Briefcase
} from "lucide-react";
import { toast } from "sonner";
import { usePolling } from "@/lib/hooks";
import { useManagerStore, type ShiftKey, type ShiftEmployee } from "@/lib/store";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageWrapper, PageHeader } from "@/components/layout/PageWrapper";
import { Button } from "@/components/ui/button";

interface DbEmployee { id: string; name: string; employeeId: string; branch: string; role: string; isActive: boolean; }

const SHIFTS: { key: ShiftKey; label: string; time: string; icon: React.ReactNode; required: number; color: string; bg: string }[] = [
  { key: "morning",   label: "Ca sáng",  time: "06:00 - 14:00", icon: <Sun className="h-5 w-5" />,    required: 4, color: "text-amber-600",  bg: "bg-amber-50 border-amber-200" },
  { key: "afternoon", label: "Ca chiều", time: "14:00 - 22:00", icon: <Sunset className="h-5 w-5" />, required: 4, color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
  { key: "evening",   label: "Ca tối",   time: "22:00 - 06:00", icon: <Moon className="h-5 w-5" />,   required: 3, color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200" },
];

const SHIFT_METRICS: Record<ShiftKey, { orders: number; avgWait: number; load: number }> = {
  morning:   { orders: 89,  avgWait: 13.5, load: 65 },
  afternoon: { orders: 124, avgWait: 18.2, load: 82 },
  evening:   { orders: 78,  avgWait: 15.8, load: 74 },
};

const ROLE_META: Record<string, { label: string; icon: React.ElementType; color: string; avatar: string }> = {
  KITCHEN:  { label: "Bếp",     icon: ChefHat,   color: "text-orange-600", avatar: "👨‍🍳" },
  CASHIER:  { label: "Thu ngân", icon: CreditCard, color: "text-blue-600",  avatar: "💳" },
  MANAGER:  { label: "Quản lý", icon: Briefcase,  color: "text-purple-600", avatar: "👔" },
};

function AddWorkerModal({
  shift, assignedIds, employees, onAdd, onClose
}: {
  shift: ShiftKey; assignedIds: Set<string>;
  employees: DbEmployee[]; onAdd: (emp: ShiftEmployee) => void; onClose: () => void;
}) {
  const available = employees.filter((e) => e.isActive && !assignedIds.has(e.id));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-[#1A1A1A] px-4 py-3 flex items-center justify-between">
          <div>
            <div className="text-white font-bold text-sm">Thêm nhân viên vào ca</div>
            <div className="text-gray-400 text-xs mt-0.5">{SHIFTS.find((s) => s.key === shift)?.label}</div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-3 max-h-80 overflow-y-auto">
          {available.length === 0 ? (
            <div className="text-center py-8 text-gray-400 text-sm">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-40" />
              Tất cả nhân viên đã được phân ca
            </div>
          ) : (
            <div className="space-y-2">
              {available.map((emp) => {
                const meta = ROLE_META[emp.role] ?? { label: emp.role, avatar: "👤", icon: Users, color: "text-gray-500" };
                return (
                  <button
                    key={emp.id}
                    onClick={() => { onAdd({ id: emp.id, employeeId: emp.employeeId, name: emp.name, role: emp.role, isActive: emp.isActive }); onClose(); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 border border-gray-100 hover:border-[#E4002B]/30 transition-all text-left"
                  >
                    <span className="text-2xl">{meta.avatar}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 text-sm">{emp.name}</div>
                      <div className={`text-xs ${meta.color}`}>{meta.label} · {emp.employeeId}</div>
                    </div>
                    <Plus className="h-4 w-4 text-[#E4002B] flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function ShiftsPage() {
  const { shiftAssignments, addToShift, removeFromShift } = useManagerStore();
  const { data: employees, loading } = usePolling<DbEmployee[]>("/api/employees", 0);
  const [addingShift, setAddingShift] = useState<ShiftKey | null>(null);

  const allAssignedIds = new Set(
    Object.values(shiftAssignments).flatMap((emps) => emps.map((e) => e.id))
  );

  const totalWorkers = Object.values(shiftAssignments).reduce((s, emps) => s + emps.length, 0);

  return (
    <PageWrapper maxWidth="7xl">
      <PageHeader
        title="Quản lý Ca làm việc"
        description="Phân bổ nhân lực & giám sát ca · KFC Vincom Bà Triệu"
        icon={<Clock className="h-5 w-5" />}
        dark
        badge={<Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">📅 {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}</Badge>}
      />

      {/* Summary */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Tổng nhân viên hôm nay", value: totalWorkers.toString(), icon: "👥" },
          { label: "Tổng đơn hàng", value: "291", icon: "📦" },
          { label: "Thời gian chờ TB", value: "15.8p", icon: "⏱️" },
          { label: "Nhân viên trong DB", value: loading ? "..." : (employees ?? []).length.toString(), icon: "🗂️" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <span className="text-3xl">{s.icon}</span>
              <div>
                <div className="text-2xl font-black text-gray-900">{s.value}</div>
                <div className="text-xs text-gray-500">{s.label}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Shift columns */}
      <div className="grid md:grid-cols-3 gap-6">
        {SHIFTS.map(({ key, label, time, icon, required, color, bg }) => {
          const assigned = shiftAssignments[key];
          const actual = assigned.length;
          const isUnderstaffed = actual < required;
          const metrics = SHIFT_METRICS[key];

          return (
            <motion.div key={key} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <Card className={`h-full ${isUnderstaffed ? "ring-2 ring-amber-400" : ""}`}>
                <CardHeader className="pb-0">
                  <div className={`flex items-center justify-between p-3 rounded-xl border-2 ${bg} mb-2`}>
                    <div className="flex items-center gap-2">
                      <span className={color}>{icon}</span>
                      <div>
                        <div className={`font-bold ${color}`}>{label}</div>
                        <div className="text-xs text-gray-500">{time}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-black ${isUnderstaffed ? "text-red-600" : "text-green-600"}`}>{actual}/{required}</div>
                      <div className="text-xs text-gray-500">nhân viên</div>
                    </div>
                  </div>

                  {isUnderstaffed && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0" />
                      <span className="text-xs text-amber-700 font-medium">
                        Thiếu {required - actual} nhân viên! Cần điều động bổ sung.
                      </span>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <div className="text-lg font-black text-gray-900">{metrics.orders}</div>
                      <div className="text-[10px] text-gray-500">Đơn đã xử lý</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <div className={`text-lg font-black ${metrics.avgWait > 17 ? "text-red-600" : "text-amber-600"}`}>{metrics.avgWait}p</div>
                      <div className="text-[10px] text-gray-500">Chờ TB</div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-600">Tải công việc</span>
                      <span className={`text-xs font-bold ${metrics.load > 80 ? "text-red-600" : metrics.load > 70 ? "text-amber-600" : "text-green-600"}`}>{metrics.load}%</span>
                    </div>
                    <Progress value={metrics.load} color={metrics.load > 80 ? "#EF4444" : metrics.load > 70 ? "#F59E0B" : "#10B981"} />
                  </div>

                  {/* Worker list */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-500">Nhân viên trong ca</span>
                      <button
                        onClick={() => setAddingShift(key)}
                        className="flex items-center gap-1 text-xs text-[#E4002B] font-semibold hover:bg-red-50 px-2 py-1 rounded-lg transition-colors"
                        disabled={loading}
                      >
                        {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
                        Thêm
                      </button>
                    </div>

                    <div className="space-y-2">
                      <AnimatePresence>
                        {assigned.map((emp) => {
                          const meta = ROLE_META[emp.role] ?? { label: emp.role, avatar: "👤", color: "text-gray-500" };
                          return (
                            <motion.div
                              key={emp.id}
                              layout
                              initial={{ opacity: 0, x: -12 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 12, height: 0, marginTop: 0 }}
                              className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl group"
                            >
                              <span className="text-lg">{meta.avatar}</span>
                              <div className="flex-1 min-w-0">
                                <div className="text-xs font-semibold text-gray-900 truncate">{emp.name}</div>
                                <div className={`text-[10px] ${meta.color}`}>{meta.label} · {emp.employeeId}</div>
                              </div>
                              <button
                                onClick={() => {
                                  removeFromShift(key, emp.id);
                                  toast.info(`Đã xóa ${emp.name} khỏi ${label}`);
                                }}
                                className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500 transition-all"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>

                      {/* Empty slots */}
                      {Array.from({ length: Math.max(0, required - actual) }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setAddingShift(key)}
                          className="w-full flex items-center gap-2 p-2.5 border-2 border-dashed border-amber-300 rounded-xl bg-amber-50 hover:bg-amber-100 transition-colors"
                        >
                          <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center flex-shrink-0">
                            <Plus className="h-4 w-4 text-amber-600" />
                          </div>
                          <span className="text-xs text-amber-600 font-medium">Nhấn để thêm nhân viên</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={`flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-lg ${actual >= required ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
                    {actual >= required ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                    {actual >= required ? "Ca đủ nhân lực" : `Thiếu ${required - actual} nhân viên`}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Add worker modal */}
      <AnimatePresence>
        {addingShift && (
          <AddWorkerModal
            shift={addingShift}
            assignedIds={allAssignedIds}
            employees={employees ?? []}
            onAdd={(emp) => {
              addToShift(addingShift, emp);
              toast.success(`Đã thêm ${emp.name} vào ${SHIFTS.find((s) => s.key === addingShift)?.label}`);
            }}
            onClose={() => setAddingShift(null)}
          />
        )}
      </AnimatePresence>
    </PageWrapper>
  );
}
