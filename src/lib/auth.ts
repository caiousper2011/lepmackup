import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-me",
);
const SESSION_DAYS = parseInt(process.env.SESSION_DURATION_DAYS || "30", 10);
const COOKIE_NAME = "lep-session";
const ADMIN_COOKIE_NAME = "lep-admin-session";

// ============================================
// JWT
// ============================================

interface JWTPayload {
  sub: string;
  email: string;
  role: string;
  type: "user" | "admin";
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

// ============================================
// COOKIES
// ============================================

export async function setSessionCookie(
  token: string,
  type: "user" | "admin" = "user",
) {
  const cookieStore = await cookies();
  const name = type === "admin" ? ADMIN_COOKIE_NAME : COOKIE_NAME;
  cookieStore.set(name, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DAYS * 24 * 60 * 60,
    path: "/",
  });
}

export async function getSessionCookie(
  type: "user" | "admin" = "user",
): Promise<string | null> {
  const cookieStore = await cookies();
  const name = type === "admin" ? ADMIN_COOKIE_NAME : COOKIE_NAME;
  return cookieStore.get(name)?.value ?? null;
}

export async function deleteSessionCookie(type: "user" | "admin" = "user") {
  const cookieStore = await cookies();
  const name = type === "admin" ? ADMIN_COOKIE_NAME : COOKIE_NAME;
  cookieStore.delete(name);
}

// ============================================
// SESSION HELPERS
// ============================================

export async function getCurrentUser() {
  const token = await getSessionCookie("user");
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload || payload.type !== "user") return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    await deleteSessionCookie("user");
    return null;
  }

  return session.user;
}

export async function getCurrentAdmin() {
  const token = await getSessionCookie("admin");
  if (!token) return null;

  const payload = await verifyToken(token);
  if (!payload || payload.type !== "admin") return null;

  const admin = await prisma.adminUser.findUnique({
    where: { id: payload.sub, active: true },
  });

  return admin;
}

export async function createUserSession(userId: string, email: string) {
  const token = await signToken({
    sub: userId,
    email,
    role: "CUSTOMER",
    type: "user",
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_DAYS);

  await prisma.session.create({
    data: { userId, token, expiresAt },
  });

  await setSessionCookie(token, "user");
  return token;
}

export async function createAdminSession(adminId: string, email: string) {
  const token = await signToken({
    sub: adminId,
    email,
    role: "ADMIN",
    type: "admin",
  });

  await setSessionCookie(token, "admin");
  return token;
}

// ============================================
// OTP
// ============================================

export function generateOTPCode(): string {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  return code;
}
