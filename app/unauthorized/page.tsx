"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShieldX, ArrowLeft } from "lucide-react";
import { readUserCookie, ROLE_LABELS, ROLE_REDIRECT } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

export default function UnauthorizedPage() {
  const user = readUserCookie();
  const dashboard = user ? (ROLE_REDIRECT[user.role] ?? "/") : "/employee/login";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full text-center"
      >
        <div className="w-24 h-24 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <ShieldX className="h-12 w-12 text-[#E4002B]" />
        </div>

        <h1 className="text-3xl font-black text-gray-900 mb-3">Truy cập bị từ chối</h1>

        <p className="text-gray-500 mb-2">
          Bạn không có quyền truy cập chức năng này.
        </p>

        {user && (
          <p className="text-sm text-gray-400 mb-8">
            Tài khoản của bạn có vai trò{" "}
            <span className="font-semibold text-gray-600">
              {ROLE_LABELS[user.role] ?? user.role}
            </span>{" "}
            — không đủ quyền hạn để truy cập trang này.
          </p>
        )}

        <div className="flex flex-col gap-3">
          <Button className="h-11" onClick={() => { window.location.href = dashboard; }}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Quay lại Dashboard
          </Button>
          {!user && (
            <Link href="/employee/login">
              <Button variant="outline" className="w-full h-11">
                Đăng nhập nhân viên
              </Button>
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
}
