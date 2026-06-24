"use client";
import { motion } from "framer-motion";
import { Users, Clock, AlertTriangle, CheckCircle, Sun, Sunset, Moon } from "lucide-react";
import { employees, getEmployeesByShift } from "@/lib/data/employees";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageWrapper, PageHeader } from "@/components/layout/PageWrapper";
import type { ShiftTime } from "@/lib/types";

const SHIFTS: { key: ShiftTime; label: string; time: string; icon: React.ReactNode; required: number; color: string; bg: string }[] = [
  { key: "morning", label: "Ca sáng", time: "06:00 - 14:00", icon: <Sun className="h-5 w-5" />, required: 4, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
  { key: "afternoon", label: "Ca chiều", time: "14:00 - 22:00", icon: <Sunset className="h-5 w-5" />, required: 4, color: "text-orange-600", bg: "bg-orange-50 border-orange-200" },
  { key: "evening", label: "Ca tối", time: "22:00 - 06:00", icon: <Moon className="h-5 w-5" />, required: 3, color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-200" },
];

const SHIFT_METRICS: Record<ShiftTime, { orders: number; peakOrders: number; avgWait: number; load: number }> = {
  morning: { orders: 89, peakOrders: 24, avgWait: 13.5, load: 65 },
  afternoon: { orders: 124, peakOrders: 42, avgWait: 18.2, load: 82 },
  evening: { orders: 78, peakOrders: 31, avgWait: 15.8, load: 74 },
};

export default function ShiftsPage() {
  return (
    <PageWrapper maxWidth="7xl">
      <PageHeader
        title="Quản lý Ca làm việc"
        description="Phân bổ nhân lực & giám sát ca · KFC Vincom Bà Triệu"
        icon={<Clock className="h-5 w-5" />}
        badge={<Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">📅 Thứ Ba, 24/06/2025</Badge>}
      />

      {/* Daily overview */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Tổng nhân viên hôm nay", value: employees.length.toString(), icon: "👥" },
          { label: "Tổng đơn hàng", value: "291", icon: "📦" },
          { label: "Thời gian chờ TB", value: "15.8p", icon: "⏱️" },
          { label: "Hiệu suất chung", value: "78%", icon: "📈" },
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
          const shiftEmployees = getEmployeesByShift("b001", key);
          const actual = shiftEmployees.length;
          const isUnderstaffed = actual < required;
          const metrics = SHIFT_METRICS[key];

          return (
            <motion.div key={key} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
              <Card className={`h-full ${isUnderstaffed ? "ring-2 ring-amber-400" : ""}`}>
                <CardHeader>
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
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-center gap-2">
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

                  {/* Employee list */}
                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-2">Nhân viên trong ca</div>
                    <div className="space-y-2">
                      {shiftEmployees.map((emp) => (
                        <div key={emp.id} className="flex items-center gap-2 p-2.5 bg-gray-50 rounded-xl">
                          <span className="text-lg">{emp.avatar}</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-gray-900 truncate">{emp.name}</div>
                            <div className="text-[10px] text-gray-500">
                              {emp.role === "supervisor" ? "Giám sát" : emp.role === "cashier" ? "Thu ngân" : "Bếp"}
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className={`w-1.5 h-1.5 rounded-full ${emp.performanceScore >= 85 ? "bg-green-500" : emp.performanceScore >= 70 ? "bg-amber-500" : "bg-red-500"}`} />
                            <span className="text-[10px] font-bold text-gray-600">{emp.performanceScore}</span>
                          </div>
                        </div>
                      ))}

                      {/* Empty slots */}
                      {Array.from({ length: Math.max(0, required - actual) }).map((_, i) => (
                        <div key={i} className="flex items-center gap-2 p-2.5 border-2 border-dashed border-amber-300 rounded-xl bg-amber-50">
                          <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center">
                            <Users className="h-4 w-4 text-amber-600" />
                          </div>
                          <span className="text-xs text-amber-600 font-medium">Cần bổ sung nhân viên</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status */}
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
    </PageWrapper>
  );
}
