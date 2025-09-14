// lib/utils.ts
import { headers } from "next/headers";

export function formatCurrency(num: number) {
  return new Intl.NumberFormat("uz-UZ", { style: "currency", currency: "UZS", maximumFractionDigits: 0 }).format(num);
}

export async function getBaseUrl() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host  = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  return `${proto}://${host}`;
}

/** Relativ path bilan xavfsiz fetch: /api/... */
export async function apiFetch<T = any>(path: string, init?: RequestInit): Promise<T> {
  // path RELATIVE bo‘lishi shart: /api/...
  if (!path.startsWith("/")) throw new Error("apiFetch: path relativ bo‘lishi kerak, masalan '/api/...'");

  const base = await getBaseUrl();
  const res = await fetch(`${base}${path}`, { cache: "no-store", ...init });

  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed (non-JSON): ${res.status}`);
  }
  if (!res.ok) {
    const j = await res.json().catch(() => ({}));
    throw new Error(j?.message || `Request failed: ${res.status}`);
  }
  return res.json();
}