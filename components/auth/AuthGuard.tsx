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

  // Wait for Zustand to rehydrate from localStorage before checking auth
  if (!mounted) return null;

  if (!user) {
    router.replace(`/employee/login?redirect=${encodeURIComponent(pathname)}`);
    return null;
  }

  if (!canAccess(pathname)) {
    if (user.role === "kitchen") { router.replace("/kitchen/orders"); return null; }
    if (user.role === "supervisor") { router.replace("/manager/shifts"); return null; }
    router.replace("/unauthorized");
    return null;
  }

  return <>{children}</>;
}
