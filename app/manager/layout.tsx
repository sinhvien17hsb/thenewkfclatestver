"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Users, Package, LayoutDashboard, LogOut, User, UtensilsCrossed, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useStaffAuth } from "@/lib/hooks";

const NAV = [
  { href: "/manager/dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { href: "/manager/analytics", label: "Phân tích", icon: BarChart3 },
  { href: "/manager/menu", label: "Thực đơn", icon: UtensilsCrossed },
  { href: "/manager/inventory", label: "Kho hàng", icon: Package },
  { href: "/manager/employees", label: "Nhân viên", icon: Users },
];

export default function ManagerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useStaffAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/staff/login");
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
            <div className="w-8 h-8 rounded-lg bg-[#E4002B] flex items-center justify-center font-black text-sm">K</div>
            <div>
              <div className="font-black text-sm leading-none">KFC Sync</div>
              <div className="text-[10px] text-gray-400 leading-none mt-0.5">Manager</div>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-500 hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive(href) ? "bg-[#E4002B] text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          ))}

          <div className="pt-2 border-t border-gray-800 mt-2">
            <Link href="/staff/kitchen" onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800"
            >
              <UtensilsCrossed className="h-4 w-4" />
              Màn hình bếp
            </Link>
          </div>
        </nav>

        <div className="p-3 border-t border-gray-800">
          {user && (
            <div className="flex items-center gap-2 px-2 py-1.5 mb-2">
              <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center">
                <User className="h-3.5 w-3.5 text-gray-300" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-white truncate">{user.name}</div>
                <div className="text-[10px] text-gray-500 truncate">{user.branch}</div>
              </div>
            </div>
          )}
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
          <div className="font-black text-white">KFC Manager</div>
          <div className="w-8" />
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
