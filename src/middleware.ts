/**
 * Next.js Middleware — Edge Runtime (autocontido, sem imports externos)
 *
 * Responsabilidades:
 *  - Proteger rotas /admin/* (exige lep-admin-session com type=admin + role=ADMIN)
 *  - Proteger rotas de usuário (/minha-conta, /checkout, /pedido)
 *  - Redirecionar usuários já autenticados para fora de /login
 *  - Adicionar cabeçalhos de segurança em todas as respostas
 */

import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-me",
);

const PROTECTED_ADMIN_ROUTES = ["/admin"];
const ADMIN_PUBLIC_ROUTES = ["/admin/login", "/admin/trocar-senha"];
const PROTECTED_USER_ROUTES = ["/minha-conta", "/checkout", "/pedido"];
const PUBLIC_ONLY_ROUTES = ["/login"];

function isUserProtectedPath(pathname: string): boolean {
  // Página de confirmação de pedido é pública
  if (/^\/pedido\/[^/]+\/confirmacao\/?$/.test(pathname)) return false;
  return PROTECTED_USER_ROUTES.some((r) => pathname.startsWith(r));
}

function withSecurityHeaders(res: NextResponse): NextResponse {
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  return res;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isAdminRoute = PROTECTED_ADMIN_ROUTES.some((r) =>
    pathname.startsWith(r),
  );
  const isAdminPublicRoute = ADMIN_PUBLIC_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(`${r}/`),
  );

  // ─── Proteção de rotas admin ────────────────────────────────────────────
  if (isAdminRoute && !isAdminPublicRoute) {
    const adminToken = request.cookies.get("lep-admin-session")?.value;

    if (!adminToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      const { payload } = await jwtVerify(adminToken, JWT_SECRET);

      if (payload.type !== "admin" || payload.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    } catch {
      const res = NextResponse.redirect(
        new URL("/admin/login", request.url),
      );
      res.cookies.delete("lep-admin-session");
      return res;
    }

    return withSecurityHeaders(NextResponse.next());
  }

  // ─── Proteção de rotas de usuário ───────────────────────────────────────
  if (isUserProtectedPath(pathname)) {
    const userToken = request.cookies.get("lep-session")?.value;

    if (!userToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    try {
      await jwtVerify(userToken, JWT_SECRET);
    } catch {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete("lep-session");
      return res;
    }

    return withSecurityHeaders(NextResponse.next());
  }

  // ─── Redirecionar autenticados para fora do /login ──────────────────────
  if (PUBLIC_ONLY_ROUTES.some((r) => pathname.startsWith(r))) {
    const userToken = request.cookies.get("lep-session")?.value;
    if (userToken) {
      try {
        await jwtVerify(userToken, JWT_SECRET);
        return NextResponse.redirect(new URL("/", request.url));
      } catch {
        // token inválido — deixa acessar o login
      }
    }
  }

  return withSecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api|products/).*)",
  ],
};
