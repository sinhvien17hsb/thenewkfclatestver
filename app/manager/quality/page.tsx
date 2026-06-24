"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from "recharts";
import { TrendingUp, TrendingDown, Minus, Trophy, Star, Clock, Shield, Utensils, Sparkles } from "lucide-react";
import { getRankedBranches, branches } from "@/lib/data/branches";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageWrapper, PageHeader } from "@/components/layout/PageWrapper";
import { calculateQualityScore, getScoreColor, getScoreBg } from "@/lib/utils";

const rankedBranches = getRankedBranches();

const QUALITY_CRITERIA = [
  { key: "foodQuality", label: "Chất lượng món ăn", icon: <Utensils className="h-4 w-4" />, weight: "40%", color: "#E4002B" },
  { key: "service", label: "Dịch vụ KH", icon: <Star className="h-4 w-4" />, weight: "25%", color: "#3B82F6" },
  { key: "cleanliness", label: "Vệ sinh cơ sở", icon: <Sparkles className="h-4 w-4" />, weight: "20%", color: "#10B981" },
  { key: "sopCompliance", label: "Tuân thủ SOP", icon: <Shield className="h-4 w-4" />, weight: "15%", color: "#8B5CF6" },
] as const;

export default function QualityPage() {
  const [selectedBranch, setSelectedBranch] = useState(branches[0]);

  const radarData = QUALITY_CRITERIA.map((c) => ({
    criterion: c.label,
    score: selectedBranch.quality[c.key],
    fullMark: 100,
  }));

  const barData = rankedBranches.map((b) => ({
    name: b.name.replace("KFC ", ""),
    score: b.quality.overallScore,
    food: b.quality.foodQuality,
    service: b.quality.service,
    clean: b.quality.cleanliness,
    sop: b.quality.sopCompliance,
  }));

  return (
    <PageWrapper maxWidth="7xl">
      <PageHeader
        title="Quality Control Center"
        description="Kiểm soát & so sánh chất lượng 5 chi nhánh KFC"
        icon={<Trophy className="h-5 w-5" />}
        badge={
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">
            🏆 Hệ thống đánh giá chuẩn KFC
          </Badge>
        }
      />

      {/* Quality formula */}
      <div className="bg-gradient-to-r from-[#1A1A1A] to-gray-800 text-white rounded-2xl p-5 mb-6">
        <div className="text-sm font-bold text-gray-300 mb-3">Công thức chất lượng KFC</div>
        <div className="flex flex-wrap items-center gap-3 text-sm">
          {QUALITY_CRITERIA.map((c, i) => (
            <div key={c.key} className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-lg font-bold" style={{ backgroundColor: c.color + "30", color: c.color, border: `1px solid ${c.color}40` }}>
                {c.weight} × {c.label}
              </span>
              {i < QUALITY_CRITERIA.length - 1 && <span className="text-gray-400">+</span>}
            </div>
          ))}
          <span className="text-gray-400">= Điểm tổng hợp</span>
        </div>
      </div>

      {/* Branch ranking */}
      <div className="mb-6">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-[#E4002B]" /> Bảng xếp hạng chi nhánh
        </h2>
        <div className="grid gap-3">
          {rankedBranches.map((branch) => (
            <motion.div
              key={branch.id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (branch.rank ?? 1) * 0.08 }}
            >
              <Card
                className={`cursor-pointer transition-all hover:shadow-md ${selectedBranch.id === branch.id ? "ring-2 ring-[#E4002B]" : ""}`}
                onClick={() => setSelectedBranch(branch)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Rank */}
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg flex-shrink-0 ${
                      branch.rank === 1 ? "bg-yellow-400 text-yellow-900" :
                      branch.rank === 2 ? "bg-gray-300 text-gray-700" :
                      branch.rank === 3 ? "bg-amber-600 text-white" :
                      "bg-gray-100 text-gray-600"
                    }`}>
                      {branch.rank === 1 ? "🥇" : branch.rank === 2 ? "🥈" : branch.rank === 3 ? "🥉" : branch.rank}
                    </div>

                    {/* Branch info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-900 text-sm">{branch.name}</span>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          {branch.quality.trend === "up" ? <TrendingUp className="h-3 w-3 text-green-500" /> :
                           branch.quality.trend === "down" ? <TrendingDown className="h-3 w-3 text-red-500" /> :
                           <Minus className="h-3 w-3 text-gray-400" />}
                          <span className={branch.quality.trend === "up" ? "text-green-600" : branch.quality.trend === "down" ? "text-red-600" : "text-gray-500"}>
                            {branch.quality.trend === "up" ? "+" : ""}{branch.quality.trendValue}%
                          </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {QUALITY_CRITERIA.map((c) => (
                          <div key={c.key} className="text-center">
                            <div className="text-[10px] text-gray-400 mb-0.5">{c.label.split(" ")[0]}</div>
                            <Progress value={branch.quality[c.key]} className="h-1" color={c.color} />
                            <div className="text-[10px] font-bold mt-0.5" style={{ color: c.color }}>{branch.quality[c.key]}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Overall score */}
                    <div className={`text-right flex-shrink-0 px-3 py-2 rounded-xl border ${getScoreBg(branch.quality.overallScore)}`}>
                      <div className={`text-2xl font-black ${getScoreColor(branch.quality.overallScore)}`}>
                        {branch.quality.overallScore}
                      </div>
                      <div className="text-[10px] text-gray-500">Tổng điểm</div>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-[10px] text-gray-500">{branch.quality.avgWaitingTime}p</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Selected branch detail */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Radar chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">📊 Phân tích đa chiều · {selectedBranch.name.replace("KFC ", "")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis dataKey="criterion" tick={{ fontSize: 10, fill: "#6B7280" }} />
                <PolarRadiusAxis angle={0} domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Radar name="Điểm số" dataKey="score" stroke="#E4002B" fill="#E4002B" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Branch comparison bar */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">🏆 So sánh điểm tổng hợp</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} layout="vertical" margin={{ left: 0, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={90} />
                <Tooltip contentStyle={{ borderRadius: "12px" }} formatter={(v) => [`${v}/100`, "Điểm"]} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.score >= 90 ? "#10B981" : entry.score >= 85 ? "#3B82F6" : entry.score >= 80 ? "#F59E0B" : "#EF4444"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Selected branch detail metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">🔍 Chi tiết · {selectedBranch.name}</CardTitle>
          <p className="text-xs text-gray-500">{selectedBranch.address} · Quản lý: {selectedBranch.manager}</p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4 mb-4">
            {QUALITY_CRITERIA.map((c) => {
              const score = selectedBranch.quality[c.key];
              return (
                <div key={c.key} className={`p-4 rounded-xl border ${getScoreBg(score)}`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span style={{ color: c.color }}>{c.icon}</span>
                    <span className="text-xs font-medium text-gray-600">{c.label}</span>
                    <span className="text-xs text-gray-400 ml-auto">({c.weight})</span>
                  </div>
                  <div className={`text-3xl font-black mb-1 ${getScoreColor(score)}`}>{score}</div>
                  <Progress value={score} color={c.color} className="h-1.5" />
                </div>
              );
            })}
          </div>

          <div className="grid md:grid-cols-4 gap-3">
            {[
              { label: "Thời gian chờ TB", value: `${selectedBranch.quality.avgWaitingTime} phút`, icon: "⏱️", ok: selectedBranch.quality.avgWaitingTime <= 15 },
              { label: "Hài lòng KH", value: `${selectedBranch.quality.customerSatisfaction}/5 ⭐`, icon: "😊", ok: selectedBranch.quality.customerSatisfaction >= 4.0 },
              { label: "Đơn hàng tháng", value: selectedBranch.quality.totalOrders.toLocaleString("vi-VN"), icon: "📦", ok: true },
              { label: "Doanh thu MĐ", value: `${(selectedBranch.quality.monthlyRevenue / 1000000).toFixed(0)}M VND`, icon: "💰", ok: true },
            ].map((item) => (
              <div key={item.label} className={`p-3 rounded-xl border ${item.ok ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                <div className="text-xl mb-1">{item.icon}</div>
                <div className={`text-lg font-bold ${item.ok ? "text-green-700" : "text-red-700"}`}>{item.value}</div>
                <div className="text-xs text-gray-500">{item.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}
