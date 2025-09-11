import { notFound } from "next/navigation";
import Link from "next/link";
import { getBaseUrl } from "@/lib/utils";
import EditForm from "./EditForm";

export default async function EditDoctorPage({
  params,
}: {
  // Next 15: params PROMISE
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const base = await getBaseUrl();
  const res = await fetch(`${base}/api/doctors/${id}`, { cache: "no-store" });
  if (!res.ok) notFound();
  const { doctor, departments } = (await res.json()) as any;
  if (!doctor) notFound();

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