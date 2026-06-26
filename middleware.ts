import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "kfc-sync-fallback-secret"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("kfc-staff-token")?.value;

  const isProtectedStaff =
    pathname.startsWith("/staff") &&
    !pathname.startsWith("/staff/login") &&
    !pathname.startsWith("/staff/register");
  const isProtectedManager = pathname.startsWith("/manager");
  const isProtectedKitchen = pathname.startsWith("/kitchen");

  if (!isProtectedStaff && !isProtectedManager && !isProtectedKitchen) {
    return NextResponse.next();
  }

  if (!token) {
    const url = new URL("/staff/login", request.url);
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);
    const role = ((payload.role as string) ?? "").toLowerCase();

    if (isProtectedManager) {
      if (role === "kitchen") {
        return NextResponse.redirect(new URL("/kitchen/orders", request.url));
      }
      if (role === "supervisor" && !pathname.startsWith("/manager/shifts")) {
        return NextResponse.redirect(new URL("/manager/shifts", request.url));
      }
    }

    return NextResponse.next();
  } catch {
    const url = new URL("/staff/login", request.url);
    const res = NextResponse.redirect(url);
    res.cookies.delete("kfc-staff-token");
    res.cookies.delete("kfc-user");
    return res;
  }
}

export const config = {
  matcher: ["/staff/:path*", "/manager/:path*", "/kitchen/:path*"],
};
