"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, canAccess } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!user) {
      router.replace(`/employee/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!canAccess(pathname)) {
      if (user.role === "kitchen") router.replace("/kitchen/orders");
      else if (user.role === "supervisor") router.replace("/manager/shifts");
      else router.replace("/unauthorized");
    }
  }, [mounted, user, pathname, router, canAccess]);

  if (!mounted) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-[#E4002B] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!user || !canAccess(pathname)) return null;

  return <>{children}</>;
}
