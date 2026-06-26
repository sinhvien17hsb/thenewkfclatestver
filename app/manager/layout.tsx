"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3, Users, Package, LayoutDashboard, LogOut,
  UtensilsCrossed, Menu, X, Clock, ShieldCheck, Bell, LineChart
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore, useAuthHydrated } from "@/lib/store";

const NAV = [
  { href: "/manager/dashboard",  label: "Tổng quan",   icon: LayoutDashboard },
  { href: "/manager/menu",       label: "Thực đơn",    icon: UtensilsCrossed },
  { href: "/manager/quality",    label: "Chất lượng",  icon: ShieldCheck },
  { href: "/manager/analytics",  label: "Phân tích",   icon: BarChart3 },
  { href: "/manager/employees",  label: "Nhân viên",   icon: Users },
  { href: "/manager/shifts",     label: "Ca làm việc", icon: Clock },
  { href: "/manager/alerts",     label: "Cảnh báo",    icon: Bell },
  { href: "/manager/inventory",  label: "Kho hàng",    icon: Package },
  { href: "/manager/analytics",  label: "Báo cáo",     icon: LineChart },
];

const UNIQUE_NAV = NAV.filter((item, idx, arr) => arr.findIndex(n => n.href === item.href) === idx);

const Spinner = () => (
  <div className="min-h-screen bg-gray-950 flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-[#E4002B] border-t-transparent rounded-full animate-spin" />
  </div>
);

const LoginPrompt = () => (
  <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4">
    <p className="text-gray-400 text-sm">Vui lòng đăng nhập để tiếp tục.</p>
    <a href="/staff/login"
      className="px-5 py-2.5 bg-[#E4002B] text-white text-sm font-bold rounded-xl hover:bg-red-700 transition-colors"
    >
      Đăng nhập
    </a>
  </div>
);

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore(); // subscription for reactive re-renders
  const hydrated = useAuthHydrated();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Hard-navigate away if wrong role (kitchen/supervisor)
  useEffect(() => {
    if (!hydrated) return;
    const u = useAuthStore.getState().user;
    if (!u) return;
    if (u.role === "kitchen") { window.location.replace("/kitchen/orders"); return; }
    if (u.role === "supervisor" && !pathname.startsWith("/manager/shifts")) {
      window.location.replace("/manager/shifts");
    }
  }, [hydrated, pathname]);

  // Still waiting for hydration
  if (!hydrated) return <Spinner />;

  // Read live store value — avoids React snapshot lag on first render
  const currentUser = useAuthStore.getState().user ?? user;
  if (!currentUser) return <LoginPrompt />;

  // Wrong role: effect will hard-navigate, show spinner in the meantime
  if (currentUser.role === "kitchen") return <Spinner />;
  if (currentUser.role === "supervisor" && !pathname.startsWith("/manager/shifts")) return <Spinner />;

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={cn(
        "fixed top-0 left-0 h-full w-56 bg-gray-900 border-r border-gray-800 z-50 flex flex-col transition-transform duration-200",
        "md:translate-x-0 md:static md:z-auto",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/kfc-logo.png" alt="KFC" className="w-8 h-8 object-contain rounded-full bg-white p-0.5" />
            <div>
              <div className="font-black text-sm leading-none text-white">The New KFC</div>
              <div className="text-[10px] text-gray-400 leading-none mt-0.5">Branch Manager</div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-500 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {UNIQUE_NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive(href)
                  ? "bg-[#E4002B] text-white"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-800">
          <div className="flex items-center gap-2 px-2 py-1.5 mb-2">
            <div className="w-7 h-7 rounded-full bg-[#E4002B] flex items-center justify-center text-sm">
              {currentUser.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">{currentUser.name}</div>
              <div className="text-[10px] text-gray-500 truncate">{currentUser.branchName?.replace("KFC ", "")}</div>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden bg-gray-900 border-b border-gray-800 sticky top-0 z-30 px-4 h-14 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-gray-800 text-gray-400">
            <Menu className="h-5 w-5" />
          </button>
          <div className="font-black text-white">The New KFC</div>
          <div className="w-8" />
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
