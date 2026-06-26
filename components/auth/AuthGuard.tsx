"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { readUserCookie } from "@/lib/auth-client";
import type { ClientUser } from "@/lib/auth-client";
import { ROLE_PERMISSIONS } from "@/lib/types";
import type { AuthRole } from "@/lib/types";

const Spinner = () => (
  <div className="min-h-screen bg-gray-950 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-[#E4002B] border-t-transparent rounded-full animate-spin" />
  </div>
);

function hasAccess(role: string, path: string): boolean {
  const allowed = ROLE_PERMISSIONS[role as AuthRole] ?? [];
  return allowed.some(
    (prefix) => path === prefix || path.startsWith(prefix + "/")
  );
}

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  // undefined = loading, null = not authenticated, object = authenticated
  const [user, setUser] = useState<ClientUser | null | undefined>(undefined);

  useEffect(() => {
    const local = readUserCookie();
    if (local) {
      setUser(local);
      return;
    }
    // Fallback: verify via API (handles cookie-user missing but JWT valid)
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setUser(data?.user ?? null);
      })
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (user === undefined) return;
    if (!user) {
      router.replace(`/staff/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }
    if (!hasAccess(user.role, pathname)) {
      const fallback =
        user.role === "kitchen" ? "/kitchen/orders"
        : user.role === "supervisor" ? "/manager/shifts"
        : user.role === "manager" ? "/manager/dashboard"
        : "/unauthorized";
      router.replace(fallback);
    }
  }, [user, pathname, router]);

  if (user === undefined) return <Spinner />;
  if (!user) return <Spinner />;
  if (!hasAccess(user.role, pathname)) return <Spinner />;
  return <>{children}</>;
}
