// Client-side auth helpers — browser only, no server imports

export interface ClientUser {
  id: string;
  name: string;
  role: string;
  branch: string;
  employeeId: string;
}

const USER_COOKIE = "kfc-user";

export function readUserCookie(): ClientUser | null {
  if (typeof document === "undefined") return null;
  try {
    const match = document.cookie.match(/(?:^|;\s*)kfc-user=([^;]*)/);
    if (!match) return null;
    const u = JSON.parse(decodeURIComponent(match[1]));
    if (u?.id && u?.role) return u as ClientUser;
  } catch {}
  return null;
}

export function writeUserCookie(user: ClientUser): void {
  if (typeof document === "undefined") return;
  const maxAge = 60 * 60 * 24 * 7;
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${USER_COOKIE}=${encodeURIComponent(
    JSON.stringify(user)
  )}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

export function clearUserCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${USER_COOKIE}=; path=/; max-age=0`;
}

export async function logoutAndRedirect(to = "/"): Promise<void> {
  clearUserCookie();
  try {
    await fetch("/api/auth/logout", { method: "POST" });
  } catch {}
  window.location.href = to;
}

export const ROLE_AVATARS: Record<string, string> = {
  kitchen: "👨‍🍳",
  supervisor: "🎯",
  manager: "👔",
};

export const ROLE_LABELS: Record<string, string> = {
  kitchen: "Nhân viên bếp",
  supervisor: "Giám sát ca",
  manager: "Quản lý cửa hàng",
};

export const ROLE_REDIRECT: Record<string, string> = {
  kitchen: "/kitchen/orders",
  supervisor: "/manager/shifts",
  manager: "/manager/dashboard",
};
