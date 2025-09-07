// app/api/patients/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic"; // har safar serverda bajarilsin

// dd/mm/yyyy | yyyy-mm-dd | mm/dd/yyyy | mm-dd-yyyy ni qabul qiladi
function parseDateAny(input?: string | null) {
  if (!input) return null;
  const s = input.trim();

  // yyyy-mm-dd (HTML date input)
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    const d = new Date(s + "T00:00:00");
    return isNaN(+d) ? null : d;
  }

  // dd/mm/yyyy
  let m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) {
    const [, dd, mm, yyyy] = m;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return isNaN(+d) ? null : d;
  }

  // mm/dd/yyyy
  m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) {
    const [, mm, dd, yyyy] = m;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return isNaN(+d) ? null : d;
  }

  // mm-dd-yyyy
  m = s.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (m) {
    const [, mm, dd, yyyy] = m;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return isNaN(+d) ? null : d;
  }

  const d = new Date(s);
  return isNaN(+d) ? null : d;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = (searchParams.get("q") || "").trim();
  const q = raw.replace(/\s+/g, " ");
  const tokens = q.split(" ").filter(Boolean);
  const qDigits = q.replace(/\D/g, ""); // telefonni faqat raqam bilan qidirish

  let where: any = undefined;

  if (q.length >= 2) {
    // Bazaviy OR (ism, familiya, telefon)
    const or: any[] = [
      { firstName: { contains: q } },
      { lastName: { contains: q } },
      { phone: { contains: q } },
    ];

    // Telefon: faqat raqamlar bilan ham tekshirib ko‘ramiz
    if (qDigits.length >= 3) {
      or.push({ phone: { contains: qDigits } });
    }

    // “Ism Familiya” ko‘rinishi bo‘lsa kombinatsiyalarni ham qamrab olamiz
    if (tokens.length >= 2) {
      const [a, b] = tokens;

      or.push(
        // Ism ichida a va familiya ichida b
        { AND: [{ firstName: { contains: a } }, { lastName: { contains: b } }] },
        // Yoki aksincha: ism ichida b va familiya ichida a
        { AND: [{ firstName: { contains: b } }, { lastName: { contains: a } }] }
      );
    }

    where = { OR: or };
  }

  const patients = await prisma.patient.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ ok: true, patients });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      firstName,
      lastName,
      phone,
      birthDate, // string bo‘lishi mumkin
      gender, // "MALE" | "FEMALE"
      address,
    } = body ?? {};

    if (!firstName || !lastName || !phone || !gender) {
      return NextResponse.json(
        { ok: false, error: "Majburiy maydonlar to‘ldirilmagan" },
        { status: 400 }
      );
    }

    const bd = parseDateAny(birthDate);

    const created = await prisma.patient.create({
      data: {
        firstName,
        lastName,
        phone,
        gender,
        birthDate: bd,
        address: address ?? null,
      },
    });

    return NextResponse.json({ ok: true, patient: created });
  } catch (e: any) {
    const msg =
      e?.code === "P2002"
        ? "Bu telefon raqami bilan bemor allaqachon bor"
        : e?.message || "Server xatosi";
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}