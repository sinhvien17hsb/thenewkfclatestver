"use client";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { AUTH_ROLE_LABELS, AUTH_ROLE_AVATARS } from "@/lib/types";

const ROLES = [
  { id: "kitchen01",    role: "kitchen" as const,    desc: "Quản lý đơn bếp · SOP",               color: "border-orange-700 hover:border-orange-500" },
  { id: "supervisor01", role: "supervisor" as const,  desc: "Bếp + Ca làm việc",                    color: "border-purple-700 hover:border-purple-500" },
  { id: "manager01",    role: "manager" as const,     desc: "Toàn quyền · Dashboard · Báo cáo",    color: "border-green-700 hover:border-green-500" },
];

function RolePickerOverlay() {
  const { login } = useAuthStore();
  return (
    <div className="fixed inset-0 bg-gray-950 z-50 flex items-center justify-center p-4">
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
              onClick={() => login(r.id, "123456")}
              className={`w-full flex items-center gap-4 bg-gray-900 border-2 ${r.color} rounded-2xl px-5 py-4 transition-all text-left group`}
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

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, canAccess } = useAuthStore();

  if (!user) return <RolePickerOverlay />;

  if (!canAccess(pathname)) {
    if (user.role === "kitchen") { router.replace("/kitchen/orders"); return null; }
    if (user.role === "supervisor") { router.replace("/manager/shifts"); return null; }
    router.replace("/unauthorized");
    return null;
  }

  return <>{children}</>;
}
