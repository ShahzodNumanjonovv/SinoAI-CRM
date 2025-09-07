// components/forms/user-form.tsx
"use client";

import { useState } from "react";

const roles = [
  { value: "ADMIN", label: "Admin" },
  { value: "MANAGER", label: "Manager" },
  { value: "DOCTOR", label: "Shifokor" },
  { value: "RECEPTION", label: "Registrator" },
];

export default function UserForm() {
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      firstName: String(fd.get("firstName") || ""),
      lastName: String(fd.get("lastName") || ""),
      phone: String(fd.get("phone") || ""),
      role: String(fd.get("role") || "RECEPTION"),
      password: String(fd.get("password") || ""),
    };

    try {
      setLoading(true);
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Xatolik");
      alert("Foydalanuvchi yaratildi");
      window.location.href = "/users";
    } catch (err: any) {
      alert(err.message || "Xatolik");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-xl">
      <div>
        <label className="block text-sm mb-1">Ism</label>
        <input name="firstName" className="w-full border rounded px-3 py-2" required />
      </div>
      <div>
        <label className="block text-sm mb-1">Familiya</label>
        <input name="lastName" className="w-full border rounded px-3 py-2" required />
      </div>
      <div>
        <label className="block text-sm mb-1">Telefon</label>
        <input name="phone" placeholder="+998..." className="w-full border rounded px-3 py-2" required />
      </div>
      <div>
        <label className="block text-sm mb-1">Rol</label>
        <select name="role" className="w-full border rounded px-3 py-2">
          {roles.map(r => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm mb-1">Parol</label>
        <input type="password" name="password" className="w-full border rounded px-3 py-2" required />
      </div>

      <button
        disabled={loading}
        className="bg-emerald-700 text-white px-4 py-2 rounded disabled:opacity-60"
      >
        {loading ? "Yaratilmoqda..." : "Yaratish"}
      </button>
    </form>
  );
}