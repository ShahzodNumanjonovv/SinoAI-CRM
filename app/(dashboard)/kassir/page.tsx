// app/(dashboard)/kassir/page.tsx
import Link from "next/link";
import { getBaseUrl } from "@/lib/utils";
import StatusSelect from "./_components/StatusSelect";
import SearchBox from "@/components/SearchBox";

type Invoice = {
  id: string;
  code: number;
  status: "DRAFT" | "UNPAID" | "PAID" | "CANCELLED";
  subtotal: number;
  discountAmt: number;
  total: number;
  createdAt: string;
  patient?: { firstName: string; lastName: string } | null;
};

async function fetchInvoices(q: string, status: string, from?: string, to?: string) {
  const base = await getBaseUrl();
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (status) params.set("status", status);
  if (from) params.set("from", from);
  if (to) params.set("to", to);

  try {
    const res = await fetch(`${base}/api/invoices?${params.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) return { invoices: [] as Invoice[] };
    return (await res.json()) as { ok: boolean; invoices: Invoice[] };
  } catch {
    return { invoices: [] as Invoice[] };
  }
}

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; from?: string; to?: string }>;
}) {
  const sp = await searchParams;
  const q = sp?.q ?? "";
  const status = (sp?.status ?? "") as "" | "PAID" | "UNPAID" | "CANCELLED";
  const from = sp?.from ?? "";
  const to = sp?.to ?? "";

  // Hammasi + holatlar bo‘yicha sanash (bir xil q/from/to bilan)
  const [allRes, paidRes, unpaidRes, cancelledRes] = await Promise.all([
    fetchInvoices(q, "", from, to),
    fetchInvoices(q, "PAID", from, to),
    fetchInvoices(q, "UNPAID", from, to),
    fetchInvoices(q, "CANCELLED", from, to),
  ]);

  const invoices =
    status === "PAID"
      ? paidRes.invoices
      : status === "UNPAID"
      ? unpaidRes.invoices
      : status === "CANCELLED"
      ? cancelledRes.invoices
      : allRes.invoices;

  const counts = {
    all: allRes.invoices.length,
    paid: paidRes.invoices.length,
    unpaid: unpaidRes.invoices.length,
    cancelled: cancelledRes.invoices.length,
  };

  const tab = (
    href: string,
    label: string,
    count: number,
    active: boolean,
    color: "blue" | "green" | "yellow" | "red"
  ) => {
    // status paramini saqlash uchun from/to/q ni linkka ham qo‘shamiz
    const p = new URLSearchParams();
    if (q) p.set("q", q);
    if (from) p.set("from", from);
    if (to) p.set("to", to);

    const baseHref = href === "/kassir" ? "/kassir" : "/kassir?" + (href.split("?")[1] || "");
    const urlParams = new URLSearchParams(baseHref.split("?")[1] || "");
    if (q) urlParams.set("q", q);
    if (from) urlParams.set("from", from);
    if (to) urlParams.set("to", to);

    const full =
      baseHref === "/kassir"
        ? `/kassir${p.toString() ? `?${p.toString()}` : ""}`
        : `/kassir?${urlParams.toString()}`;

    const badge =
      color === "blue"
        ? "bg-blue-100 text-blue-700"
        : color === "green"
        ? "bg-green-100 text-green-700"
        : color === "yellow"
        ? "bg-yellow-100 text-yellow-700"
        : "bg-red-100 text-red-700";

    return (
      <Link
        href={full}
        className={[
          "flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium",
          active ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200",
        ].join(" ")}
      >
        <span
          className={[
            "inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-semibold",
            active ? "bg-white/25 text-white" : badge,
          ].join(" ")}
        >
          {count}
        </span>
        {label}
      </Link>
    );
  };

  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hisob-fakturalar</h1>
        <Link href="/kassir/create" className="btn">
          + Yangi Hisob-Faktura
        </Link>
      </div>

      {/* Tabs */}
      <div className="mb-4 flex flex-wrap gap-2">
        {tab("/kassir", "Hammasi", counts.all, status === "", "blue")}
        {tab("/kassir?status=PAID", "To‘langan", counts.paid, status === "PAID", "green")}
        {tab("/kassir?status=UNPAID", "To‘lanmagan", counts.unpaid, status === "UNPAID", "yellow")}
        {tab(
          "/kassir?status=CANCELLED",
          "O‘chirilgan",
          counts.cancelled,
          status === "CANCELLED",
          "red"
        )}
      </div>

      {/* Debounced qidiruv (2 ta belgi yozilgach) + sana oralig‘i formi */}
      <div className="mb-4 grid grid-cols-1 gap-2 md:grid-cols-3">
        <SearchBox
          placeholder="Hisob-faktura kodi yoki bemor bo‘yicha qidirish"
          initialValue={q}
          className="input w-full"
          // joriy status/from/to saqlansin:
          extraParams={{
            ...(status ? { status } : {}),
            ...(from ? { from } : {}),
            ...(to ? { to } : {}),
          }}
        />

        {/* Sana oralig‘i formi (qo‘lda submit) */}
        <form className="contents" action="/kassir">
          {/* status/q/.. ni ham birga jo‘natish uchun hiddenlar */}
          {q && <input type="hidden" name="q" value={q} />}
          {status && <input type="hidden" name="status" value={status} />}

          <input type="date" name="from" defaultValue={from} className="input w-full" />
          <div className="flex items-center gap-2">
            <input type="date" name="to" defaultValue={to} className="input w-full" />
            <button className="btn">Filtrlash</button>
          </div>
        </form>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[900px] w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="py-2">Kod</th>
              <th>Bemor</th>
              <th>Yaratilgan</th>
              <th>Holat</th>
              <th>Jami</th>
              <th>Chegirma</th>
              <th>Umumiy</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} className="border-t">
                <td className="py-2">
                  <Link href={`/kassir/${inv.id}`} className="text-emerald-700 hover:underline">
                    #{inv.code}
                  </Link>
                </td>
                <td>
                  {inv.patient?.firstName} {inv.patient?.lastName}
                </td>
                <td>{new Date(inv.createdAt).toLocaleString("uz-UZ")}</td>
                <td>
                  <StatusSelect id={inv.id} value={inv.status} />
                </td>
                <td>{inv.subtotal.toLocaleString("uz-UZ")} UZS</td>
                <td>{inv.discountAmt.toLocaleString("uz-UZ")} UZS</td>
                <td className="font-semibold">{inv.total.toLocaleString("uz-UZ")} UZS</td>
              </tr>
            ))}
            {invoices.length === 0 && (
              <tr>
                <td colSpan={7} className="py-6 text-center text-slate-400">
                  Hech narsa topilmadi
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}