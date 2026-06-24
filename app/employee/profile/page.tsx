"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LogOut, Edit2, KeyRound, CheckCircle, User,
  MapPin, Calendar, BadgeCheck, ShieldCheck
} from "lucide-react";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AUTH_ROLE_LABELS, AUTH_ROLE_COLORS, AUTH_ROLE_AVATARS } from "@/lib/types";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, updateProfile, changePassword } = useAuthStore();

  const [editMode, setEditMode] = useState(false);
  const [pwMode, setPwMode] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  useEffect(() => {
    if (!user) {
      router.replace("/employee/login");
    } else {
      setEditName(user.name);
      setEditEmail(user.email);
    }
  }, [user, router]);

  if (!user) return null;

  const roleColor = AUTH_ROLE_COLORS[user.role];

  const handleLogout = () => {
    logout();
    toast.success("Đã đăng xuất thành công.");
    router.replace("/");
  };

  const handleSaveProfile = () => {
    if (!editName.trim()) { toast.error("Tên không được để trống."); return; }
    updateProfile({ name: editName.trim(), email: editEmail.trim() });
    setEditMode(false);
    toast.success("Đã cập nhật thông tin.");
  };

  const handleChangePassword = () => {
    if (newPw.length < 6) { toast.error("Mật khẩu mới tối thiểu 6 ký tự."); return; }
    if (newPw !== confirmPw) { toast.error("Mật khẩu xác nhận không khớp."); return; }
    const result = changePassword(oldPw, newPw);
    if (!result.success) {
      toast.error(result.error ?? "Đổi mật khẩu thất bại.");
    } else {
      toast.success("Đã đổi mật khẩu thành công.");
      setPwMode(false);
      setOldPw(""); setNewPw(""); setConfirmPw("");
    }
  };

  const joinedDate = new Date(user.registeredAt).toLocaleDateString("vi-VN", {
    day: "2-digit", month: "2-digit", year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-[#1A1A1A] pb-16 pt-8">
        <div className="max-w-lg mx-auto px-6 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex flex-col items-center gap-3"
          >
            <div className="w-20 h-20 rounded-full bg-[#E4002B] flex items-center justify-center text-4xl shadow-lg">
              {AUTH_ROLE_AVATARS[user.role]}
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">{user.name}</h1>
              <div className={`inline-flex items-center gap-1.5 mt-1 px-3 py-1 rounded-full text-xs font-bold ${roleColor.bg} ${roleColor.text}`}>
                <BadgeCheck className="h-3.5 w-3.5" />
                {AUTH_ROLE_LABELS[user.role]}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-8 space-y-4 pb-8">
        {/* Info card */}
        <Card className="shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="h-4 w-4 text-[#E4002B]" /> Thông tin tài khoản
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { icon: BadgeCheck, label: "Mã nhân viên", value: user.employeeId },
              { icon: User, label: "Email", value: user.email },
              { icon: MapPin, label: "Chi nhánh", value: user.branchName },
              { icon: Calendar, label: "Ngày đăng ký", value: joinedDate },
              { icon: ShieldCheck, label: "Chức vụ", value: AUTH_ROLE_LABELS[user.role] },
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

        {/* Edit profile */}
        {editMode ? (
          <Card className="shadow-lg border-[#E4002B]/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-[#E4002B]">
                <Edit2 className="h-4 w-4" /> Chỉnh sửa thông tin
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Họ và tên</label>
                <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Email</label>
                <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 h-9 text-sm" onClick={handleSaveProfile}>
                  <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Lưu thay đổi
                </Button>
                <Button variant="outline" className="flex-1 h-9 text-sm" onClick={() => setEditMode(false)}>
                  Hủy
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : pwMode ? (
          <Card className="shadow-lg border-[#E4002B]/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2 text-[#E4002B]">
                <KeyRound className="h-4 w-4" /> Đổi mật khẩu
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Mật khẩu hiện tại</label>
                <Input type="password" value={oldPw} onChange={(e) => setOldPw(e.target.value)} placeholder="••••••" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Mật khẩu mới</label>
                <Input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="••••••" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-600">Xác nhận mật khẩu mới</label>
                <Input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} placeholder="••••••" />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 h-9 text-sm" onClick={handleChangePassword}>
                  <CheckCircle className="h-3.5 w-3.5 mr-1.5" /> Xác nhận
                </Button>
                <Button variant="outline" className="flex-1 h-9 text-sm" onClick={() => setPwMode(false)}>
                  Hủy
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full h-11 justify-start gap-3 text-sm border-2"
              onClick={() => setEditMode(true)}
            >
              <Edit2 className="h-4 w-4 text-gray-500" /> Chỉnh sửa thông tin
            </Button>
            <Button
              variant="outline"
              className="w-full h-11 justify-start gap-3 text-sm border-2"
              onClick={() => setPwMode(true)}
            >
              <KeyRound className="h-4 w-4 text-gray-500" /> Đổi mật khẩu
            </Button>
            <Button
              variant="destructive"
              className="w-full h-11 justify-start gap-3 text-sm"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" /> Đăng xuất
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
