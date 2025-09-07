// app/(dashboard)/users/[id]/edit/page.tsx
import Link from "next/link";
import { getBaseUrl } from "@/lib/utils";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
};

async function getUser(id: string): Promise<User | null> {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/users/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return (data?.user ?? null) as User | null;
}

export default async function EditUserPage({
  params,
}: {
  params: { id: string }; // ✅ oddiy object
}) {
  const { id } = params; // ✅ endi Promise emas
  const user = await getUser(id);

  if (!user) {
    return (
      <div className="p-6 space-y-3">
        <p className="text-red-600">Foydalanuvchi topilmadi.</p>
        <Link href="/users" className="text-emerald-700 underline">
          ← Ro‘yxatga qaytish
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Foydalanuvchini yangilash</h1>
        <Link href="/users" className="btn">
          ← Ro‘yxat
        </Link>
      </div>

      <form className="mx-auto max-w-xl space-y-4 rounded border bg-white p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-sm text-slate-600">Ism</span>
            <input
              defaultValue={user.firstName}
              className="w-full rounded border px-3 py-2"
              name="firstName"
            />
          </label>
          <label className="space-y-1">
            <span className="text-sm text-slate-600">Familiya</span>
            <input
              defaultValue={user.lastName}
              className="w-full rounded border px-3 py-2"
              name="lastName"
            />
          </label>
        </div>

        <label className="block space-y-1">
          <span className="text-sm text-slate-600">Telefon</span>
          <input
            defaultValue={user.phone}
            className="w-full rounded border px-3 py-2"
            name="phone"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-sm text-slate-600">Rol</span>
          <select
            defaultValue={user.role}
            className="w-full rounded border px-3 py-2"
            name="role"
          >
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Menejer</option>
            <option value="DOCTOR">Shifokor</option>
            <option value="RECEPTION">Qabulxona xodimi</option>
          </select>
        </label>

        <button
          type="submit"
          className="rounded bg-emerald-700 px-4 py-2 text-white"
          disabled
        >
          Saqlash
        </button>
      </form>
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: { id: string }; // ✅ bu ham object
}) {
  return { title: `Foydalanuvchini tahrirlash · ${params.id}` };
}