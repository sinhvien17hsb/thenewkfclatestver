"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Users, ToggleLeft, ToggleRight, Loader2, Search, ChefHat, CreditCard, Briefcase, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { usePolling } from "@/lib/hooks";
import { useAuthStore } from "@/lib/store";
import { Input } from "@/components/ui/input";

interface DbEmployee  { id: string; name: string; employeeId: string; branch: string; role: string; isActive: boolean; }
interface DisplayEmployee extends DbEmployee { source: "db" | "store"; }

const ROLE_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  KITCHEN:  { label: "Bếp",      icon: ChefHat,     color: "text-orange-400" },
  CASHIER:  { label: "Thu ngân", icon: CreditCard,   color: "text-blue-400"  },
  MANAGER:  { label: "Quản lý",  icon: Briefcase,    color: "text-purple-400" },
  kitchen:  { label: "Bếp",      icon: ChefHat,     color: "text-orange-400" },
  supervisor:{ label: "Giám sát",icon: ShieldCheck,  color: "text-yellow-400" },
  manager:  { label: "Quản lý",  icon: Briefcase,    color: "text-purple-400" },
};

export default function EmployeesPage() {
  const { users } = useAuthStore();
  const { data: dbEmployees, refetch } = usePolling<DbEmployee[]>("/api/employees", 0);
  const [search, setSearch] = useState("");
  const [toggling, setToggling] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState("");

  // Map Zustand store users to display shape
  const storeEmployees: DisplayEmployee[] = users.map((u) => ({
    id: u.id,
    name: u.name,
    employeeId: u.employeeId,
    branch: u.branchName ?? "",
    role: u.role,
    isActive: true,
    source: "store",
  }));

  // DB employees take priority; fill in store-only accounts not in DB
  const dbIds = new Set((dbEmployees ?? []).map((e) => e.employeeId));
  const allEmployees: DisplayEmployee[] = [
    ...(dbEmployees ?? []).map((e) => ({ ...e, source: "db" as const })),
    ...storeEmployees.filter((e) => !dbIds.has(e.employeeId)),
  ];

  const filtered = allEmployees.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(search.toLowerCase());
    const normalizedRole = e.role.toUpperCase();
    const matchRole = !roleFilter || normalizedRole === roleFilter || e.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleToggle = async (emp: DisplayEmployee) => {
    if (emp.source === "store") {
      toast.error("Tài khoản hệ thống không thể vô hiệu hóa.");
      return;
    }
    setToggling(emp.id);
    try {
      const res = await fetch(`/api/employees/${emp.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !emp.isActive }),
      });
      if (!res.ok) throw new Error();
      toast.success(emp.isActive ? "Đã vô hiệu hóa." : "Đã kích hoạt.");
      refetch();
    } catch { toast.error("Không thể cập nhật."); }
    finally { setToggling(null); }
  };

  const active = allEmployees.filter((e) => e.isActive).length;

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4">
        <h1 className="text-xl font-black text-white flex items-center gap-2">
          <Users className="h-5 w-5 text-[#E4002B]" />Nhân viên
        </h1>
        <p className="text-gray-500 text-xs mt-0.5">
          {active} đang hoạt động · {allEmployees.length - active} vô hiệu hóa · {allEmployees.length} tổng
        </p>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-40">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm theo tên hoặc mã..."
            className="bg-gray-900 border-gray-800 text-white pl-9 rounded-xl" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          className="h-9 rounded-xl border border-gray-800 px-3 text-sm bg-gray-900 text-white focus:outline-none"
        >
          <option value="">Tất cả vai trò</option>
          <option value="KITCHEN">Bếp</option>
          <option value="CASHIER">Thu ngân</option>
          <option value="MANAGER">Quản lý</option>
          <option value="supervisor">Giám sát</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-600">
          <Users className="h-12 w-12 mx-auto mb-3" />
          <p className="font-semibold">{allEmployees.length === 0 ? "Chưa có nhân viên" : "Không tìm thấy"}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((emp) => {
            const meta = ROLE_META[emp.role] ?? { label: emp.role, icon: Users, color: "text-gray-400" };
            const Icon = meta.icon;
            return (
              <motion.div key={emp.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className={`bg-gray-900 rounded-2xl border border-gray-800 p-4 flex items-center gap-3 ${!emp.isActive ? "opacity-50" : ""}`}
              >
                <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center flex-shrink-0">
                  <Icon className={`h-5 w-5 ${meta.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{emp.name}</span>
                    {!emp.isActive && <span className="text-[10px] bg-gray-800 text-gray-600 px-1.5 py-0.5 rounded-md">Vô hiệu</span>}
                    {emp.source === "store" && (
                      <span className="text-[10px] bg-blue-950/60 text-blue-400 border border-blue-800 px-1.5 py-0.5 rounded-md">Hệ thống</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono">{emp.employeeId}</span>
                    <span>·</span>
                    <span className={meta.color}>{meta.label}</span>
                    {emp.branch && <><span>·</span><span className="truncate">{emp.branch}</span></>}
                  </div>
                </div>
                <button onClick={() => handleToggle(emp)} disabled={toggling === emp.id || emp.source === "store"}
                  className="flex-shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {toggling === emp.id ? (
                    <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
                  ) : emp.isActive ? (
                    <ToggleRight className="h-6 w-6 text-green-400" />
                  ) : (
                    <ToggleLeft className="h-6 w-6 text-gray-600" />
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
