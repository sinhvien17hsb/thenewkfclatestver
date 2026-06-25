"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, ChefHat } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AUTH_ROLE_LABELS } from "@/lib/types";

const REDIRECT_MAP: Record<string, string> = {
  kitchen: "/kitchen/orders",
  supervisor: "/manager/shifts",
  manager: "/manager/dashboard",
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const { login, user } = useAuthStore();
  const [idOrEmail, setIdOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      router.replace(redirect ?? REDIRECT_MAP[user.role] ?? "/");
    }
  }, [user, router, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!idOrEmail.trim() || !password.trim()) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    const result = login(idOrEmail.trim(), password);
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? "Đăng nhập thất bại.");
    } else {
      toast.success("Đăng nhập thành công! Chào mừng trở lại.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* KFC Header */}
      <div className="bg-[#1A1A1A] text-white">
        <div className="max-w-md mx-auto px-6 py-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/kfc-logo.png" alt="KFC" className="w-12 h-12 object-contain rounded-full bg-white p-1" />
            <div>
              <div className="font-black text-2xl tracking-wide text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">KFC SYNC</div>
              <div className="text-xs text-gray-400">Branch Manager Portal</div>
            </div>
          </div>
        </div>
      </div>

      {/* Form card */}
      <div className="flex-1 flex items-start justify-center px-4 -mt-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-[#E4002B] px-6 py-4">
              <div className="flex items-center gap-2 text-white">
                <LogIn className="h-5 w-5" />
                <span className="font-bold text-lg">Đăng nhập nhân viên</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">
                  Mã nhân viên hoặc Email
                </label>
                <Input
                  value={idOrEmail}
                  onChange={(e) => setIdOrEmail(e.target.value)}
                  placeholder="VD: kitchen01 hoặc kitchen01@kfc.vn"
                  autoComplete="username"
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Mật khẩu</label>
                <div className="relative">
                  <Input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    autoComplete="current-password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 accent-[#E4002B]"
                  />
                  <span className="text-sm text-gray-600">Ghi nhớ đăng nhập</span>
                </label>
                <button
                  type="button"
                  onClick={() => toast.info("Vui lòng liên hệ quản lý để đặt lại mật khẩu.")}
                  className="text-sm text-[#E4002B] hover:underline"
                >
                  Quên mật khẩu?
                </button>
              </div>

              <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang xác thực...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="h-4 w-4" /> Đăng nhập
                  </span>
                )}
              </Button>

              <div className="text-center text-sm text-gray-500">
                Chưa có tài khoản?{" "}
                <Link href="/employee/register" className="text-[#E4002B] font-semibold hover:underline">
                  Đăng ký ngay
                </Link>
              </div>
            </form>
          </div>

          {/* Demo accounts */}
          <div className="mt-4 bg-white rounded-2xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
              <ChefHat className="h-4 w-4 text-gray-400" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Tài khoản demo</span>
            </div>
            <div className="space-y-2">
              {(
                [
                  { id: "kitchen01", role: "kitchen", label: AUTH_ROLE_LABELS["kitchen"] },
                  { id: "supervisor01", role: "supervisor", label: AUTH_ROLE_LABELS["supervisor"] },
                  { id: "manager01", role: "manager", label: AUTH_ROLE_LABELS["manager"] },
                ] as const
              ).map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => {
                    setIdOrEmail(acc.id);
                    setPassword("123456");
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                >
                  <span className="text-xs font-semibold text-gray-700">{acc.label}</span>
                  <span className="text-xs text-gray-400 font-mono">{acc.id} / 123456</span>
                </button>
              ))}
            </div>
          </div>

          <div className="text-center mt-4">
            <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">
              ← Quay lại trang khách hàng
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#E4002B] border-t-transparent rounded-full animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
