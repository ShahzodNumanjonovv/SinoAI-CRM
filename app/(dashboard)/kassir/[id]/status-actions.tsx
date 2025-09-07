// app/(dashboard)/kassir/[id]/status-actions.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function StatusActions({
  id,
  current,
}: {
  id: string;
  current: "DRAFT" | "UNPAID" | "PAID" | "CANCELLED";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  async function setStatus(status: "DRAFT" | "UNPAID" | "PAID" | "CANCELLED") {
    try {
      setLoading(status);
      const res = await fetch(`/api/invoices/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        alert(j?.error ?? "Xatolik");
        return;
      }
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex gap-2">
      <button
        disabled={loading !== null || current === "UNPAID"}
        onClick={() => setStatus("UNPAID")}
        className="btn"
        title="To‘lanmagan holatga qaytarish"
      >
        {loading === "UNPAID" ? "..." : "UNPAID"}
      </button>

      <button
        disabled={loading !== null || current === "PAID"}
        onClick={() => setStatus("PAID")}
        className="btn bg-emerald-700 text-white hover:bg-emerald-800"
        title="To‘langan deb belgilash"
      >
        {loading === "PAID" ? "..." : "PAID"}
      </button>

      <button
        disabled={loading !== null || current === "CANCELLED"}
        onClick={() => setStatus("CANCELLED")}
        className="btn bg-rose-600 text-white hover:bg-rose-700"
        title="Bekor qilingan deb belgilash"
      >
        {loading === "CANCELLED" ? "..." : "CANCELLED"}
      </button>

      <button
        disabled={loading !== null || current === "DRAFT"}
        onClick={() => setStatus("DRAFT")}
        className="btn"
        title="Qoralama holatiga o‘tkazish"
      >
        {loading === "DRAFT" ? "..." : "DRAFT"}
      </button>
    </div>
  );
}