import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "kfc-sync-fallback-secret"
);

async function getUser(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as { role: string };
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const token = request.cookies.get("kfc-staff-token")?.value;

  const isStaffRoute =
    pathname.startsWith("/staff") &&
    !pathname.startsWith("/staff/login") &&
    !pathname.startsWith("/staff/register");

  const isManagerRoute = pathname.startsWith("/manager");

  if (isStaffRoute || isManagerRoute) {
    if (!token) {
      return NextResponse.redirect(new URL("/staff/login", request.url));
    }
    const user = await getUser(token);
    if (!user) {
      return NextResponse.redirect(new URL("/staff/login", request.url));
    }
    if (isManagerRoute && user.role !== "MANAGER") {
      return NextResponse.redirect(new URL("/staff/kitchen", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/staff/:path*", "/manager/:path*"],
};
