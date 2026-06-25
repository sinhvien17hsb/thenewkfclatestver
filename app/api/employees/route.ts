import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET() {
  const employees = await prisma.employee.findMany({
    select: { id: true, name: true, employeeId: true, branch: true, role: true, isActive: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(employees);
}
