// lib/cors.ts
import { NextResponse } from "next/server";

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://sino-a-iminiapp.vercel.app/",
];

// Dinamik tekshiradigan helper
function getAllowedOrigin(origin: string | null) {
  if (!origin) return "*"; // fallback
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  if (origin.includes("ngrok-free.app")) return origin; // ngrok uchun
  return "*"; // ruxsat berilmagan bo‘lsa fallback
}

export function corsHeaders(extra: Record<string, string> = {}, origin: string | null = null) {
  return {
    "Access-Control-Allow-Origin": getAllowedOrigin(origin),
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
    ...extra,
  };
}

export function corsOk(body: any, status = 200, origin: string | null = null) {
  return new NextResponse(JSON.stringify(body), {
    status,
    headers: corsHeaders({ "Content-Type": "application/json" }, origin),
  });
}

export function corsNoContent(origin: string | null = null) {
  return new NextResponse(null, { status: 204, headers: corsHeaders({}, origin) });
}