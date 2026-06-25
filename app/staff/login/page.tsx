"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, LogIn, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AUTH_ROLE_LABELS, AUTH_ROLE_AVATARS } from "@/lib/types";

const REDIRECT_MAP: Record<string, string> = {
  kitchen: "/kitchen/orders",
  supervisor: "/manager/shifts",
  manager: "/manager/dashboard",
};

const DEMO = [
  { id: "kitchen01",    pw: "123456", role: "kitchen" as const },
  { id: "supervisor01", pw: "123456", role: "supervisor" as const },
  { id: "manager01",    pw: "123456", role: "manager" as const },
];

export default function StaffLoginPage() {
  const { login, user } = useAuthStore();
  const router = useRouter();
  const [idOrEmail, setIdOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) router.replace(REDIRECT_MAP[user.role as string] ?? "/kitchen/orders");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!idOrEmail.trim() || !password.trim()) { setError("Vui lòng điền đầy đủ thông tin."); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 400));
    const result = login(idOrEmail.trim(), password);
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? "Mã nhân viên hoặc mật khẩu không đúng.");
    } else {
      toast.success("Đăng nhập thành công!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm space-y-4">
        <div className="text-center mb-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/kfc-logo.png" alt="KFC" className="w-16 h-16 mx-auto mb-3 rounded-full bg-white p-1 object-contain" />
          <h1 className="text-2xl font-black text-white">The New KFC</h1>
          <p className="text-gray-500 text-sm mt-1">Đăng nhập nhân viên</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-gray-900 rounded-2xl p-6 space-y-4 border border-gray-800">
          {error && (
            <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              className="bg-red-950/60 border border-red-800 text-red-300 rounded-xl px-4 py-3 text-sm"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Mã nhân viên</label>
            <Input
              value={idOrEmail}
              onChange={(e) => setIdOrEmail(e.target.value)}
              placeholder="VD: kitchen01"
              className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-600 h-11 rounded-xl focus:border-[#E4002B]"
              autoComplete="username"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Mật khẩu</label>
            <div className="relative">
              <Input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-600 h-11 rounded-xl pr-10 focus:border-[#E4002B]"
                autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full h-11 rounded-xl text-base" disabled={loading}>
            {loading
              ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Đang xác thực...</>
              : <><LogIn className="h-4 w-4 mr-2" />Đăng nhập</>
            }
          </Button>
        </form>

        {/* Demo quick-fill */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-3">Tài khoản demo (mật khẩu: 123456)</p>
          <div className="space-y-2">
            {DEMO.map((acc) => (
              <button key={acc.id} type="button"
                onClick={() => { setIdOrEmail(acc.id); setPassword(acc.pw); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors text-left"
              >
                <span className="text-xl">{AUTH_ROLE_AVATARS[acc.role]}</span>
                <div>
                  <div className="text-white text-xs font-bold">{AUTH_ROLE_LABELS[acc.role]}</div>
                  <div className="text-gray-500 text-xs font-mono">{acc.id}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
