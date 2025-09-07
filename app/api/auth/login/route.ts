import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db"; // sizdagi prisma import yo'lining o'zini ishlating

export async function POST(req: Request) {
  try {
    const { login, password } = await req.json(); // formdan keladi: login=email yoki phone

    if (!login || !password) {
      return NextResponse.json({ ok: false, error: "Missing credentials" }, { status: 400 });
    }

    // 🔧 Email YOKI Phone bo‘yicha qidirish
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: login }, { phone: login }],
      },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 401 });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return NextResponse.json({ ok: false, error: "Bad credentials" }, { status: 401 });
    }

    // TODO: Sizda qanday auth bor — shu yerda cookie/jwt qo'yiladi.
    // Hozircha faqat 200 qaytaramiz:
    return NextResponse.json({ ok: true, user: { id: user.id, role: user.role } });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}