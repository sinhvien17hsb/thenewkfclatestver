"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Settings, ChevronRight, LogIn, LogOut, Briefcase,
  Info, User, ShieldCheck, Globe
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store";
import { AUTH_ROLE_LABELS, AUTH_ROLE_AVATARS, AUTH_ROLE_COLORS } from "@/lib/types";

const DASHBOARD_MAP: Record<string, string> = {
  kitchen: "/kitchen/orders",
  supervisor: "/manager/shifts",
  manager: "/manager/dashboard",
};

function SettingRow({
  icon: Icon,
  label,
  desc,
  onClick,
  href,
  right,
  danger,
}: {
  icon: React.ElementType;
  label: string;
  desc?: string;
  onClick?: () => void;
  href?: string;
  right?: React.ReactNode;
  danger?: boolean;
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
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const roleColor = user ? AUTH_ROLE_COLORS[user.role] : null;

  const handleLogout = () => {
    logout();
    toast.success("Đã đăng xuất thành công.");
    router.push("/");
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
            <h1 className="text-lg font-black">Cài đặt</h1>
            <p className="text-xs text-gray-400">Tùy chỉnh ứng dụng</p>
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
              {user ? AUTH_ROLE_AVATARS[user.role] : "👤"}
            </div>
            <div className="flex-1">
              <div className="text-white font-black text-base">
                {user ? user.name : "Khách hàng"}
              </div>
              {user ? (
                <div className={`inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${roleColor?.bg} ${roleColor?.text}`}>
                  <ShieldCheck className="h-3 w-3" />
                  {AUTH_ROLE_LABELS[user.role]}
                </div>
              ) : (
                <div className="text-red-100 text-xs mt-0.5">Chế độ khách hàng</div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Worker mode section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl overflow-hidden shadow-sm"
        >
          <div className="bg-gray-200/60 px-4 py-2">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5" /> Chế độ làm việc
            </span>
          </div>

          {user ? (
            <>
              <SettingRow
                icon={ShieldCheck}
                label="Dashboard nhân viên"
                desc={`Vào trang làm việc của ${AUTH_ROLE_LABELS[user.role]}`}
                href={DASHBOARD_MAP[user.role] ?? "/kitchen/orders"}
              />
              <div className="border-t border-gray-100" />
              <SettingRow
                icon={User}
                label="Hồ sơ cá nhân"
                desc="Xem và chỉnh sửa thông tin tài khoản"
                href="/employee/profile"
              />
              <div className="border-t border-gray-100" />
              <SettingRow
                icon={LogOut}
                label="Đăng xuất khỏi hệ thống"
                desc="Chuyển về chế độ khách hàng"
                onClick={handleLogout}
                danger
                right={null}
              />
            </>
          ) : (
            <div className="bg-white">
              <div className="px-4 py-3 text-sm text-gray-500 border-b border-gray-100">
                Bạn đang sử dụng ứng dụng với tư cách khách hàng.
              </div>
              <Link href="/employee/login">
                <div className="flex items-center gap-3 px-4 py-4 bg-gradient-to-r from-[#E4002B] to-[#BB0020] text-white hover:opacity-90 transition-opacity cursor-pointer">
                  <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                    <LogIn className="h-4.5 w-4.5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm">Chuyển sang chế độ nhân viên</div>
                    <div className="text-red-100 text-xs mt-0.5">Dành cho nhân viên KFC có tài khoản</div>
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
                    <div className="font-semibold text-sm text-gray-800">Đăng ký tài khoản nhân viên</div>
                    <div className="text-xs text-gray-400 mt-0.5">Tạo tài khoản mới với mã cửa hàng</div>
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
              <Globe className="h-3.5 w-3.5" /> Chung
            </span>
          </div>
          <SettingRow
            icon={Globe}
            label="Ngôn ngữ"
            desc="Tiếng Việt"
            right={<span className="text-xs text-gray-400 font-medium">VI</span>}
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
              <Info className="h-3.5 w-3.5" /> Về ứng dụng
            </span>
          </div>
          <div className="bg-white px-4 py-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-[#E4002B] flex items-center justify-center mx-auto mb-3 shadow-md">
              <span className="text-white font-black text-2xl">K</span>
            </div>
            <div className="font-black text-gray-900 text-base">KFC SYNC</div>
            <div className="text-xs text-gray-400 mt-1">Phiên bản 1.0.0</div>
            <div className="text-xs text-gray-400 mt-0.5">© 2025 KFC Vietnam · Nhóm 17</div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
