// app/(dashboard)/doctors/page.tsx
import Link from "next/link";
import { headers } from "next/headers";
import { getBaseUrl } from "@/lib/utils";
import SearchBox from "@/components/SearchBox";
import DoctorActions from "./_components/DoctorActions";

type DoctorRow = {
  id: string;
  code: string | null;
  firstName: string;
  lastName: string;
  speciality: string;
  roomNo: number | null;
  priceUZS: number;
  department?: { name: string } | null;
  createdAt: string;
};

async function getData(q: string): Promise<DoctorRow[]> {
  const base = await getBaseUrl();
  const cookie = (await headers()).get("cookie") ?? ""; // <- auth cookie’ni forward
  const qs = q ? `?q=${encodeURIComponent(q)}` : "";
  const url = `${base}/api/doctors${qs}`;

  const res = await fetch(url, {
    cache: "no-store",
    headers: { cookie },
  });

  // JSON guard: agar HTML qaytsa yoki xato bo‘lsa — bo‘sh ro‘yxat
  const ct = res.headers.get("content-type") || "";
  if (!res.ok || !ct.includes("application/json")) return [];

  try {
    const data = await res.json();
    return (data.doctors ?? []) as DoctorRow[];
  } catch {
    return [];
  }
}

export default async function DoctorsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = sp?.q ?? "";
  const doctors = await getData(q);
  const nf = new Intl.NumberFormat("uz-UZ");

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Shifokorlar</h1>
        <Link
          href="/doctors/new"
          className="bg-emerald-700 text-white px-3 py-2 rounded"
        >
          + Shifokor qo‘shish
        </Link>
      </div>

      <SearchBox
        placeholder="Qidiruv (ism, mutaxassislik, kod, xona raqami)..."
        initialValue={q}
        className="border rounded px-3 py-2 w-96"
      />

      <div className="rounded border overflow-visible">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="[&>th]:px-3 [&>th]:py-2">
              <th className="text-left">#Kod</th>
              <th className="text-left">F.I.Sh</th>
              <th className="text-left">Mutaxassisligi</th>
              <th className="text-left">Xona</th>
              <th className="text-left">Narxi (UZS)</th>
              <th className="text-left">Bo‘lim</th>
              <th className="text-right">Amallar</th>
            </tr>
          </thead>

          <tbody>
            {doctors.map((d) => (
              <tr key={d.id} className="border-t [&>td]:px-3 [&>td]:py-2">
                <td>{d.code ?? "-"}</td>
                <td>
                  {d.firstName} {d.lastName}
                </td>
                <td>{d.speciality}</td>
                <td>{d.roomNo ?? "-"}</td>
                <td className="tabular-nums">{nf.format(d.priceUZS)}</td>
                <td>{d.department?.name ?? "-"}</td>
                <td className="text-right">
                  <DoctorActions id={d.id} align="left" />
                </td>
              </tr>
            ))}

            {doctors.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">
                  Ma’lumot topilmadi
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}