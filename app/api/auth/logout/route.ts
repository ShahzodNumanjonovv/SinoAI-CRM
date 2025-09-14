// app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { clearAuthHeaders } from "@/lib/auth";

// GET: link bosilganda cookie tozalanib /login ga redirect
export async function GET() {
  const headers = clearAuthHeaders();
  return NextResponse.redirect(new URL("/login", "http://localhost:3000"), { headers });
}

// POST: JS orqali chiqishda (fetch/form) foydalanish
export async function POST() {
  const headers = clearAuthHeaders();
  return new NextResponse(JSON.stringify({ ok: true }), { status: 200, headers });
}