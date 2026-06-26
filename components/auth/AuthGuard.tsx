"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore, useAuthHydrated } from "@/lib/store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, canAccess } = useAuthStore();
  const hydrated = useAuthHydrated();

  useEffect(() => {
    if (!hydrated) return;
    if (!user) {
      router.replace(`/employee/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!canAccess(pathname)) {
      if (user.role === "kitchen") router.replace("/kitchen/orders");
      else if (user.role === "supervisor") router.replace("/manager/shifts");
      else router.replace("/unauthorized");
    }
  }, [hydrated, user, pathname, router, canAccess]);

  if (!hydrated) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#E4002B] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user || !canAccess(pathname)) return null;

  return <>{children}</>;
}
