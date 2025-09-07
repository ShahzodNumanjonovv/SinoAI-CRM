"use client";
import { useState } from "react";

type Props = {
  departments: { id: string; name: string }[];
  onCreated?: (service: any) => void;
};

export default function ServiceForm({ departments, onCreated }: Props) {
  const [loading, setLoading] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      code: String(fd.get("code") || "").trim(),
      name: String(fd.get("name") || "").trim(),
      priceUZS: Number(fd.get("priceUZS") || 0),
      departmentId: String(fd.get("departmentId") || "") || null,
    };
    try {
      setLoading(true);
      const res = await fetch("/api/services", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Xatolik");
      onCreated?.(json.service);
      alert("Xizmat yaratildi");
      e.currentTarget.reset();
    } catch (err: any) {
      alert(err.message || "Xatolik");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-sm mb-1">Kod</label>
        <input name="code" required className="w-full rounded border p-2" placeholder="#001" />
      </div>
      <div>
        <label className="block text-sm mb-1">Nomi</label>
        <input name="name" required className="w-full rounded border p-2" placeholder="Rentgen" />
      </div>
      <div>
        <label className="block text-sm mb-1">Narx (UZS)</label>
        <input name="priceUZS" type="number" min={0} required className="w-full rounded border p-2" />
      </div>
      <div>
        <label className="block text-sm mb-1">Bo‘lim</label>
        <select name="departmentId" className="w-full rounded border p-2">
          <option value="">— tanlanmagan —</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </div>
      <button
        disabled={loading}
        className="w-full bg-green-700 text-white rounded py-2 disabled:opacity-60"
      >
        {loading ? "Yaratilmoqda..." : "Xizmat yaratish"}
      </button>
    </form>
  );
}