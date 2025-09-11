// app/(dashboard)/doctors/_components/DoctorActions.tsx
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

export default function DoctorActions({ id }: { id: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const wrapRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  // Ekran chetiga urilmaslik uchun yon tomonni avtomatik tanlash
  const [alignRight, setAlignRight] = useState(false);
  useEffect(() => {
    if (!open || !btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    // dropdown ~260px. Agar o‘ng tomonda joy yetmasa, o‘ngdan chiqarsin
    setAlignRight(rect.left + 260 > window.innerWidth - 16);
  }, [open]);

  // tashqariga bosilganda yopish
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const onDelete = () => {
    if (!confirm("Shifokorni o‘chirishni tasdiqlaysizmi?")) return;
    setErr(null);
    start(async () => {
      const res = await fetch(`/api/doctors/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErr(j?.message ?? "O‘chirishda xatolik");
        return;
      }
      setOpen(false);
      router.refresh();
    });
  };

  return (
    <div ref={wrapRef} className="relative inline-block text-left">
      <button
        ref={btnRef}
        type="button"
        aria-label="Amallar"
        className="grid h-9 w-9 place-items-center rounded-md bg-slate-100 hover:bg-slate-200"
        onClick={() => setOpen(v => !v)}
      >
        <span className="inline-block leading-none text-xl select-none">⋮</span>
      </button>

      {open && (
        <div
          className={`absolute top-[calc(100%+8px)] z-20 min-w-[220px] max-w-[min(90vw,320px)] rounded-2xl border bg-white p-2 shadow-xl
            ${alignRight ? "right-0" : "left-0"}`}
          onMouseLeave={() => setOpen(false)}
        >
          {/* arrow */}
          <span
            className={`absolute -top-2 block h-4 w-4 rotate-45 rounded-sm bg-white border-l border-t
              ${alignRight ? "right-5" : "left-5"}`}
          />

          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            🗑️ <span>O‘chirish</span>
          </button>

          <Link
            href={`/doctors/${id}/edit`}
            className="mt-1 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left hover:bg-slate-100"
            onClick={() => setOpen(false)}
          >
            ✏️ <span>Tahrirlash</span>
          </Link>

          {err && <p className="px-4 pt-2 text-xs text-red-600">{err}</p>}
        </div>
      )}
    </div>
  );
}