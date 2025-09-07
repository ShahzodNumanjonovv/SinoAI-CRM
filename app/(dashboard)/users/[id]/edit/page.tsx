// app/(dashboard)/users/[id]/edit/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import EditForm from "./EditForm";

export const dynamic = "force-dynamic"; // Vercel/SSRda statiklashmasin

type User = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
};

async function getUser(id: string): Promise<User | null> {
  // Server Component ichida nisbiy yo‘lni ishlatamiz – host bilan bog‘liq muammo bo‘lmaydi
  const res = await fetch(`/api/users/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  return (data?.user as User) ?? null;
}

export default async function EditUserPage({
  params,
}: {
  // ✅ Next 15: params – Promise
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;         // ✅ majburiy await
  const user = await getUser(id);
  if (!user) notFound();

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Foydalanuvchini yangilash</h1>
        <Link href="/users" className="text-emerald-700 underline">
          ← Ortga
        </Link>
      </div>

      <EditForm defaultUser={user} />
    </div>
  );
}

// (ixtiyoriy) sarlavha
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return { title: `Foydalanuvchini tahrirlash • ${id}` };
}