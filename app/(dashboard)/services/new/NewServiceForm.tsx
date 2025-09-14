"use client";

import { useState, FormEvent, useTransition } from "react";
import { useRouter } from "next/navigation";

type Dept = { id: string; name: string };

export default function NewServiceForm({ departments }: { departments: Dept[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [priceUZS, setPriceUZS] = useState<string>("");
  const [departmentId, setDepartmentId] = useState(departments[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const price = Number(priceUZS);
    if (!name || !departmentId || Number.isNaN(price) || price <= 0) {
      setError("Iltimos, nom, bo‘lim va narxni to‘g‘ri kiriting.");
      return;
    }

    const res = await fetch("/api/services", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: code || null,
        name,
        priceUZS: price,
        departmentId,
      }),
    });

    if (!res.ok) {
      const msg = await res.text().catch(() => "");
      setError(msg || "Xizmatni saqlashda xatolik.");
      return;
    }

    startTransition(() => {
      router.push("/services");
      router.refresh();
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-xl">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm text-slate-600 mb-1">Bo‘lim</label>
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            className="w-full rounded border px-3 py-2"
            required
          >
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-600 mb-1">Kod (ixtiyoriy)</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full rounded border px-3 py-2"
            placeholder="Masalan: 22"
          />
        </div>

        <div>
          <label className="block text-sm text-slate-600 mb-1">Nom</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border px-3 py-2"
            placeholder="Masalan: MRT"
            required
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm text-slate-600 mb-1">Narx (UZS)</label>
          <input
            inputMode="numeric"
            value={priceUZS}
            onChange={(e) => setPriceUZS(e.target.value.replace(/[^\d]/g, ""))}
            className="w-full rounded border px-3 py-2"
            placeholder="60000"
            required
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          className="btn bg-emerald-700 text-white disabled:opacity-60"
          disabled={pending}
        >
          {pending ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      </div>
    </form>
  );
}