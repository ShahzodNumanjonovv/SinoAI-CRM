// app/api/users/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { userSchema } from "@/lib/schema";
import bcrypt from "bcryptjs";


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = (searchParams.get("q") || "").trim();
  const q = raw.replace(/\s+/g, " ");
  const tokens = q.split(" ").filter(Boolean);
  const qDigits = q.replace(/\D/g, "");

  let where: any = undefined;

  if (q.length >= 2) {
    const or: any[] = [
      { firstName: { contains: q } },
      { lastName: { contains: q } },
      { phone: { contains: q } },
      { role: { contains: q } }, // ADMIN/MANAGER/DOCTOR/RECEPTION matniga ko‘ra
    ];
    if (qDigits.length >= 3) or.push({ phone: { contains: qDigits } });

    if (tokens.length >= 2) {
      const [a, b] = tokens;
      or.push(
        { AND: [{ firstName: { contains: a } }, { lastName: { contains: b } }] },
        { AND: [{ firstName: { contains: b } }, { lastName: { contains: a } }] },
      );
    }

    where = { OR: or };
  }

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true, firstName: true, lastName: true, phone: true, role: true, createdAt: true,
    },
  });

  return NextResponse.json({ ok: true, users });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const u = userSchema.parse(body);

    const exists = await prisma.user.findUnique({ where: { phone: u.phone } });
    if (exists) {
      return NextResponse.json(
        { ok: false, error: "Bu telefon raqam allaqachon mavjud" },
        { status: 400 }
      );
    }

    const hash = await bcrypt.hash(u.password, 10);

    const user = await prisma.user.create({
      data: {
        firstName: u.firstName,
        lastName: u.lastName,
        phone: u.phone,
        role: u.role, // SQLite: string sifatida saqlayapmiz
        password: hash,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ ok: true, user });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Yaroqsiz ma'lumot" },
      { status: 400 }
    );
  }
}