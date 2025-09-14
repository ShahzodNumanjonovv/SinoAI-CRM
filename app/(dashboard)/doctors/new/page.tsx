// app/(dashboard)/doctors/new/page.tsx
import Link from "next/link";
import { prisma } from "@/lib/db";
import NewDoctorForm from "./NewDoctorForm";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function NewDoctorPage() {
  noStore(); // ✅ faqat funksiya ichida
   
  const departments = await prisma.department.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Shifokor qo‘shish</h1>
        <Link href="/doctors" className="text-emerald-700 underline">
          ← Ro‘yxatga qaytish
        </Link>
      </div>

      <NewDoctorForm departments={departments} />
    </div>
  );
}