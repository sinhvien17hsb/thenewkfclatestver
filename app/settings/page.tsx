"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Settings, ChevronRight, LogIn, LogOut, Briefcase,
  Info, User, ShieldCheck, Globe
} from "lucide-react";
import { toast } from "sonner";
import { useAppStore } from "@/lib/store";
import { readUserCookie, logoutAndRedirect, ROLE_AVATARS, ROLE_LABELS } from "@/lib/auth-client";
import type { ClientUser } from "@/lib/auth-client";
import { AUTH_ROLE_COLORS } from "@/lib/types";
import type { AuthRole } from "@/lib/types";
import { translate } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";

const DASHBOARD_MAP: Record<string, string> = {
  kitchen: "/kitchen/orders",
  supervisor: "/manager/shifts",
  manager: "/manager/dashboard",
};

function SettingRow({
  icon: Icon, label, desc, onClick, href, right, danger,
}: {
  icon: React.ElementType; label: string; desc?: string;
  onClick?: () => void; href?: string; right?: React.ReactNode; danger?: boolean;
}) {
  const inner = (
    <div
      className={`flex items-center gap-3 px-4 py-3.5 bg-white hover:bg-gray-50 transition-colors cursor-pointer ${danger ? "hover:bg-red-50" : ""}`}
      onClick={onClick}
    >
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${danger ? "bg-red-100" : "bg-gray-100"}`}>
        <Icon className={`h-4 w-4 ${danger ? "text-red-500" : "text-gray-500"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-sm font-semibold ${danger ? "text-red-600" : "text-gray-800"}`}>{label}</div>
        {desc && <div className="text-xs text-gray-400 mt-0.5">{desc}</div>}
      </div>
      {right ?? <ChevronRight className="h-4 w-4 text-gray-300 flex-shrink-0" />}
    </div>
  );
  if (href) return <Link href={href}>{inner}</Link>;
  return inner;
}

export default function SettingsPage() {
  const { language, setLanguage } = useAppStore();
  const [user, setUser] = useState<ClientUser | null>(null);
  const tr = (key: Parameters<typeof translate>[0]) => translate(key, language);

  useEffect(() => {
    setUser(readUserCookie());
  }, []);

  const roleColor = user ? AUTH_ROLE_COLORS[user.role as AuthRole] : null;

  const handleLogout = async () => {
    toast.success(language === "vi" ? "Đã đăng xuất thành công." : "Signed out successfully.");
    await logoutAndRedirect("/");
  };

  const toggleLanguage = () => {
    const next: Lang = language === "vi" ? "en" : "vi";
    setLanguage(next);
    toast.success(next === "vi" ? "Đã chuyển sang Tiếng Việt" : "Switched to English");
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-24 md:pb-6">
      {/* Header */}
      <div className="bg-[#1A1A1A] text-white px-4 py-6">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <Settings className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black">{tr("settings_title")}</h1>
            <p className="text-xs text-gray-400">{tr("settings_subtitle")}</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">

        {/* Current mode card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className={`rounded-2xl overflow-hidden shadow-sm ${user ? "bg-[#1A1A1A]" : "bg-[#E4002B]"}`}
        >
          <div className="p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center text-3xl flex-shrink-0">
              {user ? ROLE_AVATARS[user.role] : "👤"}
            </div>
            <div className="flex-1">
              <div className="text-white font-black text-base">
                {user ? user.name : tr("settings_customer")}
              </div>
              {user ? (
                <div className={`inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${roleColor?.bg} ${roleColor?.text}`}>
                  <ShieldCheck className="h-3 w-3" />
                  {ROLE_LABELS[user.role]}
                </div>
              ) : (
                <div className="text-red-100 text-xs mt-0.5">{tr("settings_cust_mode")}</div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Work mode section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl overflow-hidden shadow-sm"
        >
          <div className="bg-gray-200/60 px-4 py-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" /> {tr("settings_work_mode")}
            </span>
          </div>

          {user ? (
            <>
              <SettingRow
                icon={ShieldCheck}
                label={tr("settings_dashboard")}
                desc={`${tr("settings_dashboard_d")} ${ROLE_LABELS[user.role]}`}
                href={DASHBOARD_MAP[user.role] ?? "/kitchen/orders"}
              />
              <div className="border-t border-gray-100" />
              <SettingRow
                icon={User}
                label={tr("settings_profile")}
                desc={tr("settings_profile_d")}
                href="/employee/profile"
              />
              <div className="border-t border-gray-100" />
              <SettingRow
                icon={LogOut}
                label={tr("settings_logout")}
                desc={tr("settings_logout_d")}
                onClick={handleLogout}
                danger
                right={null}
              />
            </>
          ) : (
            <div className="bg-white">
              <div className="px-4 py-3 text-sm text-gray-500 border-b border-gray-100">
                {tr("settings_using_as")}
              </div>
              <Link href="/employee/login">
                <div className="flex items-center gap-3 px-4 py-4 bg-gradient-to-r from-[#E4002B] to-[#BB0020] text-white hover:opacity-90 transition-opacity cursor-pointer">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    <LogIn className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm">{tr("settings_go_staff")}</div>
                    <div className="text-red-100 text-xs mt-0.5">{tr("settings_go_staff_d")}</div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-red-200" />
                </div>
              </Link>
              <Link href="/employee/register">
                <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-t border-gray-100">
                  <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm text-gray-800">{tr("settings_register")}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{tr("settings_register_d")}</div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-gray-300" />
                </div>
              </Link>
            </div>
          )}
        </motion.div>

        {/* General settings */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl overflow-hidden shadow-sm"
        >
          <div className="bg-gray-200/60 px-4 py-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" /> {tr("settings_general")}
            </span>
          </div>
          <SettingRow
            icon={Globe}
            label={tr("settings_language")}
            desc={language === "vi" ? "Tiếng Việt" : "English"}
            onClick={toggleLanguage}
            right={
              <div className="flex items-center gap-2">
                <div className="flex rounded-lg overflow-hidden border border-gray-200">
                  <button
                    onClick={(e) => { e.stopPropagation(); if (language !== "vi") toggleLanguage(); }}
                    className={`px-3 py-1 text-xs font-bold transition-colors ${language === "vi" ? "bg-[#E4002B] text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                  >
                    VI
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); if (language !== "en") toggleLanguage(); }}
                    className={`px-3 py-1 text-xs font-bold transition-colors ${language === "en" ? "bg-[#E4002B] text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
                  >
                    EN
                  </button>
                </div>
              </div>
            }
          />
        </motion.div>

        {/* About */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl overflow-hidden shadow-sm"
        >
          <div className="bg-gray-200/60 px-4 py-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" /> {tr("settings_about")}
            </span>
          </div>
          <div className="bg-white px-4 py-4 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/kfc-logo.png" alt="KFC" className="w-14 h-14 object-contain rounded-2xl bg-white mx-auto mb-3 shadow-md p-1" />
            <div className="font-black text-gray-900 text-base">The New KFC</div>
            <div className="text-xs text-gray-400 mt-1">{tr("settings_version")}</div>
            <div className="text-xs text-gray-400 mt-0.5">{tr("settings_copyright")}</div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
