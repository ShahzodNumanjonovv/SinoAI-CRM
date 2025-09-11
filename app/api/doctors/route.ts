// app/api/doctors/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/* ---------- GET: list/search ---------- */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") || "").trim();

  const where =
    q.length > 0
      ? {
          OR: [
            { firstName: { contains: q, mode: "insensitive" } },
            { lastName: { contains: q, mode: "insensitive" } },
            { speciality: { contains: q, mode: "insensitive" } },
            { code: { contains: q, mode: "insensitive" } },
            ...(Number.isFinite(Number(q)) ? [{ roomNo: Number(q) }] : []),
          ],
        }
      : undefined;

  const doctors = await prisma.doctor.findMany({
    where,
    include: { department: true },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    take: 200,
  });

  return NextResponse.json({ ok: true, doctors });
}

/* ---------- helpers ---------- */
function makeCode() {
  const d = new Date();
  const seg = `${d.getFullYear()}${(d.getMonth() + 1)
    .toString()
    .padStart(2, "0")}${d.getDate().toString().padStart(2, "0")}${d
    .getSeconds()
    .toString()
    .padStart(2, "0")}${Math.floor(Math.random() * 90 + 10)}`;
  return `DR-${seg}`;
}

const SPECIALITIES = new Set(["Kardiolog", "Teropeft", "Genekolog", "Urolog"]);

/* ---------- POST: create ---------- */
export async function POST(req: Request) {
  try {
    const b = await req.json();

    // required checks
    if (!b?.firstName || !b?.lastName || !b?.speciality) {
      return NextResponse.json(
        { ok: false, message: "Majburiy maydonlar yetarli emas" },
        { status: 400 }
      );
    }
    if (!SPECIALITIES.has(b.speciality)) {
      return NextResponse.json(
        { ok: false, message: "Mutaxassislik noto‘g‘ri" },
        { status: 400 }
      );
    }

    // normalize
    const data: any = {
      code: (b.code?.toString().trim() || null) as string | null,
      firstName: String(b.firstName),
      lastName: String(b.lastName),
      speciality: String(b.speciality),
      roomNo:
        b.roomNo !== undefined && b.roomNo !== null && `${b.roomNo}` !== ""
          ? Number(b.roomNo)
          : null,
      priceUZS: Number(b.priceUZS ?? 0),
      departmentId: b.departmentId || null,

      // mini-app uchun qo‘shimcha fieldlar
      avatarUrl: b.avatarUrl ?? null,
      experienceYears: Number(b.experienceYears ?? 0),
    };

    // agar code berilmagan bo‘lsa — generatsiya qilamiz
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
        // P2002 => unique violation on code
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