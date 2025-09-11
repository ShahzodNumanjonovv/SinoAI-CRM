import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { corsHeaders, corsNoContent, corsOk } from "@/lib/cors";

export async function OPTIONS() {
  return corsNoContent();
}

type Body = {
  doctorId: string;
  date: string;
  from: string;
  to: string;
  firstName: string;
  lastName?: string;
  phone: string;
  gender?: "MALE" | "FEMALE";
  note?: string;
};

export async function POST(req: Request) {
  try {
    const b = (await req.json()) as Body;
    if (!b?.doctorId || !b?.date || !b?.from || !b?.to || !b?.firstName || !b?.phone) {
      return corsOk({ ok: false, message: "Missing fields" }, 400);
    }

    const last = (b.lastName ?? "").trim();
    const dateUtc = new Date(`${b.date}T00:00:00.000Z`);
    const genderVal = b.gender ?? "MALE";       // <-- default

    const doctor = await prisma.doctor.findUnique({
      where: { id: b.doctorId },
      select: { id: true, firstName: true, lastName: true },
    });
    if (!doctor) return corsOk({ ok: false, message: "Doctor topilmadi" }, 404);

    const busy = await prisma.appointment.findFirst({
      where: { doctorId: b.doctorId, date: dateUtc, from: b.from },
      select: { id: true },
    });
    if (busy) return corsOk({ ok: false, message: "Bu vaqt allaqachon band" }, 409);

    const patient = await prisma.patient.upsert({
      where: { phone: b.phone },
      update: {
        firstName: b.firstName,
        lastName: last,
        ...(b.gender ? { gender: b.gender } : {}), // ixtiyoriy
      },
      create: {
        firstName: b.firstName,
        lastName: last,
        phone: b.phone,
        gender: genderVal,                         // <-- majburiy
      },
      select: { id: true, firstName: true, lastName: true, phone: true },
    });

    const appt = await prisma.appointment.create({
      data: {
        doctorId: doctor.id,
        patientId: patient.id,
        date: dateUtc,
        from: b.from,
        to: b.to,
        note: b.note ?? null,
        status: "PENDING",
        source: "miniapp",
      },
      include: {
        doctor: { select: { id: true, firstName: true, lastName: true } },
        patient: { select: { id: true, firstName: true, lastName: true, phone: true } },
      },
    });

    return corsOk({ ok: true, appointment: appt }, 201);
  } catch (e) {
    console.error("Miniapp/book POST error:", e);
    return new NextResponse(JSON.stringify({ ok: false, message: "Internal error" }), {
      status: 500,
      headers: corsHeaders({ "Content-Type": "application/json" }),
    });
  }
}