import { NextResponse } from "next/server";
import { MOCK_STAFF, signToken, setSessionCookie, comparePassword } from "@/lib/auth-server";

export async function POST(req: Request) {
  try {
    const { employeeId, password } = await req.json();
    if (!employeeId || !password) {
      return NextResponse.json(
        { error: "Vui lòng điền đầy đủ thông tin." },
        { status: 400 }
      );
    }

    // 1. Check hardcoded demo accounts first — works on Vercel without a database
    const mock = MOCK_STAFF.find((u) => u.employeeId === employeeId);
    if (mock) {
      if (password !== mock.password) {
        return NextResponse.json({ error: "Mật khẩu không đúng." }, { status: 401 });
      }
      const { password: _pw, ...payload } = mock;
      const token = await signToken(payload);
      await setSessionCookie(token);
      return NextResponse.json({ success: true, user: payload });
    }

    // 2. Fall back to database for registered accounts
    try {
      const prisma = (await import("@/lib/db")).default;
      const employee = await prisma.employee.findUnique({ where: { employeeId } });
      if (!employee || !employee.isActive) {
        return NextResponse.json(
          { error: "Mã nhân viên không tồn tại hoặc tài khoản bị khóa." },
          { status: 401 }
        );
      }
      const valid = await comparePassword(password, employee.password);
      if (!valid) {
        return NextResponse.json({ error: "Mật khẩu không đúng." }, { status: 401 });
      }
      const payload = {
        id: employee.id,
        employeeId: employee.employeeId,
        name: employee.name,
        role: employee.role.toLowerCase(),
        branch: employee.branch,
      };
      const token = await signToken(payload);
      await setSessionCookie(token);
      return NextResponse.json({ success: true, user: payload });
    } catch {
      return NextResponse.json(
        { error: "Mã nhân viên không tồn tại." },
        { status: 401 }
      );
    }
  } catch {
    return NextResponse.json({ error: "Lỗi hệ thống." }, { status: 500 });
  }
}
