import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatTime(minutes: number): string {
  if (minutes < 1) return "< 1 phút";
  if (minutes < 60) return `${Math.round(minutes)} phút`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}p` : `${hours} giờ`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatTimeAgo(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} giờ trước`;
  return formatDate(d);
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    queued: "Chờ xử lý",
    preparing: "Đang làm",
    quality_check: "Kiểm tra CL",
    ready: "Sẵn sàng",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
  };
  return labels[status] ?? status;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    queued: "bg-amber-100 text-amber-700 border-amber-200",
    preparing: "bg-blue-100 text-blue-700 border-blue-200",
    quality_check: "bg-purple-100 text-purple-700 border-purple-200",
    ready: "bg-green-100 text-green-700 border-green-200",
    completed: "bg-gray-100 text-gray-600 border-gray-200",
    cancelled: "bg-red-100 text-red-700 border-red-200",
  };
  return colors[status] ?? "bg-gray-100 text-gray-600";
}

export function getPriorityLabel(priority: string): string {
  const labels: Record<string, string> = {
    critical: "Khẩn cấp",
    high: "Cao",
    medium: "Trung bình",
    low: "Thấp",
  };
  return labels[priority] ?? priority;
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    critical: "bg-red-100 text-red-700 border-red-200",
    high: "bg-orange-100 text-orange-700 border-orange-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    low: "bg-green-100 text-green-700 border-green-200",
  };
  return colors[priority] ?? "bg-gray-100 text-gray-600";
}

export function calculatePriorityScore(
  waitingMinutes: number,
  orderSize: number,
  customerType: string,
  kitchenLoad: number
): number {
  let score = 0;
  score += Math.min(waitingMinutes * 2, 40);
  score += Math.min(orderSize * 3, 20);
  if (customerType === "vip") score += 15;
  if (customerType === "online") score += 10;
  score += Math.min(kitchenLoad / 5, 25);
  return Math.min(Math.round(score), 100);
}

export function getPriorityFromScore(score: number): "critical" | "high" | "medium" | "low" {
  if (score >= 75) return "critical";
  if (score >= 50) return "high";
  if (score >= 25) return "medium";
  return "low";
}

export function calculateQualityScore(
  foodQuality: number,
  service: number,
  cleanliness: number,
  sopCompliance: number
): number {
  return Math.round(foodQuality * 0.4 + service * 0.25 + cleanliness * 0.2 + sopCompliance * 0.15);
}

export function getScoreColor(score: number): string {
  if (score >= 90) return "text-green-600";
  if (score >= 75) return "text-blue-600";
  if (score >= 60) return "text-amber-600";
  return "text-red-600";
}

export function getScoreBg(score: number): string {
  if (score >= 90) return "bg-green-50 border-green-200";
  if (score >= 75) return "bg-blue-50 border-blue-200";
  if (score >= 60) return "bg-amber-50 border-amber-200";
  return "bg-red-50 border-red-200";
}

export function generateOrderId(): string {
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `#KFC${num}`;
}

export function getElapsedTime(createdAt: string): number {
  const created = new Date(createdAt);
  const now = new Date();
  return Math.floor((now.getTime() - created.getTime()) / 60000);
}

export function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
