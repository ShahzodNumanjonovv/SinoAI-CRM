// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { hasAuthCookie } from "@/lib/auth";

/** Public API’lar (miniapp va availability) */
const PUBLIC_API_PREFIXES = [
  "/api/miniapp",
  "/api/doctors",            // ⬅️ availability uchun public
];

// Himoyalangan prefikslar (CRM)
const PROTECTED_PREFIXES = [
  "/patients",
  "/appointments",
  "/statistics",
  "/api",                    // umumiy /api (lekin public lar tepada “allowlist”dan o‘tadi)
];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Statik/public fayllar
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/img") ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  // ✅ Public API’lar: middleware tomonidan to‘xtatilmaydi
  if (PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const isLoginPage = pathname === "/login";
  const isAuthApi = pathname.startsWith("/api/auth/");
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const authed = hasAuthCookie(req.headers.get("cookie"));

  // Login sahifasiga kelgan va allaqachon login bo‘lgan bo‘lsa -> /statistics
  if (isLoginPage && authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/statistics";
    return NextResponse.redirect(url);
  }

  // Himoyalangan route: login bo‘lmasa -> /login
  if (isProtected && !authed && !isAuthApi) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname + (req.nextUrl.search || ""));
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icons/|img/).*)"],
};