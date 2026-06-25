"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChefHat, Bell, BarChart3, Menu, LogOut, User } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useStaffAuth } from "@/lib/hooks";

const NAV = [
  { href: "/staff/kitchen", label: "Bếp", icon: ChefHat },
  { href: "/staff/service-requests", label: "Yêu cầu", icon: Bell },
  { href: "/manager/dashboard", label: "Báo cáo", icon: BarChart3, managerOnly: true },
];

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useStaffAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/staff/login");
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top bar */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#E4002B] flex items-center justify-center font-black text-sm">K</div>
            <div>
              <div className="font-black text-sm leading-none">The New KFC</div>
              {user && <div className="text-[10px] text-gray-400 leading-none mt-0.5">{user.branch}</div>}
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV.filter((n) => !n.managerOnly || user?.role === "MANAGER").map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                  isActive(href) ? "bg-[#E4002B] text-white" : "text-gray-400 hover:text-white hover:bg-gray-800"
                )}
              >
                <Icon className="h-4 w-4" /> {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {user && (
              <div className="hidden md:flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300 font-medium">{user.name}</span>
                <span className="text-xs bg-gray-800 px-2 py-0.5 rounded-full text-gray-400">
                  {user.role === "MANAGER" ? "Quản lý" : user.role === "CASHIER" ? "Thu ngân" : "Bếp"}
                </span>
              </div>
            )}
            <button onClick={handleLogout} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-red-400 transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
            <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-lg hover:bg-gray-800 text-gray-400">
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-gray-900 border-t border-gray-800 px-4 py-2 space-y-1">
            {NAV.filter((n) => !n.managerOnly || user?.role === "MANAGER").map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)}
                className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm", isActive(href) ? "bg-[#E4002B] text-white" : "text-gray-400")}
              >
                <Icon className="h-4 w-4" /> {label}
              </Link>
            ))}
          </div>
        )}
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto">{children}</main>

      {/* Mobile bottom nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 z-50">
        <div className="flex items-center justify-around px-2 py-2">
          {NAV.filter((n) => !n.managerOnly || user?.role === "MANAGER").map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href}
              className={cn("flex flex-col items-center gap-0.5 px-4 py-1 rounded-xl", isActive(href) ? "text-[#E4002B]" : "text-gray-500")}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
