"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LogOut, User, MapPin, BadgeCheck, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { readUserCookie, logoutAndRedirect, ROLE_AVATARS, ROLE_LABELS } from "@/lib/auth-client";
import type { ClientUser } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  const [user, setUser] = useState<ClientUser | null>(null);

  useEffect(() => {
    const u = readUserCookie();
    if (!u) {
      window.location.href = "/staff/login";
      return;
    }
    setUser(u);
  }, []);

  if (!user) return null;

  const handleLogout = async () => {
    toast.success("Đã đăng xuất thành công.");
    await logoutAndRedirect("/");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#1A1A1A] pb-16 pt-8">
        <div className="max-w-lg mx-auto px-6 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex flex-col items-center gap-3"
          >
            <div className="w-20 h-20 rounded-full bg-[#E4002B] flex items-center justify-center text-4xl shadow-lg">
              {ROLE_AVATARS[user.role] ?? "👤"}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">{user.name}</h1>
              <div className="inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white">
                <BadgeCheck className="h-3.5 w-3.5" />
                {ROLE_LABELS[user.role] ?? user.role}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-8 space-y-4 pb-8">
        <Card className="shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="h-4 w-4 text-[#E4002B]" /> Thông tin tài khoản
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { icon: BadgeCheck, label: "Mã nhân viên", value: user.employeeId },
              { icon: MapPin,     label: "Chi nhánh",    value: user.branch },
              { icon: ShieldCheck,label: "Chức vụ",      value: ROLE_LABELS[user.role] ?? user.role },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 py-1">
                <Icon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <div className="flex-1">
                  <div className="text-xs text-gray-400">{label}</div>
                  <div className="text-sm font-semibold text-gray-800">{value}</div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Button
          variant="destructive"
          className="w-full h-11 justify-start gap-3 text-sm"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" /> Đăng xuất
        </Button>
      </div>
    </div>
  );
}
