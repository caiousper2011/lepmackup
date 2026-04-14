import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { rateLimit } from "@/lib/rate-limit";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback-secret-change-me",
);

const PROTECTED_USER_ROUTES = ["/minha-conta", "/checkout", "/pedido"];
const PROTECTED_ADMIN_ROUTES = ["/admin"];
const ADMIN_PUBLIC_ROUTES = ["/admin/login", "/admin/trocar-senha"];
const PUBLIC_ONLY_ROUTES = ["/login"];

// API route-specific rate limit configs: [maxRequests, windowMs]
const RATE_LIMITS: Record<string, [number, number]> = {
  "/api/auth/send-code": [5, 60 * 60 * 1000], // 5 per hour
  "/api/auth/verify-code": [10, 15 * 60 * 1000], // 10 per 15 min
  "/api/auth/checkout": [10, 60 * 1000], // 10 per minute
  "/api/orders": [10, 60 * 1000], // 10 per minute
  "/api/shipping/calculate": [30, 60 * 1000], // 30 per minute
  "/api/coupons/validate": [20, 60 * 1000], // 20 per minute
  "/api/addresses": [20, 60 * 1000], // 20 per minute
};

const DEFAULT_LIMIT: [number, number] = [100, 60 * 1000]; // 100 per minute

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}

function findRateLimit(pathname: string): [number, number] {
  // Exact match first
  if (RATE_LIMITS[pathname]) return RATE_LIMITS[pathname];

  // Check prefix match for parameterized routes like /api/orders/[id]
  for (const [route, config] of Object.entries(RATE_LIMITS)) {
    if (pathname.startsWith(route + "/")) return config;
  }

  return DEFAULT_LIMIT;
}

function isUserProtectedPath(pathname: string) {
  const isOrderConfirmationPath = /^\/pedido\/[^/]+\/confirmacao\/?$/.test(
    pathname,
  );

  if (isOrderConfirmationPath) {
    return false;
  }

  return PROTECTED_USER_ROUTES.some((route) => pathname.startsWith(route));
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API rate limiting
  if (pathname.startsWith("/api/")) {
    // Skip webhook routes (they have their own auth)
    if (pathname.startsWith("/api/webhooks/")) {
      return NextResponse.next();
    }

    const ip = getClientIp(request);
    const [maxRequests, windowMs] = findRateLimit(pathname);
    const key = `proxy:${ip}:${pathname}`;

    const result = rateLimit(key, maxRequests, windowMs);

    if (!result.allowed) {
      const retryAfterSec = Math.ceil((result.resetAt - Date.now()) / 1000);

      return NextResponse.json(
        { error: "Muitas requisições. Tente novamente em alguns instantes." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": String(maxRequests),
            "X-RateLimit-Remaining": "0",
            "Retry-After": String(retryAfterSec),
            "X-RateLimit-Reset": new Date(result.resetAt).toISOString(),
          },
        },
      );
    }

    const apiResponse = NextResponse.next();
    apiResponse.headers.set("X-RateLimit-Limit", String(maxRequests));
    apiResponse.headers.set("X-RateLimit-Remaining", String(result.remaining));
    apiResponse.headers.set(
      "X-RateLimit-Reset",
      new Date(result.resetAt).toISOString(),
    );

    return apiResponse;
  }

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
      if (payload.type !== "admin" || payload.role !== "ADMIN") {
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
  matcher: [
    "/api/:path*",
    "/((?!_next/static|_next/image|favicon.ico|api|products/).*)",
  ],
};
