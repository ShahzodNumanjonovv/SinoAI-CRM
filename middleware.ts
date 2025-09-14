// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { hasAuthCookie } from "@/lib/auth";

/** Public API: miniapp va availability */
const PUBLIC_API_RULES = [
  /^\/api\/miniapp(\/|$)/i,
  // faqat availability ni public qilamiz
  /^\/api\/doctors\/[^/]+\/availability(\/|$)/i,
];

/** CRM’ga tegishli himoyalangan yo‘llar */
const PROTECTED_PREFIXES = ["/patients", "/appointments", "/statistics", "/api"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Static/public fayllarni chetlab o'tamiz
  if (
    pathname === "/" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/img")
  ) {
    return NextResponse.next();
  }

  // ✅ Preflight (CORS OPTIONS) — har doim ruxsat
  if (req.method === "OPTIONS") {
    return NextResponse.next();
  }

  // ✅ Public API lar — auth talab qilinmaydi
  if (PUBLIC_API_RULES.some((re) => re.test(pathname))) {
    return NextResponse.next();
  }

  const isLoginPage = pathname === "/login";
  const isAuthApi = pathname.startsWith("/api/auth/");
  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const authed = hasAuthCookie(req.headers.get("cookie"));

  // Login sahifasiga kelib bo'lgan bo'lsa → statistics
  if (isLoginPage && authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/statistics";
    return NextResponse.redirect(url);
  }

  // Himoyalangan route’lar — login bo‘lmagan bo‘lsa → /login
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