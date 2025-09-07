// app/(dashboard)/users/[id]/edit/page.tsx
import Link from "next/link";
import { getBaseUrl } from "@/lib/utils";
import EditForm from "./EditForm";

async function getUser(id: string) {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/users/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  const { user } = await res.json();
  return user as {
    id: string;
    firstName: string;
    lastName: string;
    phone: string;
    role: string;
  };
}

export default async function EditUserPage({ params }: { params: { id: string } }) {
  const user = await getUser(params.id);
  if (!user) {
    return (
      <div className="p-6">
        <p className="text-red-600">Foydalanuvchi topilmadi.</p>
        <Link href="/users" className="text-emerald-700 underline">Ortga</Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Foydalanuvchini yangilash</h1>
        <Link href="/users" className="text-emerald-700 underline">Ortga</Link>
      </div>

      <EditForm defaultUser={user} />
    </div>
  );
}