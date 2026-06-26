"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore, readStoredAuthUser } from "@/lib/store";
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
  const router = useRouter();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    // After soft navigation: Zustand store has user in memory.
    // After hard navigation: read from cookie / localStorage.
    const u = useAuthStore.getState().user ?? readStoredAuthUser();
    if (!u) {
      router.replace(`/staff/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!hasAccess(u.role, pathname)) {
      if (u.role === "kitchen") router.replace("/kitchen/orders");
      else if (u.role === "supervisor") router.replace("/manager/shifts");
      else if (u.role === "manager") router.replace("/manager/dashboard");
      else router.replace("/unauthorized");
      return;
    }
    setAuthReady(true);
  }, [pathname, router]);

  if (!authReady) return <Spinner />;
  return <>{children}</>;
}
