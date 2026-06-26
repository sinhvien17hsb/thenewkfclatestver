"use client";
import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { writeUserCookie, ROLE_AVATARS, ROLE_LABELS, ROLE_REDIRECT } from "@/lib/auth-client";
import type { ClientUser } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DEMO = [
  { id: "kitchen01",    pw: "123456", role: "kitchen"    },
  { id: "supervisor01", pw: "123456", role: "supervisor" },
  { id: "manager01",    pw: "123456", role: "manager"    },
] as const;

function LoginContent() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const [idOrEmail, setIdOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // If already authenticated, skip the login page
  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)kfc-staff-token=([^;]*)/);
    if (match) {
      const dest = redirect ?? "/";
      window.location.href = dest;
    }
  }, [redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!idOrEmail.trim() || !password.trim()) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: idOrEmail.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Đăng nhập thất bại.");
        setLoading(false);
        return;
      }
      writeUserCookie(data.user as ClientUser);
      toast.success("Đăng nhập thành công!");
      const dest = redirect ?? ROLE_REDIRECT[data.user.role] ?? "/kitchen/orders";
      window.location.href = dest;
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
      setLoading(false);
    }
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
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-900/30 border border-red-800 text-red-300 rounded-xl px-4 py-3 text-sm"
            >
              {error}
            </motion.div>
          )}

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">
              Mã nhân viên
            </label>
            <Input
              value={idOrEmail}
              onChange={(e) => setIdOrEmail(e.target.value)}
              placeholder="VD: kitchen01"
              autoComplete="username"
              className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-600 rounded-xl h-10 focus:border-[#E4002B]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">
              Mật khẩu
            </label>
            <div className="relative">
              <Input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                autoComplete="current-password"
                className="bg-gray-900 border-gray-800 text-white placeholder:text-gray-600 rounded-xl h-10 pr-10 focus:border-[#E4002B]"
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full h-11 rounded-xl" disabled={loading}>
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin mr-2" />Đang đăng nhập...</>
            ) : (
              <><LogIn className="h-4 w-4 mr-2" />Đăng nhập</>
            )}
          </Button>
        </form>

        <div className="mt-4 space-y-1.5">
          <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide text-center mb-2">
            Tài khoản demo · mật khẩu: 123456
          </p>
          {DEMO.map((acc) => (
            <button
              key={acc.id}
              type="button"
              onClick={() => { setIdOrEmail(acc.id); setPassword(acc.pw); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 transition-all text-left"
            >
              <span className="text-lg">{ROLE_AVATARS[acc.role]}</span>
              <div>
                <div className="text-white text-xs font-bold">{ROLE_LABELS[acc.role]}</div>
                <div className="text-gray-500 text-xs font-mono">{acc.id}</div>
              </div>
            </button>
          ))}
        </div>

        <p className="text-center text-sm text-gray-600 mt-5">
          Chưa có tài khoản?{" "}
          <Link href="/employee/register" className="text-[#E4002B] font-semibold hover:underline">
            Đăng ký
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-[#E4002B] border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
