import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { corsHeaders, corsNoContent, corsOk } from "@/lib/cors";

export async function OPTIONS() {
  return corsNoContent();
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date");         // kutiladi: 'YYYY-MM-DD'
  const doctorId = searchParams.get("doctorId") ?? undefined;

  if (!dateStr) {
    return NextResponse.json({ ok: false, message: "date required" }, { status: 400 });
  }

  // DB da biz sanani kun bo‘yicha saqlayapmiz -> bevosita tenglik yetadi
  const where: any = { date: new Date(dateStr) };
  if (doctorId) where.doctorId = doctorId;

  const doctors = await prisma.doctor.findMany({
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
    select: { id: true, firstName: true, lastName: true },
  });

  const appointments = await prisma.appointment.findMany({
    where,
    orderBy: [{ from: "asc" }],
    include: {
      doctor: { select: { id: true, firstName: true, lastName: true } },
      patient: { select: { firstName: true, lastName: true, phone: true } },
    },
  });

  return NextResponse.json({ ok: true, doctors, appointments });
}