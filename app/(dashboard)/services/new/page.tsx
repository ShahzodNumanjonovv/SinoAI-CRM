import ServiceForm from "@/components/forms/service-form";
import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function NewServicePage() {
  const departments = await prisma.department.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="p-6 max-w-3xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Xizmat yaratish</h1>
        <Link href="/services" className="text-sm underline">← Ro‘yxatga qaytish</Link>
      </div>
      <div className="rounded border p-4 bg-white">
        <ServiceForm departments={departments} />
      </div>
    </div>
  );
}