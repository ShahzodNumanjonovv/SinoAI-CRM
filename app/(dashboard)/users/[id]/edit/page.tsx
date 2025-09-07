// app/(dashboard)/users/[id]/edit/page.tsx
import { getBaseUrl } from "@/lib/utils";
import Link from "next/link";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
};

async function getUser(id: string): Promise<User | null> {
  const base = await getBaseUrl();
  const r = await fetch(`${base}/api/users/${id}`, { cache: "no-store" });
  if (!r.ok) return null;
  const j = await r.json();
  return j?.user ?? null;
}

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;          // <- MUHIM: params ni await qiling
  const user = await getUser(id);

  if (!user) {
    return (
      <div className="p-6">
        <p>Foydalanuvchi topilmadi.</p>
        <Link href="/users" className="text-emerald-700 underline">
          ← Orqaga
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Foydalanuvchini tahrirlash</h1>
      {/* form… (mavjud formangizni shu yerga qo'ying) */}
      <pre className="text-sm bg-slate-50 p-3 rounded">{JSON.stringify(user, null, 2)}</pre>
    </div>
  );
}