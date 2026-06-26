import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "kfc-sync-fallback-secret"
);
const COOKIE_NAME = "kfc-staff-token";
const USER_COOKIE_NAME = "kfc-user";

export interface JWTPayload {
  id: string;
  employeeId: string;
  name: string;
  role: string;
  branch: string;
}

// Hardcoded demo accounts — always available, no database required
export const MOCK_STAFF: Array<JWTPayload & { password: string }> = [
  {
    id: "mock_kitchen01",
    employeeId: "kitchen01",
    name: "Trần Văn Bếp",
    role: "kitchen",
    branch: "KFC Vincom Bà Triệu",
    password: "123456",
  },
  {
    id: "mock_supervisor01",
    employeeId: "supervisor01",
    name: "Nguyễn Thị Hương",
    role: "supervisor",
    branch: "KFC Vincom Bà Triệu",
    password: "123456",
  },
  {
    id: "mock_manager01",
    employeeId: "manager01",
    name: "Lê Minh Tuấn",
    role: "manager",
    branch: "KFC Vincom Bà Triệu",
    password: "123456",
  },
];

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function getSessionUser(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  cookieStore.delete(USER_COOKIE_NAME);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export { COOKIE_NAME };
