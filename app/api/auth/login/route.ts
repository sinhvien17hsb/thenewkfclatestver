import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { comparePassword, signToken, setSessionCookie } from "@/lib/auth-server";

export async function POST(req: Request) {
  try {
    const { employeeId, password } = await req.json();
    if (!employeeId || !password) {
      return NextResponse.json({ error: "Vui lòng điền đầy đủ thông tin." }, { status: 400 });
    }

    const employee = await prisma.employee.findUnique({ where: { employeeId } });
    if (!employee || !employee.isActive) {
      return NextResponse.json({ error: "Mã nhân viên không tồn tại hoặc tài khoản bị khóa." }, { status: 401 });
    }

    const valid = await comparePassword(password, employee.password);
    if (!valid) {
      return NextResponse.json({ error: "Mật khẩu không đúng." }, { status: 401 });
    }

    const token = await signToken({
      id: employee.id,
      employeeId: employee.employeeId,
      name: employee.name,
      role: employee.role,
      branch: employee.branch,
    });
    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: { id: employee.id, name: employee.name, role: employee.role, branch: employee.branch, employeeId: employee.employeeId },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Lỗi hệ thống." }, { status: 500 });
  }
}
