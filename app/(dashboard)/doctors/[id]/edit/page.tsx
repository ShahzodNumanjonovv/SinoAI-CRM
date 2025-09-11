import { notFound } from "next/navigation";
import Link from "next/link";
import EditForm from "./EditForm";
import { prisma } from "@/lib/db"; // yoki fetch API varianti ishlatmoqchi bo‘lsangiz pastdagi variantni qo‘llang

// ⚠️ Next 15: params Promise bo‘ladi
export default async function EditDoctorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // ==== Variant A: Prisma bilan bevosita DB dan o‘qish (SSR) ====
  const doctor = await prisma.doctor.findUnique({
    where: { id },
    include: { department: { select: { id: true, name: true } } },
  });
  if (!doctor) notFound();

  const departments = await prisma.department.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  // ==== Variant B: Agar API orqali o‘qimoqchi bo‘lsangiz ====
  // const base = await getBaseUrl();
  // const res = await fetch(`${base}/api/doctors/${id}`, { cache: "no-store" });
  // if (!res.ok) notFound();
  // const { doctor, departments } = (await res.json()) as any;
  // if (!doctor) notFound();

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Shifokorni tahrirlash</h1>
        <Link href="/doctors" className="text-emerald-700 underline">
          Ortga
        </Link>
      </div>
      <EditForm defaultDoctor={doctor} departments={departments} />
    </div>
  );
}