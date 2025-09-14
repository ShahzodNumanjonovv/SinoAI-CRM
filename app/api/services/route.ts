// app/api/services/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { serviceSchema } from "@/lib/schema";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const raw = (searchParams.get("q") || "").trim();
  const q = raw.replace(/\s+/g, " ");
  const tokens = q.split(" ").filter(Boolean);

  let where: any = undefined;

  if (q.length >= 2) {
    const contains = (v: string) => ({ contains: v, mode: "insensitive" as const });

    const or: any[] = [
      { name: contains(q) },
      { code: contains(q) },                                  // code string bo‘lsa OK
      { department: { is: { name: contains(q) } } },          // relation bo‘yicha qidirish
    ];

    if (tokens.length >= 2) {
      const [a, b] = tokens;
      or.push(
        { AND: [{ name: contains(a) }, { department: { is: { name: contains(b) } } }] },
        { AND: [{ name: contains(b) }, { department: { is: { name: contains(a) } } }] },
      );
    }

    where = { OR: or };
  }

  const services = await prisma.service.findMany({
    where,
    orderBy: [{ code: "asc" }, { name: "asc" }],
    take: 200,
    include: { department: { select: { id: true, name: true } } },
  });

  return NextResponse.json({ ok: true, services });
}

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const s = serviceSchema.parse(json);

    const service = await prisma.service.create({
      data: {
        code: s.code ?? null,
        name: s.name,
        priceUZS: s.priceUZS,
        departmentId: s.departmentId ?? null,
        // active: s.active ?? true, // agar schema’da bo‘lsa yoqib qo‘ying
      },
      include: { department: { select: { id: true, name: true } } },
    });

    return NextResponse.json({ ok: true, service });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Invalid data" },
      { status: 400 },
    );
  }
}