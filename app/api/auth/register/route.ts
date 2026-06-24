import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import {
  hashPassword,
  signToken,
  setSessionCookie,
} from "@/lib/auth-server";

const STORE_CODE = "KFCNHOM17";

export async function POST(req: Request) {
  try {
    const { name, employeeId, branch, role, password, confirmPassword, storeCode } =
      await req.json();

    if (!name || !employeeId || !branch || !role || !password || !storeCode) {
      return NextResponse.json({ error: "Vui lòng điền đầy đủ thông tin." }, { status: 400 });
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Mật khẩu xác nhận không khớp." }, { status: 400 });
    }
    if (storeCode !== STORE_CODE) {
      return NextResponse.json({ error: "Mã xác thực cửa hàng không hợp lệ." }, { status: 400 });
    }
    if (!["KITCHEN", "CASHIER", "MANAGER"].includes(role)) {
      return NextResponse.json({ error: "Chức vụ không hợp lệ." }, { status: 400 });
    }

    const existing = await prisma.employee.findUnique({ where: { employeeId } });
    if (existing) {
      return NextResponse.json({ error: "Mã nhân viên đã tồn tại." }, { status: 409 });
    }

    const hashed = await hashPassword(password);
    const employee = await prisma.employee.create({
      data: { name, employeeId, branch, role, password: hashed },
    });

    const token = await signToken({
      id: employee.id,
      employeeId: employee.employeeId,
      name: employee.name,
      role: employee.role,
      branch: employee.branch,
    });
    await setSessionCookie(token);

    return NextResponse.json({ success: true, user: { id: employee.id, name: employee.name, role: employee.role, branch: employee.branch } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Lỗi hệ thống." }, { status: 500 });
  }
}
