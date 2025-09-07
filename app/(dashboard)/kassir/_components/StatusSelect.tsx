"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

type Props = {
  id: string;
  value: "DRAFT" | "UNPAID" | "PAID" | "CANCELLED";
};

export default function StatusSelect({ id, value }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newStatus = e.target.value;
    await fetch(`/api/invoices/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });

    // Jadvalni yangilash
    startTransition(() => router.refresh());
  }

  return (
    <select
      defaultValue={value}
      onChange={handleChange}
      disabled={isPending}
      className="border rounded px-2 py-1 text-sm"
    >
      <option value="UNPAID">UNPAID</option>
      <option value="PAID">PAID</option>
      <option value="DRAFT">DRAFT</option>
      <option value="CANCELLED">CANCELLED</option>
    </select>
  );
}