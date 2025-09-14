// lib/cors.ts
import { NextResponse } from "next/server";

const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://sino-a-iminiapp.vercel.app/",
  "https://sinominiapp.netlify.app/"
];
const ORIGIN = process.env.CORS_ORIGIN || "http://localhost:5173";

// Dinamik tekshiradigan helper
function getAllowedOrigin(origin: string | null) {
  if (!origin) return "*"; // fallback
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  if (origin.includes("ngrok-free.app")) return origin; // ngrok uchun
  return "*"; // ruxsat berilmagan bo‘lsa fallback
}

export const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": ORIGIN,
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
  "Access-Control-Allow-Credentials": "true",
};

export function corsOk(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders },
  });
}

export function corsNoContent() {
  return new Response(null, {
    status: 204,
    headers: { ...corsHeaders } as HeadersInit,
  });
}