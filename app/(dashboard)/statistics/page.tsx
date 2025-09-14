// app/(dashboard)/statistics/page.tsx
import { headers } from "next/headers";
import GenderSummaryCard from "./_components/GenderSummaryCard";

type StatsResponse = {
  ok: boolean;
  range: { from: string | null; to: string | null };
  invoices: {
    draft: number;
    paid: number;
    unpaid: number;
    cancelled: number;
    all: number;
  };
  revenue: { total: number; paid: number; unpaid: number };
  byDay: { date: string; total: number }[];
  topServices: {
    id: string;
    name: string;
    code: string | null;
    qty: number;
    revenue: number;
  }[];
  gender?: { male: number; female: number };
};

function emptyStats(from?: string, to?: string): StatsResponse {
  return {
    ok: false as any,
    range: { from: from ?? null, to: to ?? null },
    invoices: { draft: 0, paid: 0, unpaid: 0, cancelled: 0, all: 0 },
    revenue: { total: 0, paid: 0, unpaid: 0 },
    byDay: [],
    topServices: [],
    gender: { male: 0, female: 0 },
  };
}

// ✅ Absolute URL + cookie forward (auth bilan ishlashi uchun)
async function getStats(from?: string, to?: string): Promise<StatsResponse> {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "http";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const cookie = h.get("cookie") ?? "";

  const qs = new URLSearchParams();
  if (from) qs.set("from", from);
  if (to) qs.set("to", to);
  const url = `${proto}://${host}/api/statistics${qs.toString() ? `?${qs.toString()}` : ""}`;

  const res = await fetch(url, {
    cache: "no-store",
    // Muhim: cookie’ni forward qilamiz — middleware seni login’ga burmasin
    headers: { cookie },
  });

  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json") || !res.ok) {
    return emptyStats(from, to);
  }
  try {
    return (await res.json()) as StatsResponse;
  } catch {
    return emptyStats(from, to);
  }
}

export default async function StatisticsPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const from = sp?.from ?? "";
  const to = sp?.to ?? "";

  const stats = await getStats(from, to);
  const fmt = (n: number) => new Intl.NumberFormat("uz-UZ").format(n);

  const male = stats.gender?.male ?? 0;
  const female = stats.gender?.female ?? 0;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Statistika</h1>
        <form className="flex flex-wrap items-center gap-2" action="/statistics">
          <input type="date" name="from" defaultValue={from} className="input" />
          <input type="date" name="to" defaultValue={to} className="input" />
          <button className="btn">Filtrlash</button>
        </form>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <GenderSummaryCard male={male} female={female} />
        </div>

        <div className="rounded-xl border p-4">
          <div className="text-slate-500">Umumiy tushum</div>
          <div className="mt-1 text-2xl font-bold">
            {fmt(stats.revenue.total)} UZS
          </div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-slate-500">To‘langan tushum</div>
          <div className="mt-1 text-2xl font-bold text-emerald-700">
            {fmt(stats.revenue.paid)} UZS
          </div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-slate-500">Qarzdorlik (UNPAID)</div>
          <div className="mt-1 text-2xl font-bold text-amber-600">
            {fmt(stats.revenue.unpaid)} UZS
          </div>
        </div>
        <div className="rounded-xl border p-4">
          <div className="text-slate-500">Fakturalar (Jami)</div>
          <div className="mt-1 text-2xl font-bold">{fmt(stats.invoices.all)}</div>
          <div className="mt-1 text-xs text-slate-500">
            Paid: {fmt(stats.invoices.paid)} • Unpaid: {fmt(stats.invoices.unpaid)} •
            Draft: {fmt(stats.invoices.draft)} • Cancelled: {fmt(stats.invoices.cancelled)}
          </div>
        </div>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <div className="border-b bg-gray-50 px-4 py-2 font-medium">
          Kunlar bo‘yicha tushum
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="p-3">Sana</th>
              <th className="p-3">Tushum (UZS)</th>
            </tr>
          </thead>
          <tbody>
            {stats.byDay.length === 0 && (
              <tr>
                <td colSpan={2} className="p-6 text-center text-slate-400">
                  Ma’lumot yo‘q
                </td>
              </tr>
            )}
            {stats.byDay.map((d) => (
              <tr key={d.date} className="border-t">
                <td className="p-3">{d.date}</td>
                <td className="p-3">{fmt(d.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border overflow-hidden">
        <div className="border-b bg-gray-50 px-4 py-2 font-medium">
          Eng ko‘p sotilgan xizmatlar
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="p-3">#</th>
              <th className="p-3">Xizmat</th>
              <th className="p-3 text-right">Miqdor</th>
              <th className="p-3 text-right">Tushum (UZS)</th>
            </tr>
          </thead>
          <tbody>
            {stats.topServices.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-slate-400">
                  Ma’lumot yo‘q
                </td>
              </tr>
            )}
            {stats.topServices.map((s, i) => (
              <tr key={s.id} className="border-t">
                <td className="p-3">{i + 1}</td>
                <td className="p-3">
                  {s.code ? `#${s.code} — ${s.name}` : s.name}
                </td>
                <td className="p-3 text-right">{fmt(s.qty)}</td>
                <td className="p-3 text-right">{fmt(s.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}