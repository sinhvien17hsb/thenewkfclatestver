import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none",
  {
    variants: {
      variant: {
        default: "border-transparent bg-[#E4002B] text-white",
        secondary: "border-transparent bg-gray-100 text-gray-700",
        outline: "border-gray-300 text-gray-700 bg-transparent",
        destructive: "border-transparent bg-red-100 text-red-700",
        success: "border-transparent bg-green-100 text-green-700",
        warning: "border-transparent bg-amber-100 text-amber-700",
        info: "border-transparent bg-blue-100 text-blue-700",
        purple: "border-transparent bg-purple-100 text-purple-700",
        // Status variants
        queued: "border-amber-200 bg-amber-50 text-amber-700",
        preparing: "border-blue-200 bg-blue-50 text-blue-700",
        quality_check: "border-purple-200 bg-purple-50 text-purple-700",
        ready: "border-green-200 bg-green-50 text-green-700",
        completed: "border-gray-200 bg-gray-50 text-gray-600",
        cancelled: "border-red-200 bg-red-50 text-red-700",
        // Priority variants
        critical: "border-red-200 bg-red-50 text-red-700",
        high: "border-orange-200 bg-orange-50 text-orange-700",
        medium: "border-yellow-200 bg-yellow-50 text-yellow-700",
        low: "border-green-200 bg-green-50 text-green-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
