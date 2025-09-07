"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function EditForm({ defaultUser }: { defaultUser: any }) {
  const router = useRouter();
  const [values, setValues] = useState({
    firstName: defaultUser.firstName ?? "",
    lastName: defaultUser.lastName ?? "",
    phone: defaultUser.phone ?? "",
    role: defaultUser.role ?? "MANAGER",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true); setError(null);

    const r = await fetch(`/api/users/${defaultUser.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    setSaving(false);
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      setError(j?.error || "Saqlashda xatolik");
      return;
    }
    router.push("/users");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded border p-4 bg-white">
      {error && (
        <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1">
          <span className="text-sm text-slate-600">Ism</span>
          <input
            className="w-full rounded border px-3 py-2"
            value={values.firstName}
            onChange={(e) => setValues(v => ({ ...v, firstName: e.target.value }))}
          />
        </label>
        <label className="space-y-1">
          <span className="text-sm text-slate-600">Familiya</span>
          <input
            className="w-full rounded border px-3 py-2"
            value={values.lastName}
            onChange={(e) => setValues(v => ({ ...v, lastName: e.target.value }))}
          />
        </label>
      </div>

      <label className="space-y-1 block">
        <span className="text-sm text-slate-600">Telefon</span>
        <input
          className="w-full rounded border px-3 py-2"
          value={values.phone}
          onChange={(e) => setValues(v => ({ ...v, phone: e.target.value }))}
        />
      </label>

      <label className="space-y-1 block">
        <span className="text-sm text-slate-600">Rol</span>
        <select
          className="w-full rounded border px-3 py-2"
          value={values.role}
          onChange={(e) => setValues(v => ({ ...v, role: e.target.value }))}
        >
          <option value="ADMIN">Admin</option>
          <option value="MANAGER">Menejer</option>
          <option value="DOCTOR">Shifokor</option>
          <option value="RECEPTION">Qabulxona xodimi</option>
        </select>
      </label>

      <button
        type="submit"
        disabled={saving}
        className="rounded bg-emerald-700 px-4 py-2 font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        {saving ? "Saqlanmoqda..." : "Saqlash"}
      </button>
    </form>
  );
}