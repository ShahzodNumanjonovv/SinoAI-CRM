"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

const SPECIALITIES = ["Kardiolog", "Teropeft", "Genekolog", "Urolog"] as const;

type Dept = { id: string; name: string };

function toInt(v: FormDataEntryValue | null) {
  if (v == null) return null;
  const n = Number(String(v).trim());
  return Number.isFinite(n) ? n : null;
}

export default function NewForm({ departments }: { departments: Dept[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);

    const fd = new FormData(e.currentTarget);
    const body = {
      code: String(fd.get("code") ?? "").trim() || null,
      firstName: String(fd.get("firstName") ?? "").trim(),
      lastName: String(fd.get("lastName") ?? "").trim(),
      speciality: String(fd.get("speciality") ?? ""),
      roomNo: toInt(fd.get("roomNo")),
      priceUZS: toInt(fd.get("priceUZS")) ?? 0,
      departmentId: String(fd.get("departmentId") ?? "").trim() || null,

      // mini-app uchun qo‘shimcha:
      avatarUrl: String(fd.get("avatarUrl") ?? "").trim() || null,
      experienceYears: toInt(fd.get("experienceYears")) ?? 0,
    };

    if (!body.firstName || !body.lastName || !body.speciality) {
      setErr("Majburiy maydonlar to‘ldirilmagan."); return;
    }
    if (!SPECIALITIES.includes(body.speciality as any)) {
      setErr("Faqat Kardiolog | Teropeft | Genekolog | Urolog tanlang."); return;
    }

    start(async () => {
      try {
        const r = await fetch("/api/doctors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const j = await r.json();
        if (!r.ok || !j.ok) throw new Error(j.message || "Saqlashda xato");
        router.push("/doctors");
        router.refresh();
      } catch (e:any) {
        setErr(e.message || "Tarmoq xatosi");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {err && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{err}</p>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">#Kod (ixtiyoriy)</span>
          <input name="code" className="w-full rounded border px-3 py-2" />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">Xona raqami</span>
          <input name="roomNo" type="number" inputMode="numeric" className="w-full rounded border px-3 py-2" />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">Ismi</span>
          <input name="firstName" required className="w-full rounded border px-3 py-2" />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">Familiyasi</span>
          <input name="lastName" required className="w-full rounded border px-3 py-2" />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">Mutaxassisligi</span>
          <select name="speciality" required className="w-full rounded border px-3 py-2">
            <option value="">— Tanlang —</option>
            {SPECIALITIES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">Narxi (UZS)</span>
          <input name="priceUZS" type="number" inputMode="numeric" min={0} required className="w-full rounded border px-3 py-2" />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">Bo‘lim</span>
          <select name="departmentId" className="w-full rounded border px-3 py-2">
            <option value="">—</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </label>

        {/* Qo‘shimcha: avatar + tajriba */}
        <label className="md:col-span-2 block">
          <span className="mb-1 block text-sm text-slate-600">Avatar URL</span>
          <input name="avatarUrl" placeholder="https://.../doctor.jpg" className="w-full rounded border px-3 py-2" />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">Tajriba (yil)</span>
          <input name="experienceYears" type="number" inputMode="numeric" min={0} defaultValue={0} className="w-full rounded border px-3 py-2" />
          <span className="text-xs text-slate-500">Mini-app “+ years”ni o‘zi qo‘shadi.</span>
        </label>
      </div>

      <button type="submit" disabled={pending}
        className="rounded bg-emerald-700 px-4 py-2 font-medium text-white disabled:opacity-60">
        {pending ? "Saqlanmoqda…" : "Saqlash"}
      </button>
    </form>
  );
}