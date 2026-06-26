"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore, useAuthHydrated } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AUTH_ROLE_LABELS, AUTH_ROLE_AVATARS } from "@/lib/types";

const REDIRECT_MAP: Record<string, string> = {
  kitchen: "/kitchen/orders",
  supervisor: "/manager/shifts",
  manager: "/manager/dashboard",
};

const DEMO = [
  { id: "kitchen01",    pw: "123456", role: "kitchen"    as const },
  { id: "supervisor01", pw: "123456", role: "supervisor" as const },
  { id: "manager01",    pw: "123456", role: "manager"    as const },
];

export default function StaffLoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const hydrated = useAuthHydrated();
  const [idOrEmail, setIdOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // If already logged in, go straight to dashboard (breaks redirect loops)
  useEffect(() => {
    if (!hydrated) return;
    const u = useAuthStore.getState().user;
    if (u) router.replace(REDIRECT_MAP[u.role] ?? "/kitchen/orders");
  }, [hydrated, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!idOrEmail.trim() || !password.trim()) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    setLoading(true);
    const result = login(idOrEmail.trim(), password);
    if (!result.success) {
      setLoading(false);
      setError(result.error ?? "Mã nhân viên hoặc mật khẩu không đúng.");
      return;
    }
    toast.success("Đăng nhập thành công!");
    const user = useAuthStore.getState().user;
    router.replace(REDIRECT_MAP[user?.role ?? ""] ?? "/kitchen/orders");
  };

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4 flex items-center justify-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/kfc-logo.png" alt="KFC" className="w-12 h-12 object-contain rounded-xl bg-white mx-auto mb-3 p-0.5" />
          <h1 className="text-xl font-black text-white">Đăng nhập</h1>
          <p className="text-gray-500 text-sm mt-1">KFC Sync · Nhân viên</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              className="bg-red-900/30 border border-red-800 text-red-300 rounded-xl px-4 py-3 text-sm"
            >
              {error}
            </motion.div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">Mã nhân viên</label>
            <Input
              value={idOrEmail}
              onChange={(e) => setIdOrEmail(e.target.value)}
              placeholder="VD: kitchen01"
              autoComplete="username"
              className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-600 rounded-xl h-10 focus:border-[#E4002B]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">Mật khẩu</label>
            <div className="relative">
              <Input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                autoComplete="current-password"
                className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-600 rounded-xl h-10 pr-10 focus:border-[#E4002B]"
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full h-11 rounded-xl" disabled={loading}>
            {loading
              ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Đang xác thực...</>
              : <><LogIn className="h-4 w-4 mr-2" />Đăng nhập</>
            }
          </Button>
        </form>

        {/* Demo accounts */}
        <div className="mt-4 space-y-1.5">
          <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide text-center mb-2">Tài khoản demo · mật khẩu: 123456</p>
          {DEMO.map((acc) => (
            <button key={acc.id} type="button"
              onClick={() => { setIdOrEmail(acc.id); setPassword(acc.pw); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 transition-all text-left"
            >
              <span className="text-lg">{AUTH_ROLE_AVATARS[acc.role]}</span>
              <div>
                <div className="text-white text-xs font-bold">{AUTH_ROLE_LABELS[acc.role]}</div>
                <div className="text-gray-500 text-xs font-mono">{acc.id}</div>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-sm text-gray-600 mt-5">
          Chưa có tài khoản?{" "}
          <Link href="/staff/register" className="text-[#E4002B] font-semibold hover:underline">Đăng ký</Link>
        </p>
      </motion.div>
    </div>
  );
}
