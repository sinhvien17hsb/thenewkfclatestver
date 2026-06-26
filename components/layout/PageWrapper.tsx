"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "7xl" | "full";
}

export function PageWrapper({ children, className, maxWidth = "7xl" }: PageWrapperProps) {
  const maxWidthClass = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "7xl": "max-w-7xl",
    full: "max-w-full",
  }[maxWidth];

  return (
    <motion.main
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn(
        "min-h-[calc(100vh-4rem)] pb-20 md:pb-6",
        className
      )}
    >
      <div className={cn("mx-auto px-4 py-6", maxWidthClass)}>
        {children}
      </div>
    </motion.main>
  );
}

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  badge?: React.ReactNode;
  dark?: boolean;
}

export function PageHeader({ title, description, icon, actions, badge, dark }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div className="flex items-center gap-3">
        {icon && (
          <div className="p-2.5 rounded-xl bg-[#E4002B]/10 text-[#E4002B]">
            {icon}
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <h1 className={`text-2xl font-bold ${dark ? "text-white" : "text-gray-900"}`}>{title}</h1>
            {badge}
          </div>
          {description && (
            <p className={`text-sm mt-0.5 ${dark ? "text-gray-400" : "text-gray-500"}`}>{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: { value: number; label: string };
  color?: "red" | "blue" | "green" | "amber" | "purple";
  className?: string;
}

export function KPICard({ title, value, subtitle, icon, trend, color = "red", className }: KPICardProps) {
  const colorMap = {
    red: { bg: "bg-red-50", icon: "bg-[#E4002B] text-white", text: "text-[#E4002B]" },
    blue: { bg: "bg-blue-50", icon: "bg-blue-600 text-white", text: "text-blue-600" },
    green: { bg: "bg-green-50", icon: "bg-green-600 text-white", text: "text-green-600" },
    amber: { bg: "bg-amber-50", icon: "bg-amber-500 text-white", text: "text-amber-600" },
    purple: { bg: "bg-purple-50", icon: "bg-purple-600 text-white", text: "text-purple-600" },
  };
  const c = colorMap[color];

  return (
    <div className={cn("bg-white rounded-xl border border-gray-200 p-5 shadow-sm", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className={cn("text-3xl font-bold mt-1", c.text)}>{value}</p>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          {trend && (
            <div className={cn("flex items-center gap-1 mt-2 text-xs font-medium", trend.value >= 0 ? "text-green-600" : "text-red-600")}>
              <span>{trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}%</span>
              <span className="text-gray-400">{trend.label}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={cn("p-3 rounded-xl", c.icon)}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
