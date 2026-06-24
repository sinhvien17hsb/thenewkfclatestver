"use client";
import { useState } from "react";
import { ChevronDown, User, ChefHat, Shield, BarChart3, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/lib/store";
import type { UserRole } from "@/lib/types";
import { USER_ROLES } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const roleIcons: Record<UserRole, React.ReactNode> = {
  customer: <User className="h-4 w-4" />,
  kitchen: <ChefHat className="h-4 w-4" />,
  supervisor: <Shield className="h-4 w-4" />,
  manager: <BarChart3 className="h-4 w-4" />,
};

const roleRoutes: Record<UserRole, string> = {
  customer: "/customer/menu",
  kitchen: "/kitchen/orders",
  supervisor: "/kitchen/orders",
  manager: "/manager/dashboard",
};

const roleColors: Record<UserRole, string> = {
  customer: "bg-red-50 border-red-200 text-[#E4002B]",
  kitchen: "bg-orange-50 border-orange-200 text-orange-600",
  supervisor: "bg-purple-50 border-purple-200 text-purple-600",
  manager: "bg-green-50 border-green-200 text-green-600",
};

export function RoleSwitcher() {
  const { role, setRole } = useAppStore();
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    setOpen(false);
    router.push(roleRoutes[newRole]);
  };

  const currentRole = USER_ROLES[role];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl border-2 font-semibold text-sm transition-all",
          roleColors[role]
        )}
      >
        {roleIcons[role]}
        <span className="hidden sm:block">{currentRole.labelVi}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-12 z-50 w-64 rounded-2xl border border-gray-200 bg-white shadow-xl overflow-hidden"
            >
              <div className="p-2">
                <p className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Chuyển vai trò
                </p>
                {(Object.keys(USER_ROLES) as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => handleRoleChange(r)}
                    className={cn(
                      "w-full flex items-start gap-3 px-3 py-3 rounded-xl text-left transition-all hover:bg-gray-50",
                      r === role && "bg-red-50"
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 p-1.5 rounded-lg",
                        r === role ? "bg-[#E4002B] text-white" : "bg-gray-100 text-gray-500"
                      )}
                    >
                      {roleIcons[r]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-sm text-gray-900">
                          {USER_ROLES[r].labelVi}
                        </span>
                        {r === role && (
                          <Check className="h-4 w-4 text-[#E4002B]" />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 leading-tight">
                        {USER_ROLES[r].description}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
