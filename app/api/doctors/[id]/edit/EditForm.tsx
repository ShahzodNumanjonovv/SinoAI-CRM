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
};

export default function EditForm({
  defaultDoctor,
  departments,
}: {
  defaultDoctor: Doc;
  departments: Dept[];
}) {
  const r = useRouter();
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErr(null);
    const fd = new FormData(e.currentTarget);
    const payload = {
      code: (fd.get("code") as string) || null,
      firstName: fd.get("firstName"),
      lastName: fd.get("lastName"),
      speciality: fd.get("speciality"),
      roomNo: fd.get("roomNo") ? Number(fd.get("roomNo")) : null,
      priceUZS: Number(fd.get("priceUZS")),
      departmentId: (fd.get("departmentId") as string) || null,
    };

    start(async () => {
      const res = await fetch(`/api/doctors/${defaultDoctor.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErr(j?.message ?? "Saqlashda xatolik");
        return;
      }
      r.push("/doctors");
      r.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {err && <p className="text-red-600">{err}</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <div className="text-sm text-slate-600">#Kod (ixtiyoriy)</div>
          <input
            name="code"
            defaultValue={defaultDoctor.code ?? ""}
            className="w-full border rounded px-3 py-2"
          />
        </label>

        <label className="block">
          <div className="text-sm text-slate-600">Xona raqami</div>
          <input
            name="roomNo"
            type="number"
            defaultValue={defaultDoctor.roomNo ?? ""}
            className="w-full border rounded px-3 py-2"
          />
        </label>

        <label className="block">
          <div className="text-sm text-slate-600">Ismi</div>
          <input
            name="firstName"
            required
            defaultValue={defaultDoctor.firstName}
            className="w-full border rounded px-3 py-2"
          />
        </label>

        <label className="block">
          <div className="text-sm text-slate-600">Familiyasi</div>
          <input
            name="lastName"
            required
            defaultValue={defaultDoctor.lastName}
            className="w-full border rounded px-3 py-2"
          />
        </label>

        <label className="md:col-span-2 block">
          <div className="text-sm text-slate-600">Mutaxassisligi</div>
          <input
            name="speciality"
            required
            defaultValue={defaultDoctor.speciality}
            className="w-full border rounded px-3 py-2"
          />
        </label>

        <label className="block">
          <div className="text-sm text-slate-600">Narxi (UZS)</div>
          <input
            name="priceUZS"
            type="number"
            required
            defaultValue={defaultDoctor.priceUZS}
            className="w-full border rounded px-3 py-2"
          />
        </label>

        <label className="block">
          <div className="text-sm text-slate-600">Bo‘lim</div>
          <select
            name="departmentId"
            defaultValue={defaultDoctor.departmentId ?? ""}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">—</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="bg-emerald-700 text-white px-4 py-2 rounded disabled:opacity-60"
      >
        {pending ? "Saqlanmoqda…" : "Saqlash"}
      </button>
    </form>
  );
}