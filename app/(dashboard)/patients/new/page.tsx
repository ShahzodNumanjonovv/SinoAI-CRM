"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewPatient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = {
      firstName: String(fd.get("firstName") || "").trim(),
      lastName:  String(fd.get("lastName") || "").trim(),
      phone:     String(fd.get("phone") || "").trim(),
      birthDate: String(fd.get("birthDate") || ""),
      gender:    fd.get("gender") === "FEMALE" ? "FEMALE" : "MALE",
      address:   String(fd.get("address") || "").trim()
    };
    setLoading(true);
    const res = await fetch("/api/patients", {
      method: "POST",
      headers: { "Content-Type": "application/json"},
      body: JSON.stringify(payload)
    });
    setLoading(false);
    if (res.ok) {
      alert("Bemor yaratildi");
      router.push("/patients");
      router.refresh();
    } else {
      const j = await res.json().catch(() => ({}));
      alert(j?.error || "Xatolik");
    }
  }

  return (
    <div className="max-w-2xl rounded-xl border bg-white p-6">
      <h1 className="text-lg font-semibold mb-4">Bemor yaratish</h1>
      <form className="grid gap-3" onSubmit={onSubmit}>
        <input className="input" name="firstName" placeholder="Ism" required />
        <input className="input" name="lastName" placeholder="Familiya" required />
        <input className="input" name="phone" placeholder="Telefon raqami" defaultValue="+998" required />
        <input className="input" name="birthDate" placeholder="Tug‘ilgan sana" type="date" />
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm"><input type="radio" name="gender" value="MALE" defaultChecked /> Erkak</label>
          <label className="flex items-center gap-2 text-sm"><input type="radio" name="gender" value="FEMALE" /> Ayol</label>
        </div>
        <input className="input" name="address" placeholder="Manzil (ixtiyoriy)" />
        <button className="btn" disabled={loading}>{loading ? "Yaratilmoqda..." : "Bemor yaratish"}</button>
      </form>
    </div>
  );
}