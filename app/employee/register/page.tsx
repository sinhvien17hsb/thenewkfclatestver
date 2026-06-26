"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, EyeOff, UserPlus, CheckCircle, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { writeUserCookie, ROLE_REDIRECT } from "@/lib/auth-client";
import type { ClientUser } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BRANCH_OPTIONS, STORE_ACCESS_CODE, AUTH_ROLE_LABELS, AUTH_ROLE_AVATARS } from "@/lib/types";
import type { AuthRole } from "@/lib/types";

const REDIRECT_MAP: Record<string, string> = {
  kitchen: "/kitchen/orders",
  supervisor: "/manager/shifts",
  manager: "/manager/dashboard",
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    employeeId: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "" as AuthRole | "",
    branchId: "",
    branchName: "",
    storeCode: "",
  });
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const set = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Vui lòng nhập họ tên.";
    if (!form.employeeId.trim()) e.employeeId = "Vui lòng nhập mã nhân viên.";
    if (form.password.length < 6) e.password = "Mật khẩu tối thiểu 6 ký tự.";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Mật khẩu xác nhận không khớp.";
    if (!form.role) e.role = "Vui lòng chọn chức vụ.";
    if (!form.branchId) e.branchId = "Vui lòng chọn chi nhánh.";
    if (form.storeCode !== STORE_ACCESS_CODE) e.storeCode = "Mã xác thực cửa hàng không hợp lệ.";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      // Map lowercase role to API role names
      const roleMap: Record<string, string> = {
        kitchen: "KITCHEN",
        supervisor: "CASHIER",
        manager: "MANAGER",
      };
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          employeeId: form.employeeId.trim(),
          branch: form.branchName,
          role: roleMap[form.role as string] ?? "KITCHEN",
          password: form.password,
          confirmPassword: form.confirmPassword,
          storeCode: form.storeCode,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Đăng ký thất bại.");

      // Write display cookie
      const user: ClientUser = {
        id: data.user.id,
        name: data.user.name,
        role: (data.user.role as string).toLowerCase(),
        branch: data.user.branch,
        employeeId: data.user.employeeId ?? form.employeeId.trim(),
      };
      writeUserCookie(user);
      toast.success("Tạo tài khoản thành công!");
      setSuccess(true);
      setTimeout(() => {
        window.location.href = ROLE_REDIRECT[user.role] ?? REDIRECT_MAP[form.role as string] ?? "/staff/kitchen";
      }, 1500);
    } catch (err: unknown) {
      setErrors({ submit: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center p-8"
        >
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">Đăng ký thành công!</h2>
          <p className="text-gray-500">Đang chuyển hướng đến dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-[#1A1A1A] text-white">
        <div className="max-w-lg mx-auto px-6 py-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-[#E4002B] flex items-center justify-center font-black text-xl">K</div>
            <div>
              <div className="font-black text-2xl tracking-wide">KFC SYNC</div>
              <div className="text-xs text-gray-400">Đăng ký tài khoản nhân viên</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-[#E4002B] px-6 py-4 flex items-center gap-2 text-white">
              <UserPlus className="h-5 w-5" />
              <span className="font-bold text-lg">Tạo tài khoản mới</span>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {errors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                  {errors.submit}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Họ và tên *</label>
                  <Input value={form.name} onChange={(e) => set("name", e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className={errors.name ? "border-red-400" : ""} />
                  {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Mã nhân viên *</label>
                  <Input value={form.employeeId} onChange={(e) => set("employeeId", e.target.value)}
                    placeholder="nv001"
                    className={errors.employeeId ? "border-red-400" : ""} />
                  {errors.employeeId && <p className="text-xs text-red-500">{errors.employeeId}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Mật khẩu *</label>
                  <div className="relative">
                    <Input type={showPw ? "text" : "password"} value={form.password}
                      onChange={(e) => set("password", e.target.value)} placeholder="••••••"
                      className={`pr-9 ${errors.password ? "border-red-400" : ""}`} />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Xác nhận MK *</label>
                  <div className="relative">
                    <Input type={showConfirm ? "text" : "password"} value={form.confirmPassword}
                      onChange={(e) => set("confirmPassword", e.target.value)} placeholder="••••••"
                      className={`pr-9 ${errors.confirmPassword ? "border-red-400" : ""}`} />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showConfirm ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Chức vụ *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["kitchen", "supervisor", "manager"] as const).map((r) => (
                    <button key={r} type="button" onClick={() => set("role", r)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center ${
                        form.role === r ? "border-[#E4002B] bg-red-50" : "border-gray-200 hover:border-gray-300"
                      }`}>
                      <span className="text-xl">{AUTH_ROLE_AVATARS[r]}</span>
                      <span className="text-[10px] font-semibold text-gray-700 leading-tight">{AUTH_ROLE_LABELS[r]}</span>
                    </button>
                  ))}
                </div>
                {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">Chi nhánh *</label>
                <select value={form.branchId}
                  onChange={(e) => {
                    const opt = BRANCH_OPTIONS.find((b) => b.id === e.target.value);
                    setForm((f) => ({ ...f, branchId: e.target.value, branchName: opt?.name ?? "" }));
                  }}
                  className={`w-full h-10 rounded-xl border px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#E4002B] ${
                    errors.branchId ? "border-red-400" : "border-gray-200"
                  }`}>
                  <option value="">-- Chọn chi nhánh --</option>
                  {BRANCH_OPTIONS.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
                {errors.branchId && <p className="text-xs text-red-500">{errors.branchId}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700">
                  Mã xác thực cửa hàng *{" "}
                  <span className="text-gray-400 font-normal">(liên hệ quản lý để nhận mã)</span>
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input value={form.storeCode}
                    onChange={(e) => set("storeCode", e.target.value.toUpperCase())}
                    placeholder="KFCXXXXX"
                    className={`pl-9 font-mono tracking-widest ${errors.storeCode ? "border-red-400" : ""}`} />
                </div>
                {errors.storeCode && <p className="text-xs text-red-500 font-semibold">{errors.storeCode}</p>}
              </div>

              <Button type="submit" className="w-full h-11 text-base" disabled={loading}>
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Đang tạo tài khoản...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserPlus className="h-4 w-4" /> Tạo tài khoản
                  </span>
                )}
              </Button>

              <div className="text-center text-sm text-gray-500">
                Đã có tài khoản?{" "}
                <Link href="/employee/login" className="text-[#E4002B] font-semibold hover:underline">
                  Đăng nhập
                </Link>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
