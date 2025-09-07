"use client";
import { useEffect, useMemo, useState } from "react";

type Patient = { id: string; firstName: string; lastName: string };
type Service = { id: string; code: string; name: string; priceUZS: number };
type Discount = { id: string; name: string; dtype: "PERCENT"|"FIXED"; value: number };

export default function CreateInvoice() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [patientId, setPatientId] = useState<string>("");
  const [rows, setRows] = useState<{ serviceId: string; qty: number }[]>([{ serviceId: "", qty: 1 }]);
  const [discountId, setDiscountId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const p = await fetch("/api/patients").then(r => r.json()).catch(()=>({patients:[]}));
      const s = await fetch("/api/services").then(r => r.json()).catch(()=>({services:[]}));
      const d = await fetch("/api/discounts").then(r => r.json()).catch(()=>({discounts:[]}));
      setPatients(p.patients || []);
      setServices(s.services || []);
      setDiscounts(d.discounts || []);
    })();
  }, []);

  const subtotal = useMemo(() => {
    let sum = 0;
    for (const r of rows) {
      const sv = services.find(s => s.id === r.serviceId);
      if (sv) sum += sv.priceUZS * Math.max(1, r.qty || 1);
    }
    return sum;
  }, [rows, services]);

  const discountAmt = useMemo(() => {
    const d = discounts.find(x => x.id === discountId);
    if (!d) return 0;
    if (d.dtype === "PERCENT") return Math.floor((subtotal * d.value) / 100);
    return Math.min(subtotal, d.value);
  }, [discountId, discounts, subtotal]);

  const total = Math.max(0, subtotal - discountAmt);

  function setRow(i: number, patch: Partial<{ serviceId: string; qty: number }>) {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, ...patch } : r));
  }

  function addRow() {
    setRows(prev => [...prev, { serviceId: "", qty: 1 }]);
  }

  function removeRow(i: number) {
    setRows(prev => prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev);
  }

  async function onSubmit() {
    if (!patientId) return alert("Bemorni tanlang");
    const items = rows.filter(r => r.serviceId).map(r => ({ serviceId: r.serviceId, qty: Math.max(1, r.qty||1) }));
    if (items.length === 0) return alert("Kamida bitta xizmat qo‘shing");

    setLoading(true);
    const res = await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json"},
      body: JSON.stringify({ patientId, items, discountId: discountId || null })
    });
    setLoading(false);

    if (res.ok) {
      alert("Hisob-faktura yaratildi");
      window.location.href = "/kassir";
    } else {
      const j = await res.json().catch(()=>({}));
      alert(j?.error || "Xatolik");
    }
  }

  return (
    <div className="max-w-3xl rounded-xl border bg-white p-6">
      <h1 className="text-lg font-semibold mb-4">Hisob-faktura yaratish</h1>

      {/* Bemor tanlash */}
      <label className="text-sm grid gap-1 mb-3">
        <span className="text-slate-600">Bemor</span>
        <select className="input" value={patientId} onChange={e=>setPatientId(e.target.value)}>
          <option value="">— Tanlang —</option>
          {patients.map(p => (
            <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
          ))}
        </select>
      </label>

      {/* Xizmatlar ro‘yxati */}
      <div className="grid gap-2">
        {rows.map((r, i) => {
          const price = services.find(s=>s.id===r.serviceId)?.priceUZS ?? 0;
          return (
            <div key={i} className="grid md:grid-cols-[1fr_140px_120px_auto] gap-2">
              <select className="input" value={r.serviceId} onChange={e=>setRow(i, { serviceId: e.target.value })}>
                <option value="">Xizmat tanlang</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.code} — {s.name}</option>
                ))}
              </select>
              <input className="input" type="number" min={1} value={r.qty} onChange={e=>setRow(i, { qty: Number(e.target.value) })} />
              <div className="grid place-items-center text-sm text-slate-600">{price.toLocaleString("uz-UZ")} UZS</div>
              <button type="button" className="rounded px-2 text-red-600" onClick={()=>removeRow(i)}>🗑️</button>
            </div>
          );
        })}
        <button type="button" className="btn w-fit" onClick={addRow}>+ Xizmat qo‘shish</button>
      </div>

      {/* Chegirma */}
      <div className="mt-4 grid md:grid-cols-2 gap-3">
        <label className="text-sm grid gap-1">
          <span className="text-slate-600">Chegirma</span>
          <select className="input" value={discountId} onChange={e=>setDiscountId(e.target.value)}>
            <option value="">— Yo‘q —</option>
            {discounts.map(d => (
              <option key={d.id} value={d.id}>
                {d.name} {d.dtype==="PERCENT" ? `(${d.value}%)` : `(-${d.value.toLocaleString("uz-UZ")} UZS)`}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Yakuniy summa */}
      <div className="mt-4 text-sm grid gap-1">
        <div>Oraliq jami: <b>{subtotal.toLocaleString("uz-UZ")} UZS</b></div>
        <div>Chegirma: <b>{discountAmt.toLocaleString("uz-UZ")} UZS</b></div>
        <div className="text-lg font-bold">Umumiy narx: {total.toLocaleString("uz-UZ")} UZS</div>
      </div>

      <div className="mt-4 flex gap-2">
        <button className="btn" onClick={onSubmit} disabled={loading}>{loading ? "Yaratilmoqda..." : "Yaratish"}</button>
        <a className="input grid place-items-center" href="/kassir">Bekor qilish</a>
      </div>
    </div>
  );
}