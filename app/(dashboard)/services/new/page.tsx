// app/(dashboard)/services/new/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/db";
import NewServiceForm from "./NewServiceForm";

import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NewServicePage() {
  // Build-time prerender’ni o‘chirib, so‘rovni faqat runtime’da bajarish
  noStore();

  let departments: { id: string; name: string }[] = [];
  try {
    departments = await prisma.department.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    });
  } catch {
    // prod build paytida DB ulanish bo‘lmasa ham sahifa ochila versin
    departments = [];
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Xizmat qo‘shish</h1>
        <Link href="/services" className="btn">Orqaga</Link>
      </div>

      {departments.length === 0 && (
        <div className="rounded border bg-amber-50 text-amber-900 p-3 text-sm">
          Bo‘limlar topilmadi yoki ma’lumotlar bazasiga ulana olmadi. Baribir
          form ochiladi, lekin <b>Department</b> ro‘yxati bo‘sh bo‘ladi.
        </div>
      )}

      <NewServiceForm departments={departments} />
    </div>
  );
}