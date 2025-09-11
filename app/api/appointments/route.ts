import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ ok: false, message: "Bad JSON" }, { status: 400 });

  const { doctorId, date, start, end, patientId, patientName, patientPhone, note } = body;

  if (!doctorId || !date || !start || !end) {
    return NextResponse.json({ ok: false, message: "doctorId, date, start, end kerak" }, { status: 400 });
  }

  // To‘qnashuv tekshiruvi (oddiy)
  const clash = await prisma.appointment.findFirst({
    where: {
      doctorId,
      status: { not: "CANCELLED" },
      OR: [
        { start: { lt: new Date(end) }, end: { gt: new Date(start) } }, // overlap
      ],
    },
  });
  if (clash) {
    return NextResponse.json({ ok: false, message: "Bu vaqt band" }, { status: 409 });
  }

  const created = await prisma.appointment.create({
    data: {
      doctorId,
      date: new Date(`${date}T00:00:00.000Z`),
      start: new Date(start),
      end: new Date(end),
      patientId: patientId ?? null,
      patientName: patientName ?? null,
      patientPhone: patientPhone ?? null,
      note: note ?? null,
    },
  });

  return NextResponse.json({ ok: true, appointment: created });
}