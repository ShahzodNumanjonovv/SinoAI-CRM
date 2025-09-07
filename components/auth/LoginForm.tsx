// components/auth/LoginForm.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import FullScreenLoader from "@/components/ui/FullScreenLoader";

export default function LoginForm() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Navigatsiya tezroq bo‘lishi uchun oldindan prefetch
  useEffect(() => {
    router.prefetch("/statistics");
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);

    if (!login.trim() || !password) {
      setErr("Login va parolni kiriting.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.message || "Login yoki parol noto‘g‘ri.");
      }

      // ✅ Muvaffaqiyat: chiroyli loaderni ko‘rsatamiz, keyin o‘tkazamiz
      setShowLoader(true);
      // biroz “smooth” effekt
      await new Promise((r) => setTimeout(r, 400));
      router.replace("/statistics");
    } catch (e: any) {
      setErr(e.message || "Xatolik yuz berdi.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {showLoader && <FullScreenLoader text="Tizimga kiritilmoqda..." />}

      <form onSubmit={onSubmit} className="space-y-4">
        {err && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {err}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm text-slate-600">Foydalanuvchi nomi</label>
          <input
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="Foydalanuvchi nomi"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none ring-emerald-100 focus:border-emerald-600 focus:ring"
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-slate-600">Parol</label>
          <div className="relative">
            <input
              type={show ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Parol"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 pr-10 outline-none ring-emerald-100 focus:border-emerald-600 focus:ring"
            />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-500 hover:bg-slate-100"
              aria-label={show ? "Parolni yashirish" : "Parolni ko‘rsatish"}
            >
              {show ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 15.815 7.244 19 12 19c1.74 0 3.384-.353 4.84-.98M6.228 6.228A10.451 10.451 0 0112 5c4.756 0 8.774 3.185 10.066 7-.182.692-.467 1.344-.832 1.942M6.228 6.228L3 3m3.228 3.228l11.544 11.544M21 21l-3-3" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none"
                     viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.644C3.423 7.51 7.36 5 12 5c4.756 0 8.577 2.51 9.964 6.678.07.214.07.452 0 .644C20.577 16.49 16.64 19 12 19c-4.64 0-8.577-2.51-9.964-6.678z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-emerald-600 py-2 text-center text-white font-semibold hover:bg-emerald-700 disabled:opacity-60"
        >
          {submitting ? (
            <span className="inline-flex items-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="9" className="stroke-white/30" strokeWidth="4" fill="none" />
                <path d="M21 12a9 9 0 0 0-9-9" className="stroke-white" strokeWidth="4" fill="none" />
              </svg>
              Kirilmoqda...
            </span>
          ) : (
            "Kirish"
          )}
        </button>
      </form>
    </>
  );
}