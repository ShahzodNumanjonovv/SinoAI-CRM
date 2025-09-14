// app/api/doctors/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/* ---------------------- helpers ---------------------- */
const SPECIALITIES = new Set(["Kardiolog", "Teropevt", "Ginekolog", "Urolog"]);

function makeCode() {
  const d = new Date();
  const seg = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
    d.getDate()
  ).padStart(2, "0")}${String(d.getSeconds()).padStart(2, "0")}${Math.floor(Math.random() * 90 + 10)}`;
  return `DR-${seg}`;
}

function toNum(v: unknown, def: number | null = null) {
  if (v === null || v === undefined || v === "") return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
}

function cleanStr(v: unknown) {
  return (typeof v === "string" ? v : "").trim();
}

/* ---------------------- GET: list/search ---------------------- */
// /api/doctors?q=...&departmentId=...&speciality=...
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = cleanStr(searchParams.get("q"));
  const departmentId = cleanStr(searchParams.get("departmentId"));
  const speciality = cleanStr(searchParams.get("speciality"));

  const where: any = {};

  if (q) {
    where.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
      { speciality: { contains: q, mode: "insensitive" } },
      { code: { contains: q, mode: "insensitive" } },
    ];

    const qNum = Number(q);
    if (Number.isFinite(qNum)) {
      // raqam bo‘lsa xona raqami bo‘yicha ham qidiramiz
      where.OR.push({ roomNo: qNum });
    }
  }

  if (departmentId) where.departmentId = departmentId;
  if (speciality) where.speciality = { equals: speciality, mode: "insensitive" };

  const doctors = await prisma.doctor.findMany({
    where,
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    take: 200,
    // MUHIM: avatarUrl ham qaytsin
    select: {
      id: true,
      code: true,
      firstName: true,
      lastName: true,
      speciality: true,
      roomNo: true,
      priceUZS: true,
      experienceYil: true,
      avatarUrl: true,
      departmentId: true,
      department: { select: { id: true, name: true } },
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json({ ok: true, doctors });
}

/* ---------------------- POST: create ---------------------- */
export async function POST(req: Request) {
  try {
    const b = await req.json();

    const firstName = cleanStr(b?.firstName);
    const lastName = cleanStr(b?.lastName);
    const speciality = cleanStr(b?.speciality);

    if (!firstName || !lastName || !speciality) {
      return NextResponse.json(
        { ok: false, message: "Majburiy maydonlar to‘ldirilmagan" },
        { status: 400 }
      );
    }
    if (!SPECIALITIES.has(speciality)) {
      return NextResponse.json(
        { ok: false, message: "Mutaxassislik noto‘g‘ri" },
        { status: 400 }
      );
    }

    const data: any = {
      code: cleanStr(b?.code) || null,
      firstName,
      lastName,
      speciality,
      roomNo: toNum(b?.roomNo, null),
      priceUZS: toNum(b?.priceUZS, 0),
      departmentId: cleanStr(b?.departmentId) || null,
      experienceYil: toNum(b?.experienceYil, 0),

      // MUHIM: Supabase’dan kelgan URL shu yerga yoziladi
      avatarUrl: cleanStr(b?.avatarUrl) || null,
    };

    if (!data.code) data.code = makeCode();

    // unique(code) to‘qnashsa 3 marta urinib ko‘ramiz
    for (let i = 0; i < 3; i++) {
      try {
        const created = await prisma.doctor.create({
          data,
          select: { id: true },
        });
        return NextResponse.json({ ok: true, id: created.id }, { status: 201 });
      } catch (e: any) {
        if (e?.code === "P2002" && e?.meta?.target?.includes("code")) {
          data.code = makeCode();
          continue;
        }
        throw e;
      }
    }

    return NextResponse.json(
      { ok: false, message: "Kod to‘qnashuvi. Keyinroq urinib ko‘ring." },
      { status: 409 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, message: e?.message || "Server xatosi" },
      { status: 500 }
    );
  }
}