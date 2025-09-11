// app/(dashboard)/doctors/[id]/edit/EditForm.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Dept = { id: string; name: string };
type Doc = {
  id: string;
  code: string | null;
  firstName: string;
  lastName: string;
  speciality: string;
  roomNo: number | null;
  priceUZS: number;
  departmentId?: string | null;
  // NEW:
  avatarUrl?: string | null;
  experienceYears?: number | null;
};

function toInt(v: FormDataEntryValue | null): number | null {
  if (v == null) return null;
  const s = String(v).trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export default function EditForm({
  defaultDoctor,
  departments,
}: {
  defaultDoctor: Doc;
  departments: Dept[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);

    const fd = new FormData(e.currentTarget);

    const code = String(fd.get("code") ?? "").trim();
    const firstName = String(fd.get("firstName") ?? "").trim();
    const lastName = String(fd.get("lastName") ?? "").trim();
    const speciality = String(fd.get("speciality") ?? "").trim();
    const roomNo = toInt(fd.get("roomNo"));
    const priceUZS = toInt(fd.get("priceUZS"));
    const departmentIdRaw = String(fd.get("departmentId") ?? "").trim();
    const departmentId = departmentIdRaw === "" ? null : departmentIdRaw;

    // NEW fields
    const avatarUrlRaw = String(fd.get("avatarUrl") ?? "").trim();
    const avatarUrl = avatarUrlRaw === "" ? null : avatarUrlRaw;
    const experienceYears = toInt(fd.get("experienceYears")) ?? 0;

    if (!firstName || !lastName || !speciality) {
      setErr("Majburiy maydonlar to‘ldirilmagan.");
      return;
    }
    if (priceUZS == null || priceUZS < 0) {
      setErr("Narx (UZS) noto‘g‘ri kiritildi.");
      return;
    }

    const payload = {
      code: code === "" ? null : code,
      firstName,
      lastName,
      speciality,
      roomNo,
      priceUZS,
      departmentId,
      // NEW:
      avatarUrl,
      experienceYears,
    };

    startTransition(async () => {
      try {
        const res = await fetch(`/api/doctors/${defaultDoctor.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const j = (await res.json().catch(() => ({}))) as { message?: string };
          setErr(j?.message ?? "Saqlashda xatolik.");
          return;
        }

        router.push("/doctors");
        router.refresh();
      } catch {
        setErr("Tarmoq xatosi. Iltimos, qayta urinib ko‘ring.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
            defaultValue={defaultDoctor.code ?? ""}
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
            defaultValue={defaultDoctor.roomNo ?? ""}
            className="w-full rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-600/30"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">Ismi</span>
          <input
            name="firstName"
            required
            defaultValue={defaultDoctor.firstName}
            className="w-full rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-600/30"
            autoComplete="given-name"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">Familiyasi</span>
          <input
            name="lastName"
            required
            defaultValue={defaultDoctor.lastName}
            className="w-full rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-600/30"
            autoComplete="family-name"
          />
        </label>

        <label className="md:col-span-2 block">
          <span className="mb-1 block text-sm text-slate-600">Mutaxassisligi</span>
          <input
            name="speciality"
            required
            defaultValue={defaultDoctor.speciality}
            className="w-full rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-600/30"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">Narxi (UZS)</span>
          <input
            name="priceUZS"
            type="number"
            inputMode="numeric"
            required
            min={0}
            defaultValue={defaultDoctor.priceUZS}
            className="w-full rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-600/30"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">Bo‘lim</span>
          <select
            name="departmentId"
            defaultValue={defaultDoctor.departmentId ?? ""}
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

        {/* NEW: Avatar URL (rasm manzili) */}
        <label className="md:col-span-2 block">
          <span className="mb-1 block text-sm text-slate-600">Avatar URL</span>
          <input
            name="avatarUrl"
            placeholder="https://.../doctor.jpg"
            defaultValue={defaultDoctor.avatarUrl ?? ""}
            className="w-full rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-600/30"
          />
          <span className="mt-1 block text-xs text-slate-500">
            Hozircha URL kiritiladi. Keyin fayl yuklash qo‘shamiz.
          </span>
        </label>

        {/* NEW: Tajriba (yil) – faqat raqam. UI’da “+ years” o‘zi qo‘shiladi */}
        <label className="block">
          <span className="mb-1 block text-sm text-slate-600">Tajriba (yil)</span>
          <input
            name="experienceYears"
            type="number"
            inputMode="numeric"
            min={0}
            defaultValue={defaultDoctor.experienceYears ?? 0}
            className="w-full rounded border px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-600/30"
          />
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