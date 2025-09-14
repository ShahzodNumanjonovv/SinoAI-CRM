// lib/auth.ts
export const AUTH_COOKIE = "sinoai_auth";

export function makeAuthHeaders(value: string = "ok") {
  const maxAge = 60 * 60 * 24 * 14; // 14 kun
  const parts = [
    `${AUTH_COOKIE}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAge}`,
    process.env.NODE_ENV === "production" ? "Secure" : "",
  ].filter(Boolean);

  const headers = new Headers();
  headers.append("Set-Cookie", parts.join("; "));
  return headers;
}

export function clearAuthHeaders() {
  const headers = new Headers();
  headers.append(
    "Set-Cookie",
    `${AUTH_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${
      process.env.NODE_ENV === "production" ? "; Secure" : ""
    }`
  );
  return headers;
}

export function hasAuthCookie(cookieHeader: string | null | undefined) {
  if (!cookieHeader) return false;
  return new RegExp(`(?:^|;\\s*)${AUTH_COOKIE}=([^;]+)`).test(cookieHeader);
}