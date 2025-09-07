"use client";

type Props = { id: string; current: "DRAFT" | "UNPAID" | "PAID" | "CANCELLED" };

export default function InvoiceStatusButtons({ id, current }: Props) {
  async function setStatus(status: Props["current"]) {
    try {
      const res = await fetch(`/api/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data?.error || "Xatolik");
      window.location.reload();
    } catch (e: any) {
      alert(e?.message ?? "Xatolik");
    }
  }

  const Btn = (s: Props["current"], label: string, cls: string) => (
    <button
      type="button"
      onClick={() => setStatus(s)}
      className={`px-3 py-2 rounded border ${cls} ${current === s ? "opacity-60 cursor-default" : ""}`}
      disabled={current === s}
    >
      {label}
    </button>
  );

  return (
    <div className="flex gap-2 flex-wrap">
      {Btn("UNPAID", "To‘lanmagan", "border-amber-500 text-amber-700")}
      {Btn("PAID", "To‘langan", "border-emerald-600 text-emerald-700")}
      {Btn("DRAFT", "Qoralama", "border-slate-400 text-slate-600")}
      {Btn("CANCELLED", "Bekor qilingan", "border-rose-500 text-rose-600")}
    </div>
  );
}