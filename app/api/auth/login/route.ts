// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { makeAuthHeaders } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, password } = await req.json().catch(() => ({} as any));
  if (!email || !password) {
    return NextResponse.json({ ok: false, message: "Email/parol kerak" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, password: true, role: true, firstName: true, lastName: true },
  });

  if (!user) {
    return NextResponse.json({ ok: false, message: "Notog‘ri email yoki parol" }, { status: 401 });
  }

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return NextResponse.json({ ok: false, message: "Notog‘ri email yoki parol" }, { status: 401 });
  }

  // Cookie — token o‘rniga hozircha shunchaki "ok" yoki userId saqlaymiz
  const headers = makeAuthHeaders(user.id); // cookie: sinoai_auth=<userId>

  return new NextResponse(JSON.stringify({ ok: true }), { status: 200, headers });
}