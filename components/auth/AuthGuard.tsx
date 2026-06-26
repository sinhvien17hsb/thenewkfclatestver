"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore, useAuthHydrated } from "@/lib/store";

const Spinner = () => (
  <div className="min-h-screen bg-gray-950 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-[#E4002B] border-t-transparent rounded-full animate-spin" />
  </div>
);

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { canAccess } = useAuthStore();
  const hydrated = useAuthHydrated();
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    const u = useAuthStore.getState().user;
    if (!u) {
      router.replace(`/staff/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!canAccess(pathname)) {
      if (u.role === "kitchen") router.replace("/kitchen/orders");
      else if (u.role === "supervisor") router.replace("/manager/shifts");
      else router.replace("/unauthorized");
      return;
    }
    setAuthReady(true);
  }, [hydrated, pathname, router, canAccess]);

  if (!authReady) return <Spinner />;
  return <>{children}</>;
}
