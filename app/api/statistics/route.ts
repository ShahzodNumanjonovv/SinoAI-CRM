// app/api/statistics/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  // Sana filtri (faqat fakturalar uchun ishlatamiz)
  const createdAt =
    from || to
      ? {
          gte: from ? new Date(from + "T00:00:00") : undefined,
          lte: to ? new Date(to + "T23:59:59") : undefined,
        }
      : undefined;

  // --- Gender counts (BARCHA bemorlar bo‘yicha, sanaga bog‘liq emas) ---
  const [male, female] = await Promise.all([
    prisma.patient.count({ where: { gender: "MALE" } }),
    prisma.patient.count({ where: { gender: "FEMALE" } }),
  ]);

  // --- Fakturalar bo‘yicha aggregatlar (misol sifatida sodda variant) ---
  const [paid, unpaid, draft, cancelled] = await Promise.all([
    prisma.invoice.count({ where: { status: "PAID", createdAt } }),
    prisma.invoice.count({ where: { status: "UNPAID", createdAt } }),
    prisma.invoice.count({ where: { status: "DRAFT", createdAt } }),
    prisma.invoice.count({ where: { status: "CANCELLED", createdAt } }),
  ]);
  const all = paid + unpaid + draft + cancelled;

  // Tushumlar
  const paidSum = await prisma.invoice.aggregate({
    where: { status: "PAID", createdAt },
    _sum: { total: true },
  });
  const unpaidSum = await prisma.invoice.aggregate({
    where: { status: "UNPAID", createdAt },
    _sum: { total: true },
  });
  const revenue = {
    paid: paidSum._sum.total ?? 0,
    unpaid: unpaidSum._sum.total ?? 0,
    total: (paidSum._sum.total ?? 0) + (unpaidSum._sum.total ?? 0),
  };

  // Kunlar kesimida (oddiy misol)
  const invoices = await prisma.invoice.findMany({
    where: { createdAt, status: { in: ["PAID", "UNPAID"] } },
    select: { createdAt: true, total: true },
    orderBy: { createdAt: "asc" },
    take: 500,
  });
  const byDayMap = new Map<string, number>();
  for (const inv of invoices) {
    const key = inv.createdAt.toISOString().slice(0, 10); // YYYY-MM-DD
    byDayMap.set(key, (byDayMap.get(key) ?? 0) + inv.total);
  }
  const byDay = Array.from(byDayMap, ([date, total]) => ({ date, total }));

  // Top xizmatlar (soddalashtirilgan)
  const items = await prisma.invoiceItem.findMany({
    where: { invoice: { createdAt, status: { in: ["PAID", "UNPAID"] } } },
    include: { service: true },
    take: 2000,
  });
  const svcMap = new Map<
    string,
    { id: string; name: string; code: string | null; qty: number; revenue: number }
  >();
  for (const it of items) {
    if (!it.service) continue;
    const key = it.service.id;
    const row =
      svcMap.get(key) ??
      { id: key, name: it.service.name, code: it.service.code, qty: 0, revenue: 0 };
    row.qty += it.qty;
    row.revenue += it.priceUZS * it.qty;
    svcMap.set(key, row);
  }
  const topServices = Array.from(svcMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  return NextResponse.json({
    ok: true,
    range: { from: from ?? null, to: to ?? null },
    invoices: { paid, unpaid, draft, cancelled, all },
    revenue,
    byDay,
    topServices,
    gender: { male, female }, // 👈 MUHIM: front shu yerga qaraydi
  });
}