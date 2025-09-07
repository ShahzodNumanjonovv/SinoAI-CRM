// app/api/invoices/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

type CreatePayload = {
  patientId: string;
  items: { serviceId: string; qty: number }[];
  discountId?: string | null;
  // ixtiyoriy:
  discountPercent?: number; // 0..100
  discountFixed?: number;   // UZS
};


export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = (searchParams.get("status") || "").trim(); // "", UNPAID, PAID, ...
  const raw = (searchParams.get("q") || "").trim();
  const q = raw.replace(/\s+/g, " ");
  const tokens = q.split(" ").filter(Boolean);
  const qDigits = q.replace(/\D/g, "");

  const where: any = {};
  if (status) where.status = status as any;

  if (q.length >= 2) {
    const or: any[] = [
      // bemor ismi/familiyasi
      { patient: { firstName: { contains: q } } },
      { patient: { lastName:  { contains: q } } },
      { patient: { phone:     { contains: q } } },
    ];

    if (qDigits.length >= 3) {
      // telefon raqamlari bo‘yicha
      or.push({ patient: { phone: { contains: qDigits } } });
    }

    // q – faqat raqam bo‘lsa: code bo‘yicha topib ko‘ramiz
    if (/^\d+$/.test(q)) {
      or.push({ code: Number(q) });
    }

    if (tokens.length >= 2) {
      const [a, b] = tokens;
      or.push(
        { patient: { AND: [{ firstName: { contains: a } }, { lastName: { contains: b } }] } },
        { patient: { AND: [{ firstName: { contains: b } }, { lastName: { contains: a } }] } },
      );
    }

    where.OR = or;
  }

  const invoices = await prisma.invoice.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      patient: true,
      discount: true,
      items: { include: { service: true } },
    },
    take: 100,
  });

  return NextResponse.json({ ok: true, invoices });
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as CreatePayload;

    // --- Validatsiya ---
    if (!body?.patientId) {
      return NextResponse.json({ ok: false, error: "patientId required" }, { status: 400 });
    }
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json({ ok: false, error: "items required" }, { status: 400 });
    }

    // Xizmat narxlarini olib kelamiz
    const serviceIds = body.items.map(i => i.serviceId);
    const services = await prisma.service.findMany({ where: { id: { in: serviceIds } } });
    const priceMap = new Map(services.map(s => [s.id, s.priceUZS]));

    // Subtotal
    let subtotal = 0;
    for (const it of body.items) {
      const price = priceMap.get(it.serviceId);
      if (price == null) {
        return NextResponse.json({ ok: false, error: "Service not found" }, { status: 400 });
      }
      const qty = Math.max(1, Number(it.qty) || 1);
      subtotal += price * qty;
    }

    // Discount
    let discountAmt = 0;
    let discountId: string | null = body.discountId ?? null;

    if (discountId) {
      const d = await prisma.discount.findUnique({ where: { id: discountId } });
      if (d?.active) {
        if (d.dtype === "PERCENT") {
          discountAmt = Math.floor((subtotal * d.value) / 100);
        } else {
          discountAmt = Math.min(subtotal, d.value);
        }
      } else {
        discountId = null;
      }
    } else if (typeof body.discountPercent === "number") {
      const p = Math.min(100, Math.max(0, body.discountPercent));
      discountAmt = Math.floor((subtotal * p) / 100);
    } else if (typeof body.discountFixed === "number") {
      discountAmt = Math.min(subtotal, Math.max(0, body.discountFixed));
    }

    const total = Math.max(0, subtotal - discountAmt);

    // --- MUHIM: code generatsiyasi tranzaksiyada (race-condition yo'q) ---
    const created = await prisma.$transaction(async (tx) => {
      const last = await tx.invoice.findFirst({
        select: { code: true },
        orderBy: { code: "desc" },
      });
      const nextCode = (last?.code ?? 0) + 1;

      return tx.invoice.create({
        data: {
          code: nextCode,
          patientId: body.patientId,
          subtotal,
          discountId,
          discountAmt,
          total,
          status: "UNPAID",
          items: {
            create: body.items.map((it) => ({
              serviceId: it.serviceId,
              qty: Math.max(1, Number(it.qty) || 1),
              priceUZS: priceMap.get(it.serviceId)!,
            })),
          },
        },
        include: {
          patient: true,
          items: { include: { service: true } },
          discount: true,
        },
      });
    });

    return NextResponse.json({ ok: true, invoice: created });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}