"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Circle, AlertTriangle, Clock, ChevronDown, ChevronRight, Shield, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { sopChecklists, sopCompletions } from "@/lib/data/sop";
import { employees } from "@/lib/data/employees";
import { readUserCookie } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { PageWrapper, PageHeader } from "@/components/layout/PageWrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SOPPage() {
  const role = readUserCookie()?.role ?? "kitchen";
  const canSeeHistory = role === "supervisor" || role === "manager";
  const canSeeAnalytics = role === "manager";

  const [selectedChecklist, setSelectedChecklist] = useState(sopChecklists[0]);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const totalSteps = selectedChecklist.steps.length;
  const completedCount = completedSteps.size;
  const progress = Math.round((completedCount / totalSteps) * 100);

  const toggleStep = (stepId: string, critical: boolean) => {
    const newSet = new Set(completedSteps);
    if (newSet.has(stepId)) {
      newSet.delete(stepId);
    } else {
      newSet.add(stepId);
      if (critical) {
        toast.success("Bước quan trọng đã hoàn thành ✅", { duration: 2000 });
      }
    }
    setCompletedSteps(newSet);
  };

  const handleSubmit = () => {
    if (completedCount < totalSteps) {
      const skippedCritical = selectedChecklist.steps.filter(
        (s) => s.critical && !completedSteps.has(s.id)
      );
      if (skippedCritical.length > 0) {
        toast.error(`Còn ${skippedCritical.length} bước QUAN TRỌNG chưa hoàn thành!`, {
          description: "Các bước quan trọng không thể bỏ qua.",
        });
        return;
      }
      toast.warning(`Hoàn thành ${progress}% — Bỏ qua ${totalSteps - completedCount} bước`, { duration: 3000 });
    }
    setSubmitted(true);
    toast.success("SOP đã được ghi nhận!", { description: `Tuân thủ: ${progress}%` });
  };

  const handleReset = () => {
    setCompletedSteps(new Set());
    setSubmitted(false);
  };

  return (
    <PageWrapper maxWidth="7xl">
      <PageHeader
        title="SOP Management System"
        description="Quản lý quy trình vận hành chuẩn · Theo dõi tuân thủ"
        icon={<Shield className="h-5 w-5" />}
      />

      <Tabs defaultValue="checklist">
        <TabsList className="mb-6">
          <TabsTrigger value="checklist">✅ Checklist SOP</TabsTrigger>
          {canSeeHistory && <TabsTrigger value="history">📊 Lịch sử tuân thủ</TabsTrigger>}
          {canSeeAnalytics && <TabsTrigger value="analytics">📈 Phân tích</TabsTrigger>}
        </TabsList>

        <TabsContent value="checklist">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Checklist selector */}
            <div className="space-y-3">
              <h2 className="font-bold text-gray-900 text-sm">Chọn quy trình</h2>
              {sopChecklists.map((cl) => (
                <button
                  key={cl.id}
                  onClick={() => { setSelectedChecklist(cl); setCompletedSteps(new Set()); setSubmitted(false); }}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    selectedChecklist.id === cl.id
                      ? "border-[#E4002B] bg-red-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="font-semibold text-sm text-gray-900">{cl.title}</div>
                  <div className="text-xs text-gray-500 mt-1">{cl.steps.length} bước · {cl.frequency === "each_batch" ? "Mỗi mẻ" : cl.frequency === "each_shift" ? "Mỗi ca" : "Mỗi ngày"}</div>
                  <div className="flex gap-1 mt-2">
                    {cl.steps.filter((s) => s.critical).length > 0 && (
                      <Badge className="text-[10px] bg-red-100 text-red-700 border-red-200 px-1.5 py-0">
                        {cl.steps.filter((s) => s.critical).length} bước bắt buộc
                      </Badge>
                    )}
                  </div>
                </button>
              ))}

              {/* Current employee */}
              <Card>
                <CardContent className="p-3">
                  <div className="text-xs font-medium text-gray-500 mb-2">Nhân viên thực hiện</div>
                  <div className="flex items-center gap-2">
                    <div className="text-2xl">{employees[0].avatar}</div>
                    <div>
                      <div className="font-semibold text-sm text-gray-900">{employees[0].name}</div>
                      <div className="text-xs text-gray-500">Ca sáng · Nhân viên bếp</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Checklist */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{selectedChecklist.title}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">{completedCount}/{totalSteps} bước hoàn thành</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-3xl font-black ${progress >= 90 ? "text-green-600" : progress >= 70 ? "text-amber-600" : "text-red-600"}`}>
                        {progress}%
                      </div>
                      <div className="text-xs text-gray-500">Tuân thủ</div>
                    </div>
                  </div>
                  <Progress value={progress} className="mt-3" color={progress >= 90 ? "#10B981" : progress >= 70 ? "#F59E0B" : "#EF4444"} />
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedChecklist.steps.map((step) => {
                    const isCompleted = completedSteps.has(step.id);
                    const isExpanded = expandedStep === step.id;

                    return (
                      <motion.div
                        key={step.id}
                        layout
                        className={`rounded-xl border-2 overflow-hidden transition-all ${
                          isCompleted
                            ? "border-green-200 bg-green-50"
                            : step.critical
                            ? "border-red-200 bg-red-50/30"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <div
                          className="flex items-center gap-3 p-4 cursor-pointer"
                          onClick={() => !submitted && toggleStep(step.id, step.critical)}
                        >
                          <button
                            className="flex-shrink-0"
                            onClick={(e) => { e.stopPropagation(); !submitted && toggleStep(step.id, step.critical); }}
                          >
                            {isCompleted ? (
                              <CheckCircle className="h-6 w-6 text-green-500" />
                            ) : (
                              <Circle className={`h-6 w-6 ${step.critical ? "text-red-400" : "text-gray-300"}`} />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-400">Bước {step.stepNumber}</span>
                              {step.critical && (
                                <Badge className="bg-red-100 text-red-700 border-red-200 text-[10px] px-1.5 py-0">Bắt buộc</Badge>
                              )}
                            </div>
                            <p className={`font-semibold text-sm mt-0.5 ${isCompleted ? "line-through text-gray-400" : "text-gray-900"}`}>
                              {step.title}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {step.requiredTime >= 60 ? `${Math.floor(step.requiredTime / 60)}p` : `${step.requiredTime}s`}
                            </span>
                            <button
                              onClick={(e) => { e.stopPropagation(); setExpandedStep(isExpanded ? null : step.id); }}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: "auto" }}
                            exit={{ height: 0 }}
                            className="px-4 pb-4"
                          >
                            <p className="text-sm text-gray-600 bg-white rounded-lg p-3 border border-gray-100">
                              {step.description}
                            </p>
                          </motion.div>
                        )}
                      </motion.div>
                    );
                  })}

                  <div className="pt-2 flex gap-3">
                    {!submitted ? (
                      <Button onClick={handleSubmit} className="flex-1">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Xác nhận hoàn thành ({progress}%)
                      </Button>
                    ) : (
                      <Button onClick={handleReset} variant="outline" className="flex-1">
                        Làm lại SOP mới
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {canSeeHistory && <TabsContent value="history">
          <div className="space-y-4">
            <h2 className="font-bold text-gray-900">Lịch sử hoàn thành SOP hôm nay</h2>
            {sopCompletions.map((completion) => (
              <Card key={completion.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">
                        {employees.find((e) => e.id === completion.employeeId)?.avatar ?? "👤"}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{completion.employeeName}</div>
                        <div className="text-xs text-gray-500">
                          {sopChecklists.find((c) => c.id === completion.checklistId)?.title} ·{" "}
                          {new Date(completion.completedAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-xl font-black ${completion.complianceRate >= 90 ? "text-green-600" : completion.complianceRate >= 70 ? "text-amber-600" : "text-red-600"}`}>
                        {completion.complianceRate}%
                      </div>
                      <div className="text-xs text-gray-500">Tuân thủ</div>
                    </div>
                  </div>
                  {completion.skippedSteps.length > 0 && (
                    <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-2.5 flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-amber-700">
                        <strong>Bỏ qua {completion.skippedSteps.length} bước</strong>
                        {completion.notes && ` · ${completion.notes}`}
                      </div>
                    </div>
                  )}
                  <div className="mt-3">
                    <Progress value={completion.complianceRate} color={completion.complianceRate >= 90 ? "#10B981" : completion.complianceRate >= 70 ? "#F59E0B" : "#EF4444"} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>}

        {canSeeAnalytics && <TabsContent value="analytics">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { label: "Tỷ lệ tuân thủ TB hôm nay", value: "81%", color: "text-amber-600", icon: "📋", note: "Cần cải thiện" },
              { label: "Bước bị bỏ qua nhiều nhất", value: "Kiểm tra nhiệt độ", color: "text-red-600", icon: "🌡️", note: "Bước 5 · 3 lần hôm nay" },
              { label: "Nhân viên tuân thủ cao nhất", value: "Phạm Thị Linh", color: "text-green-600", icon: "🏆", note: "100% · Giám sát ca" },
            ].map((item) => (
              <Card key={item.label}>
                <CardContent className="p-5 text-center">
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <div className={`text-2xl font-black mb-1 ${item.color}`}>{item.value}</div>
                  <div className="text-sm font-medium text-gray-700">{item.label}</div>
                  <div className="text-xs text-gray-400 mt-1">{item.note}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4 text-[#E4002B]" />
                  Tỷ lệ tuân thủ SOP theo nhân viên
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sopCompletions.map((c) => (
                    <div key={c.id} className="flex items-center gap-3">
                      <div className="text-lg">{employees.find((e) => e.id === c.employeeId)?.avatar ?? "👤"}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">{c.employeeName}</span>
                          <span className={`text-sm font-bold ${c.complianceRate >= 90 ? "text-green-600" : c.complianceRate >= 70 ? "text-amber-600" : "text-red-600"}`}>
                            {c.complianceRate}%
                          </span>
                        </div>
                        <Progress value={c.complianceRate} className="h-1.5" color={c.complianceRate >= 90 ? "#10B981" : c.complianceRate >= 70 ? "#F59E0B" : "#EF4444"} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>}
      </Tabs>
    </PageWrapper>
  );
}
