import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-me",
);

/** Rotas dentro de /admin que NÃO precisam de autenticação */
const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/trocar-senha"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Só protege /admin/*
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  // Permite login e troca de senha sem cookie
  if (PUBLIC_ADMIN_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("lep-admin-session")?.value;

  if (!token) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    // Garante que é um token de admin (não de usuário comum)
    if (payload.type !== "admin" || payload.role !== "ADMIN") {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  } catch {
    // Token inválido ou expirado
    const loginUrl = new URL("/admin/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
