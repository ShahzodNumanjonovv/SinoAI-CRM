// app/(dashboard)/users/new/page.tsx
"use client";

import { useState } from "react";

export default function NewUserPage() {
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.currentTarget);
    const payload = Object.fromEntries(form.entries());
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.ok) alert(data.error || "Xatolik");
      else alert("Yaratildi!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="p-6 space-y-3 max-w-md">
      <input name="firstName" placeholder="Ism" className="border p-2 w-full" />
      <input name="lastName" placeholder="Familiya" className="border p-2 w-full" />
      <input name="phone" placeholder="+998..." className="border p-2 w-full" />
      <select name="role" className="border p-2 w-full">
        <option value="RECEPTION">RECEPTION</option>
        <option value="DOCTOR">DOCTOR</option>
        <option value="MANAGER">MANAGER</option>
        <option value="ADMIN">ADMIN</option>
      </select>
      <input name="password" type="password" placeholder="Parol" className="border p-2 w-full" />
      <button disabled={loading} className="bg-emerald-600 text-white px-4 py-2 rounded">
        {loading ? "Yaratilmoqda..." : "Yaratish"}
      </button>
    </form>
  );
}