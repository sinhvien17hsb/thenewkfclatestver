"use client";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, canAccess } = useAuthStore();

  useEffect(() => {
    if (!user) {
      router.replace(`/employee/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!canAccess(pathname)) {
      router.replace("/unauthorized");
    }
  }, [user, pathname, router, canAccess]);

  if (!user || !canAccess(pathname)) return null;

  return <>{children}</>;
}
