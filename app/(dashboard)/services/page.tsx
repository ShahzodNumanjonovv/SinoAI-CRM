// app/(dashboard)/services/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/db";
import SearchBox from "@/components/SearchBox";

async function getData(q: string) {
  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { code: { contains: q } },
        ],
      }
    : undefined;

  return prisma.service.findMany({
    where,
    include: { department: true },
    orderBy: [{ code: "asc" }, { name: "asc" }],
    take: 200,
  });
}

export default async function ServicesPage({
  searchParams,
}: {
  // Next 15: Promise ko‘rinishida keladi
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = sp?.q ?? "";
  const services = await getData(q);

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Xizmatlar</h1>
        <Link href="/services/new" className="bg-green-700 text-white px-4 py-2 rounded">
          + Yangi Xizmat
        </Link>
      </div>

      {/* Debounced avto-qidiruv (2 ta belgi yozilgach ishga tushadi) */}
      <SearchBox
        placeholder="Qidirish (kod yoki nom)..."
        initialValue={q}
        className="w-80 rounded border p-2"
      />

      <div className="mt-4 rounded border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Kod</th>
              <th className="p-3 text-left">Nomi</th>
              <th className="p-3 text-right">Narx (UZS)</th>
              <th className="p-3 text-left">Bo‘lim</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id} className="border-t">
                <td className="p-3">#{s.code}</td>
                <td className="p-3">{s.name}</td>
                <td className="p-3 text-right">
                  {new Intl.NumberFormat("uz-UZ").format(s.priceUZS)}
                </td>
                <td className="p-3">{s.department?.name ?? "-"}</td>
              </tr>
            ))}

            {services.length === 0 && (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">
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