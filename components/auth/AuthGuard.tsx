"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { readStoredAuthUser } from "@/lib/store";
import { ROLE_PERMISSIONS } from "@/lib/types";
import type { AuthRole } from "@/lib/types";

const Spinner = () => (
  <div className="min-h-screen bg-gray-950 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-[#E4002B] border-t-transparent rounded-full animate-spin" />
  </div>
);

function hasAccess(role: string, path: string): boolean {
  const allowed = ROLE_PERMISSIONS[role as AuthRole] ?? [];
  return allowed.some((prefix) => path === prefix || path.startsWith(prefix + "/"));
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const u = readStoredAuthUser();
    if (!u) {
      window.location.replace(`/staff/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!hasAccess(u.role, pathname)) {
      if (u.role === "kitchen") window.location.replace("/kitchen/orders");
      else if (u.role === "supervisor") window.location.replace("/manager/shifts");
      else if (u.role === "manager") window.location.replace("/manager/dashboard");
      else window.location.replace("/unauthorized");
      return;
    }
    setAuthReady(true);
  }, [pathname]);

  if (!authReady) return <Spinner />;
  return <>{children}</>;
}
