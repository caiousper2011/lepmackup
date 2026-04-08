import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-me",
);

const PROTECTED_USER_ROUTES = ["/minha-conta", "/checkout", "/pedido"];
const PROTECTED_ADMIN_ROUTES = ["/admin"];
const ADMIN_PUBLIC_ROUTES = ["/admin/login"];
const PUBLIC_ONLY_ROUTES = ["/login"];

function isUserProtectedPath(pathname: string) {
  const isOrderConfirmationPath = /^\/pedido\/[^/]+\/confirmacao\/?$/.test(
    pathname,
  );

  if (isOrderConfirmationPath) {
    return false;
  }

  return PROTECTED_USER_ROUTES.some((route) => pathname.startsWith(route));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Security headers for all responses
  const response = NextResponse.next();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );

  // Admin routes protection
  const isAdminRoute = PROTECTED_ADMIN_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  const isAdminPublicRoute = ADMIN_PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (isAdminRoute && !isAdminPublicRoute) {
    const adminToken = request.cookies.get("lep-admin-session")?.value;
    if (!adminToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    try {
      const { payload } = await jwtVerify(adminToken, JWT_SECRET);
      if (payload.type !== "admin") {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
    } catch {
      const loginUrl = new URL("/admin/login", request.url);
      const res = NextResponse.redirect(loginUrl);
      res.cookies.delete("lep-admin-session");
      return res;
    }
    return response;
  }

  // User protected routes
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
    return response;
  }

  // Redirect logged-in users away from login page
  if (PUBLIC_ONLY_ROUTES.some((route) => pathname.startsWith(route))) {
    const userToken = request.cookies.get("lep-session")?.value;
    if (userToken) {
      try {
        await jwtVerify(userToken, JWT_SECRET);
        return NextResponse.redirect(new URL("/", request.url));
      } catch {
        // Token invalid, let them access login
      }
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api|products/).*)"],
};
