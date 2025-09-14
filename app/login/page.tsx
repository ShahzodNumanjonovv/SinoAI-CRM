"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const r = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const j = await res.json();
      if (!res.ok || !j?.ok) {
        setErr(j?.message ?? "Login failed");
        return;
      }
      r.replace("/statistics"); // admin home’ingiz qayer bo‘lsa shuni qo‘ying
    } catch (e: any) {
      setErr(e?.message ?? "Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center bg-slate-100">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl bg-white shadow p-6 space-y-4"
      >
        <h1 className="text-xl font-semibold text-center">Sign in</h1>

        <label className="block">
          <div className="text-sm text-slate-600 mb-1">Email</div>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border px-3 py-2"
            placeholder="admin@SinoAI.com"
          />
        </label>

        <label className="block">
          <div className="text-sm text-slate-600 mb-1">Password</div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border px-3 py-2"
            placeholder="••••••••"
          />
        </label>

        {err && <div className="text-sm text-red-600">{err}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-[#6f8f8a] text-white py-2 font-medium
                     hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <p className="text-xs text-slate-500 text-center mt-2">
          Demo: admin@SinoAI.com / orzu123
        </p>
      </form>
    </main>
  );
}