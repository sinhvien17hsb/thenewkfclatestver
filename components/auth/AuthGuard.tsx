"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuthStore, readStoredAuthUser } from "@/lib/store";

const Spinner = () => (
  <div className="min-h-screen bg-gray-950 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-[#E4002B] border-t-transparent rounded-full animate-spin" />
  </div>
);

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { canAccess } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const u = readStoredAuthUser();
    if (!u) {
      window.location.replace(`/staff/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!canAccess(pathname)) {
      if (u.role === "kitchen") window.location.replace("/kitchen/orders");
      else if (u.role === "supervisor") window.location.replace("/manager/shifts");
      else window.location.replace("/unauthorized");
      return;
    }
    setAuthReady(true);
    setMounted(true);
  }, [pathname, canAccess]);

  if (!mounted || !authReady) return <Spinner />;
  return <>{children}</>;
}
