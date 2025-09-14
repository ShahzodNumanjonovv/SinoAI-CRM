"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { uploadAvatar } from "@/lib/storage";

const SPECIALITIES = ["Kardiolog", "Teropevt", "Ginekolog", "Urolog"] as const;

type Dept = { id: string; name: string };

function toInt(v: FormDataEntryValue | null): number | null {
  if (v == null) return null;
  const s = String(v).trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export default function NewDoctorForm({ departments }: { departments: Dept[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);

    const fd = new FormData(e.currentTarget);

    const payload = {
      code: String(fd.get("code") ?? "").trim() || null,
      firstName: String(fd.get("firstName") ?? "").trim(),
      lastName: String(fd.get("lastName") ?? "").trim(),
      speciality: String(fd.get("speciality") ?? "").trim(),
      roomNo: toInt(fd.get("roomNo")),
      priceUZS: toInt(fd.get("priceUZS")) ?? 0,
      departmentId: (String(fd.get("departmentId") ?? "").trim() || null) as string | null,
      // mini-app qo‘shimcha
      avatarUrl: String(fd.get("avatarUrl") ?? "").trim() || null,
      experience: toInt(fd.get("experienceYil")) ?? 0,
    };

    if (!payload.firstName || !payload.lastName || !payload.speciality) {
      setErr("Majburiy maydonlar to‘ldirilmagan."); 
      return;
    }
    if (!SPECIALITIES.includes(payload.speciality as (typeof SPECIALITIES)[number])) {
      setErr("Faqat: Kardiolog | Teropevt | Ginekolog | Urolog dan birini tanlang."); 
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/doctors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const j = await res.json().catch(() => ({}));
        if (!res.ok || j?.ok === false) {
          throw new Error(j?.message || "Saqlashda xato.");
        }
        router.push("/doctors");
        router.refresh();
      } catch (e: any) {
        setErr(e?.message || "Tarmoq xatosi. Qayta urinib ko‘ring.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {err && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {err}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">#Kod (ixtiyoriy)</span>
          <input
            name="code"
            className="w-full rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-600/30"
            autoComplete="off"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">Xona raqami</span>
          <input
            name="roomNo"
            type="number"
            inputMode="numeric"
            className="w-full rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-600/30"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">Ismi</span>
          <input
            name="firstName"
            required
            className="w-full rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-600/30"
            autoComplete="given-name"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">Familiyasi</span>
          <input
            name="lastName"
            required
            className="w-full rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-600/30"
            autoComplete="family-name"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">Mutaxassisligi</span>
          <select
            name="speciality"
            required
            className="w-full rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-600/30"
          >
            <option value="">— Tanlang —</option>
            {SPECIALITIES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">Narxi (UZS)</span>
          <input
            name="priceUZS"
            type="number"
            inputMode="numeric"
            min={0}
            required
            className="w-full rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-600/30"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">Bo‘lim</span>
          <select
            name="departmentId"
            className="w-full rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-600/30"
          >
            <option value="">—</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>

        {/* Avatar yuklash */}
        <label className="block md:col-span-2">
          <span className="mb-1 block text-sm text-slate-600">Avatar (rasm yuklash)</span>
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                try {
                  const url = await uploadAvatar(file);
                  if (url) {
                    setPreview(url);
                    const hidden = document.querySelector<HTMLInputElement>('input[name="avatarUrl"]');
                    if (hidden) hidden.value = url;
                  }
                } catch (err: any) {
                  setErr(err?.message || "Rasm yuklashda xatolik.");
                }
              }}
            />
            {preview && (
              <img
                src={preview}
                alt="avatar preview"
                className="h-16 w-16 rounded-full object-cover border"
              />
            )}
          </div>
          <input type="hidden" name="avatarUrl" />
        </label>

        {/* Tajriba (yil) */}
        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">Tajriba (yil)</span>
          <input
            name="experienceYil"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={0}
            className="w-full rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-600/30"
          />
          <span className="mt-1 block text-xs text-slate-500">
            Mini-app “+ Yil” ni o‘zi ko‘rsatadi.
          </span>
        </label>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-emerald-700 px-4 py-2 font-medium text-white transition-opacity disabled:opacity-60"
      >
        {pending ? "Saqlanmoqda…" : "Saqlash"}
      </button>
    </form>
  );
}