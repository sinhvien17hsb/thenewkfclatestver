"use client";
import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { AUTH_ROLE_LABELS, AUTH_ROLE_AVATARS } from "@/lib/types";

const REDIRECT_MAP: Record<string, string> = {
  kitchen: "/kitchen/orders",
  supervisor: "/manager/shifts",
  manager: "/manager/dashboard",
};

const ROLES = [
  { id: "kitchen01",    role: "kitchen" as const,    border: "border-orange-700 hover:border-orange-500", desc: "Quản lý đơn bếp · SOP" },
  { id: "supervisor01", role: "supervisor" as const,  border: "border-purple-700 hover:border-purple-500", desc: "Bếp + Ca làm việc" },
  { id: "manager01",    role: "manager" as const,     border: "border-green-700 hover:border-green-500",   desc: "Toàn quyền · Dashboard · Báo cáo" },
];

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");
  const { login, user } = useAuthStore();

  useEffect(() => {
    if (user) {
      router.replace(redirect ?? REDIRECT_MAP[user.role] ?? "/");
    }
  }, [user, router, redirect]);

  const handleRole = (id: string, role: string) => {
    login(id, "123456");
    router.replace(redirect ?? REDIRECT_MAP[role] ?? "/");
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-xs">
        <div className="text-center mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/kfc-logo.png" alt="KFC" className="w-16 h-16 mx-auto mb-3 rounded-full bg-white p-1 object-contain" />
          <h2 className="text-white text-2xl font-black">The New KFC</h2>
          <p className="text-gray-400 text-sm mt-1">Chọn vai trò để tiếp tục</p>
        </div>
        <div className="space-y-3">
          {ROLES.map((r) => (
            <button
              key={r.id}
              onClick={() => handleRole(r.id, r.role)}
              className={`w-full flex items-center gap-4 bg-gray-900 border-2 ${r.border} rounded-2xl px-5 py-4 transition-all text-left group`}
            >
              <span className="text-3xl">{AUTH_ROLE_AVATARS[r.role]}</span>
              <div>
                <div className="text-white font-bold text-sm">{AUTH_ROLE_LABELS[r.role]}</div>
                <div className="text-gray-500 text-xs mt-0.5 group-hover:text-gray-300 transition-colors">{r.desc}</div>
              </div>
            </button>
          ))}
        </div>
        <p className="text-center text-xs text-gray-600 mt-6">Không cần mật khẩu</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-950 flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#E4002B] border-t-transparent rounded-full animate-spin" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
