import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { name, branch, role, isActive } = await req.json();
  const employee = await prisma.employee.update({
    where: { id },
    data: { ...(name && { name }), ...(branch && { branch }), ...(role && { role }), ...(isActive !== undefined && { isActive }) },
    select: { id: true, name: true, employeeId: true, branch: true, role: true, isActive: true },
  });
  return NextResponse.json(employee);
}
