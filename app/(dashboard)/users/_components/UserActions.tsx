"use client";

import { useEffect, useRef, useState, useTransition, useLayoutEffect } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";



type Props = { id: string };

export default function UserActions({ id }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState<string | null>(null);

  const btnRef = useRef<HTMLButtonElement | null>(null);

  // Portaldagi menyu uchun pozitsiya
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Tugma joylashuviga qarab menyuni fixed qilib joylaymiz
  const updatePosition = () => {
    const btn = btnRef.current;
    const menu = menuRef.current;
    if (!btn || !menu) return;

    const rect = btn.getBoundingClientRect();
    // Menyu kengligini bilish uchun avval ko‘rinmas qilib o‘lchaymiz
    const width = menu.offsetWidth || 176; // fallback 11rem ~ w-44
    const gap = 6; // tugmadan pastga kichik masofa

    const top = rect.bottom + gap;
    const left = rect.right - width;

    setCoords({
      top: Math.max(8, Math.round(top)), // oynadan chiqib ketmasin
      left: Math.max(8, Math.round(left)),
    });
  };

  // ochilganda yoki o‘lcham o‘zgarganda pozitsiyani yangilash
  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onScroll = () => updatePosition();
    const onResize = () => updatePosition();
    const onClickOutside = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuRef.current?.contains(t) || btnRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);

    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEsc);

    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const goEdit = () => {
    setOpen(false);
    router.push(`/users/${id}/edit`);
  };

  const onDelete = () => {
    setErr(null);
    if (!confirm("Foydalanuvchini o‘chirilsinmi?")) return;

    startTransition(async () => {
      try {
        const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          setErr(body?.message ?? "O‘chirishda xatolik");
          return;
        }
        setOpen(false);
        router.refresh();
      } catch {
        setErr("Tarmoq xatosi");
      }
    });
  };

  return (
    <div className="relative inline-block text-left">
      <button
  ref={btnRef}
  type="button"
  aria-haspopup="menu"
  aria-expanded={open}
  onClick={(e) => {
    e.stopPropagation();
    setOpen((v) => !v);
  }}
  className="grid h-8 w-8 place-items-center rounded hover:bg-slate-100 text-xl font-bold"
>
  ⋮
</button>

      {/* Portalga render qilinadigan menyu */}
      {open &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-orientation="vertical"
            // fixed + body portal → hech narsa kesmaydi
            className="fixed z-[9999] w-44 overflow-hidden rounded-xl border bg-white shadow-lg"
            style={{
              top: coords?.top ?? -9999,
              left: coords?.left ?? -9999,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* yon tomonda kichik uch (arrow) */}
            <div
              className="pointer-events-none absolute -right-1 top-3 h-3 w-3 rotate-45 border-r border-t bg-white"
              aria-hidden
            />

            <button
              type="button"
              onClick={onDelete}
              disabled={pending}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              <span>🗑️</span>
              <span>O‘chirish</span>
            </button>

            <button
              type="button"
              onClick={goEdit}
              className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-slate-100"
            >
              <span>✏️</span>
              <span>Tahrirlash</span>
            </button>
          </div>,
          document.body
        )}

      {err && <p className="mt-1 max-w-[220px] text-xs text-red-600">{err}</p>}
    </div>
  );
}