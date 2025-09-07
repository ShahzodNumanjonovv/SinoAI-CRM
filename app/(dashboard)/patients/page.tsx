import Link from "next/link";
import { getBaseUrl } from "@/lib/utils";
import SearchBox from "./_components/SearchBox"; // ⬅️ client komponent

type Patient = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender: string | null;
  createdAt: string;
};

async function getPatients(q: string) {
  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/patients?q=${encodeURIComponent(q)}`, {
    cache: "no-store",
  });
  if (!res.ok) return { patients: [] as Patient[] };
  return (await res.json()) as { ok: boolean; patients: Patient[] };
}

export default async function PatientsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = sp?.q ?? "";
  const { patients } = await getPatients(q);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Bemorlar</h1>
        <Link href="/patients/new" className="btn">Yangi</Link>
      </div>

      {/* Live qidiruv (debounced) */}
      <SearchBox defaultValue={q} />

      <div className="overflow-x-auto">
        <table className="min-w-[720px] w-full border rounded">
          <thead className="bg-gray-50">
            <tr className="[&>th]:text-left [&>th]:px-3 [&>th]:py-2">
              <th>Ism</th>
              <th>Familiya</th>
              <th>Telefon</th>
              <th>Jinsi</th>
              <th>Sana</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id} className="border-t [&>td]:px-3 [&>td]:py-2">
                <td>{p.firstName}</td>
                <td>{p.lastName}</td>
                <td>{p.phone}</td>
                <td>{p.gender ?? "-"}</td>
                <td>{new Date(p.createdAt).toLocaleDateString("uz-UZ")}</td>
              </tr>
            ))}
            {patients.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">
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