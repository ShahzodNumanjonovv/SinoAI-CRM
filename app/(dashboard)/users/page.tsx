// app/(dashboard)/users/page.tsx
import Link from "next/link";
import { getBaseUrl } from "@/lib/utils";
import SearchBox from "@/components/SearchBox";
import UserActions from "./_components/UserActions";

type UserRow = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: string;
  createdAt: string;
};

async function getData(q: string): Promise<UserRow[]> {
  const base = await getBaseUrl();
  const url = `${base}/api/users?q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.users ?? []) as UserRow[];
}

export default async function UsersPage({
  searchParams
}: {
  // Next 15: Promise bo‘lib keladi
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = sp?.q ?? "";
  const users = await getData(q);

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Foydalanuvchilar</h1>
        <Link
          href="/users/new"
          className="rounded bg-emerald-700 px-3 py-2 text-white"
          prefetch={false}
        >
          Yangi
        </Link>
      </div>

      <SearchBox
        placeholder="Qidiruv (ism, telefon, rol)..."
        initialValue={q}
        className="w-80 rounded border px-3 py-2"
      />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] rounded border">
          <thead className="bg-gray-50 text-left text-slate-600">
            <tr>
              <th className="px-3 py-2">Ism</th>
              <th className="px-3 py-2">Familiya</th>
              <th className="px-3 py-2">Telefon</th>
              <th className="px-3 py-2">Rol</th>
              <th className="px-3 py-2">Sana</th>
              <th className="px-3 py-2 text-right">Amallar</th>
            </tr>
          </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="px-3 py-2 font-medium">
                <Link
                  href={`/users/${u.id}/edit`}
                  className="hover:underline"
                  title="Tahrirlash"
                  prefetch={false}
                >
                  {u.firstName}
                </Link>
              </td>
              <td className="px-3 py-2">{u.lastName}</td>
              <td className="px-3 py-2">{u.phone}</td>
              <td className="px-3 py-2">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium">
                  {u.role}
                </span>
              </td>
              <td className="px-3 py-2">
                {new Date(u.createdAt).toLocaleDateString()}
              </td>
              <td className="px-3 py-2">
                <div className="relative flex justify-end">
                  <UserActions id={u.id} />
                </div>
              </td>
            </tr>
          ))}

          {users.length === 0 && (
            <tr>
              <td colSpan={6} className="px-3 py-6 text-center text-gray-500">
                Hech narsa topilmadi
              </td>
            </tr>
          )}
        </tbody>
        </table>
      </div>
    </div>
  );
}