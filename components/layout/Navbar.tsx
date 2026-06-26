"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell, ShoppingCart, Home, ChefHat, BarChart3,
  ClipboardList, Users, Clock, ShieldCheck, LineChart,
  LogOut, User, Settings, UtensilsCrossed, Package, MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { readUserCookie, logoutAndRedirect, ROLE_AVATARS, ROLE_LABELS, ROLE_REDIRECT } from "@/lib/auth-client";
import type { ClientUser } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { translate } from "@/lib/i18n";

const KITCHEN_NAV = [
  { href: "/kitchen/orders", label: "Đơn bếp", icon: ChefHat },
  { href: "/kitchen/sop", label: "Quy trình SOP", icon: ClipboardList },
];
const SUPERVISOR_NAV = [
  { href: "/kitchen/orders", label: "Đơn bếp", icon: ChefHat },
  { href: "/kitchen/sop", label: "SOP", icon: ClipboardList },
  { href: "/manager/shifts", label: "Ca làm việc", icon: Clock },
];
const MANAGER_NAV = [
  { href: "/manager/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/manager/menu", label: "Thực đơn", icon: UtensilsCrossed },
  { href: "/manager/quality", label: "Chất lượng", icon: ShieldCheck },
  { href: "/manager/employees", label: "Nhân viên", icon: Users },
  { href: "/manager/shifts", label: "Ca làm", icon: Clock },
  { href: "/manager/analytics", label: "Analytics", icon: LineChart },
  { href: "/manager/alerts", label: "Cảnh báo", icon: Bell },
];

export function Navbar() {
  const pathname = usePathname();
  const { cartItemCount, notificationCount, language } = useAppStore();
  const [user, setUser] = useState<ClientUser | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const count = cartItemCount();
  const tr = (key: Parameters<typeof translate>[0]) => translate(key, language);

  useEffect(() => {
    setUser(readUserCookie());
  }, []);

  const CUSTOMER_NAV = [
    { href: "/", label: tr("nav_home"), icon: Home },
    { href: "/customer/orders", label: tr("nav_orders"), icon: Package },
    { href: "/customer/feedback", label: tr("nav_feedback"), icon: MessageSquare },
  ];

  const navLinks = user
    ? user.role === "manager"
      ? MANAGER_NAV
      : user.role === "supervisor"
      ? SUPERVISOR_NAV
      : KITCHEN_NAV
    : CUSTOMER_NAV;

  const handleLogout = async () => {
    setProfileOpen(false);
    toast.success("Đã đăng xuất.");
    await logoutAndRedirect("/");
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname.startsWith(href + "/"));

  return (
    <header className="sticky top-0 z-50 w-full bg-[#1A1A1A] border-b border-white/10 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0 flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/kfc-logo.png" alt="KFC" className="w-10 h-10 object-contain rounded-full bg-white p-0.5" />
          <div>
            <div className="font-black text-white text-lg leading-none tracking-wide drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
              The New KFC
            </div>
            {user && (
              <div className="text-[10px] text-gray-400 leading-none mt-0.5">
                {user.branch.replace("KFC ", "")}
              </div>
            )}
          </div>
        </Link>

        {/* Nav Links - Desktop */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1 ml-6">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all",
                isActive(href)
                  ? "bg-[#E4002B] text-white"
                  : "text-gray-400 hover:text-white hover:bg-white/10"
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Link>
          ))}
          <Link
            href="/customer/menu"
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all ml-2 border",
              isActive("/customer/menu")
                ? "bg-[#E4002B] text-white border-[#E4002B]"
                : "border-[#E4002B] text-[#E4002B] hover:bg-[#E4002B] hover:text-white"
            )}
          >
            <UtensilsCrossed className="h-3.5 w-3.5" />
            {tr("nav_menu")}
          </Link>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <Link
            href="/settings"
            className={cn(
              "p-2 rounded-xl hover:bg-white/10 transition-colors",
              isActive("/settings") ? "bg-white/20" : ""
            )}
          >
            <Settings className="h-5 w-5 text-gray-300" />
          </Link>

          {!user && (
            <Link href="/customer/cart" className="relative p-2 rounded-xl hover:bg-white/10 transition-colors">
              <ShoppingCart className="h-5 w-5 text-gray-300" />
              {count > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-[#E4002B] text-white text-xs font-bold"
                >
                  {count}
                </motion.span>
              )}
            </Link>
          )}

          <button className="relative p-2 rounded-xl hover:bg-white/10 transition-colors">
            <Bell className="h-5 w-5 text-gray-300" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-[#E4002B] text-white text-xs font-bold">
                {notificationCount}
              </span>
            )}
          </button>

          {user && (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-xl hover:bg-white/10 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#E4002B] flex items-center justify-center text-lg flex-shrink-0">
                  {ROLE_AVATARS[user.role] ?? "👤"}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-white leading-none">
                    {user.name.split(" ").slice(-2).join(" ")}
                  </div>
                  <div className="text-[10px] leading-none mt-0.5 text-gray-400">
                    {ROLE_LABELS[user.role] ?? user.role}
                  </div>
                </div>
                <span className="text-gray-400 text-xs">▾</span>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
                  >
                    <div className="bg-[#1A1A1A] px-4 py-3">
                      <div className="text-sm font-bold text-white">{user.name}</div>
                      <div className="text-xs mt-0.5 text-gray-300">
                        {ROLE_LABELS[user.role] ?? user.role}
                      </div>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/employee/profile"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-sm text-gray-700"
                      >
                        <User className="h-4 w-4 text-gray-400" /> Hồ sơ cá nhân
                      </Link>
                      <Link
                        href={ROLE_REDIRECT[user.role] ?? "/"}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors text-sm text-gray-700"
                      >
                        <Settings className="h-4 w-4 text-gray-400" /> Dashboard của tôi
                      </Link>
                      <div className="border-t border-gray-100 my-1" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 transition-colors text-sm text-red-600"
                      >
                        <LogOut className="h-4 w-4" /> Đăng xuất
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#1A1A1A] border-t border-white/10 safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-2">
          <Link
            href="/customer/menu"
            className={cn(
              "flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all",
              isActive("/customer/menu") ? "text-[#E4002B]" : "text-gray-500"
            )}
          >
            <UtensilsCrossed className="h-5 w-5" />
            <span className="text-[10px] font-medium">{tr("nav_menu")}</span>
          </Link>
          {navLinks.slice(0, 3).map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all",
                isActive(href) ? "text-[#E4002B]" : "text-gray-500"
              )}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          ))}
          {user ? (
            <Link
              href="/employee/profile"
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all",
                pathname.startsWith("/employee/profile") ? "text-[#E4002B]" : "text-gray-500"
              )}
            >
              <div className="text-lg leading-none">{ROLE_AVATARS[user.role] ?? "👤"}</div>
              <span className="text-[10px] font-medium">Tôi</span>
            </Link>
          ) : (
            <Link
              href="/settings"
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1 rounded-xl transition-all",
                isActive("/settings") ? "text-[#E4002B]" : "text-gray-500"
              )}
            >
              <Settings className="h-5 w-5" />
              <span className="text-[10px] font-medium">Cài đặt</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
