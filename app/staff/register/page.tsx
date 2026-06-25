"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2, UserPlus, ShieldCheck, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const BRANCHES = ["KFC Vincom Bà Triệu", "KFC Lê Văn Lương", "KFC Trần Duy Hưng", "KFC Royal City", "KFC Aeon Mall Long Biên"];
const ROLES = [
  { value: "KITCHEN", label: "Nhân viên bếp", emoji: "👨‍🍳" },
  { value: "CASHIER", label: "Thu ngân", emoji: "💳" },
  { value: "MANAGER", label: "Quản lý", emoji: "👔" },
];

export default function StaffRegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", employeeId: "", branch: "", role: "", password: "", confirmPassword: "", storeCode: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const s = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Bắt buộc";
    if (!form.employeeId.trim()) e.employeeId = "Bắt buộc";
    if (!form.branch) e.branch = "Chọn chi nhánh";
    if (!form.role) e.role = "Chọn chức vụ";
    if (form.password.length < 6) e.password = "Tối thiểu 6 ký tự";
    if (form.password !== form.confirmPassword) e.confirmPassword = "Không khớp";
    if (!form.storeCode) e.storeCode = "Bắt buộc";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess(true);
      toast.success("Tạo tài khoản thành công!");
      setTimeout(() => {
        const roleRoutes: Record<string, string> = { MANAGER: "/manager/dashboard", CASHIER: "/staff/service-requests", KITCHEN: "/staff/kitchen" };
        router.push(roleRoutes[form.role] ?? "/staff/kitchen");
      }, 1500);
    } catch (e: unknown) {
      setErrors({ submit: (e as Error).message });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="text-center">
          <div className="w-20 h-20 rounded-full bg-green-900/50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-10 w-10 text-green-400" />
          </div>
          <h2 className="text-2xl font-black text-white">Đăng ký thành công!</h2>
          <p className="text-gray-500 mt-2">Đang chuyển hướng...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 py-8 px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-sm mx-auto">
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/kfc-logo.png" alt="KFC" className="w-12 h-12 object-contain rounded-xl bg-white mx-auto mb-3 p-0.5" />
          <h1 className="text-xl font-black text-white">Tạo tài khoản</h1>
          <p className="text-gray-500 text-sm mt-1">KFC Sync · Nhân viên</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {errors.submit && (
            <div className="bg-red-900/30 border border-red-800 text-red-300 rounded-xl px-4 py-3 text-sm">{errors.submit}</div>
          )}

          {[
            { field: "name", label: "Họ và tên", placeholder: "Nguyễn Văn A" },
            { field: "employeeId", label: "Mã nhân viên", placeholder: "KFC001" },
          ].map(({ field, label, placeholder }) => (
            <div key={field}>
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">{label}</label>
              <Input
                value={form[field as keyof typeof form]}
                onChange={(e) => s(field, e.target.value)}
                placeholder={placeholder}
                className={`bg-gray-900 border-gray-800 text-white placeholder:text-gray-600 rounded-xl h-10 ${errors[field] ? "border-red-700" : ""}`}
              />
              {errors[field] && <p className="text-xs text-red-400 mt-0.5">{errors[field]}</p>}
            </div>
          ))}

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">Chi nhánh</label>
            <select value={form.branch} onChange={(e) => s("branch", e.target.value)}
              className={`w-full h-10 rounded-xl border px-3 text-sm bg-gray-900 text-white focus:outline-none focus:border-[#E4002B] ${errors.branch ? "border-red-700" : "border-gray-800"}`}
            >
              <option value="">-- Chọn chi nhánh --</option>
              {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            {errors.branch && <p className="text-xs text-red-400 mt-0.5">{errors.branch}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">Chức vụ</label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((r) => (
                <button type="button" key={r.value} onClick={() => s("role", r.value)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all ${form.role === r.value ? "border-[#E4002B] bg-red-950/30" : "border-gray-800 hover:border-gray-700"}`}
                >
                  <span className="text-xl">{r.emoji}</span>
                  <span className="text-[10px] font-semibold text-gray-300 text-center leading-tight">{r.label}</span>
                </button>
              ))}
            </div>
            {errors.role && <p className="text-xs text-red-400 mt-0.5">{errors.role}</p>}
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { field: "password", label: "Mật khẩu" },
              { field: "confirmPassword", label: "Xác nhận" },
            ].map(({ field, label }) => (
              <div key={field}>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">{label}</label>
                <div className="relative">
                  <Input
                    type={showPw ? "text" : "password"}
                    value={form[field as keyof typeof form]}
                    onChange={(e) => s(field, e.target.value)}
                    placeholder="••••••"
                    className={`bg-gray-900 border-gray-800 text-white rounded-xl h-10 pr-8 ${errors[field] ? "border-red-700" : ""}`}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500">
                    {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {errors[field] && <p className="text-[10px] text-red-400 mt-0.5">{errors[field]}</p>}
              </div>
            ))}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-1">Mã xác thực cửa hàng</label>
            <div className="relative">
              <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                value={form.storeCode}
                onChange={(e) => s("storeCode", e.target.value.toUpperCase())}
                placeholder="KFCXXXXX"
                className={`bg-gray-900 border-gray-800 text-white rounded-xl h-10 pl-9 font-mono tracking-widest ${errors.storeCode ? "border-red-700" : ""}`}
              />
            </div>
            {errors.storeCode && <p className="text-xs text-red-400 mt-0.5">{errors.storeCode}</p>}
          </div>

          <Button type="submit" className="w-full h-11 rounded-xl" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
            Tạo tài khoản
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-5">
          Đã có tài khoản?{" "}
          <Link href="/staff/login" className="text-[#E4002B] font-semibold hover:underline">Đăng nhập</Link>
        </p>
      </motion.div>
    </div>
  );
}
