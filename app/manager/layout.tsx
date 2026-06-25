"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) {
      router.replace("/employee/login?redirect=" + encodeURIComponent(pathname));
      return;
    }
    if (user.role === "kitchen") {
      router.replace("/kitchen/orders");
      return;
    }
    // supervisor can only access /manager/shifts
    if (user.role === "supervisor" && !pathname.startsWith("/manager/shifts")) {
      router.replace("/manager/shifts");
    }
  }, [user, pathname, router]);

  // Block render until auth is confirmed
  if (!user) return null;
  if (user.role === "kitchen") return null;
  if (user.role === "supervisor" && !pathname.startsWith("/manager/shifts")) return null;

  return <>{children}</>;
}
