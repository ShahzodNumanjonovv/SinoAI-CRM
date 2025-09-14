// app/(dashboard)/kassir/[id]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import InvoiceStatusButtons from "@/components/InvoiceStatusButtons";

export const dynamic = "force-dynamic";
export const revalidate = 0; // Vercel’da statiklashmasin

type InvoiceDetail = {
  id: string;
  code: number;
  status: "DRAFT" | "UNPAID" | "PAID" | "CANCELLED";
  subtotal: number;
  discountAmt: number;
  total: number;
  createdAt: string;
  patient: { firstName: string; lastName: string } | null;
  discount: { name: string } | null;
  items: {
    id: string;
    qty: number;
    priceUZS: number;
    service: { code: string; name: string };
  }[];
};

async function getInvoice(id: string): Promise<InvoiceDetail | null> {
  // Server Component ichida nisbiy URL – host muammosiz
  try {
    const res = await fetch(`/api/invoices/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { ok: boolean; invoice?: InvoiceDetail };
    return data.invoice ?? null;
  } catch {
    return null;
  }
}

export default async function InvoiceDetailPage({
  params,
}: {
  // ✅ Next 15: params — Promise
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // ✅ majburiy await
  const invoice = await getInvoice(id);

  if (!invoice) notFound();

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Hisob-faktura #{invoice.code}</h1>
          <p className="text-slate-500">
            {invoice.patient
              ? `${invoice.patient.firstName} ${invoice.patient.lastName}`
              : "—"}
            {" · "}
            {new Date(invoice.createdAt).toLocaleString("uz-UZ")}
          </p>
        </div>
        <Link href="/kassir" className="btn">
          ← Ro‘yxat
        </Link>
      </div>

      <InvoiceStatusButtons id={invoice.id} current={invoice.status} />

      <div className="rounded border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="[&>th]:px-3 [&>th]:py-2 [&>th]:text-left">
              <th>Kod</th>
              <th>Xizmat</th>
              <th className="text-right">Narx (UZS)</th>
              <th className="text-right">Soni</th>
              <th className="text-right">Jami (UZS)</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((it) => (
              <tr key={it.id} className="border-t [&>td]:px-3 [&>td]:py-2">
                <td>{it.service.code}</td>
                <td>{it.service.name}</td>
                <td className="text-right">
                  {it.priceUZS.toLocaleString("uz-UZ")}
                </td>
                <td className="text-right">{it.qty}</td>
                <td className="text-right">
                  {(it.qty * it.priceUZS).toLocaleString("uz-UZ")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="ml-auto w-full max-w-sm space-y-2">
        <div className="flex justify-between">
          <span className="text-slate-600">Oraliq jami:</span>
          <span>{invoice.subtotal.toLocaleString("uz-UZ")} UZS</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">
            Chegirma{invoice.discount ? ` (${invoice.discount.name})` : ""}:
          </span>
          <span>{invoice.discountAmt.toLocaleString("uz-UZ")} UZS</span>
        </div>
        <div className="flex justify-between text-lg font-semibold">
          <span>Umumiy:</span>
          <span>{invoice.total.toLocaleString("uz-UZ")} UZS</span>
        </div>
      </div>
    </div>
  );
}

// (ixtiyoriy) metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return { title: `Hisob-faktura ${id}` };
}