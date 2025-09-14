// app/api/miniapp/book/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { corsHeaders, corsNoContent, corsOk } from "@/lib/cors";

type BodyHoldFlow = {
  holdId: string;               // 👈 mini-app tanlagan slot uchun hold id
  firstName: string;
  lastName?: string;
  phone: string;
  gender?: "MALE" | "FEMALE";
  note?: string;
};

// (ixtiyoriy) eski payloadni ham qo‘llab-quvvatlab turamiz
type BodyLegacy = {
  doctorId: string;
  date: string; // "YYYY-MM-DD"
  from: string; // "HH:mm"
  to: string;   // "HH:mm"
  firstName: string;
  lastName?: string;
  phone: string;
  gender?: "MALE" | "FEMALE";
  note?: string;
};

export async function OPTIONS() {
  return corsNoContent();
}

export async function POST(req: Request) {
  try {
    const b = (await req.json()) as Partial<BodyHoldFlow & BodyLegacy>;
    const firstName = (b.firstName ?? "").trim();
    const lastName = (b.lastName ?? "").trim();
    const phone = (b.phone ?? "").trim();
    const gender = (b.gender ?? "MALE") as "MALE" | "FEMALE";
    const note = (b.note ?? null) as string | null;

    // --------- 1) HOLD-BASED BOOKING (yangi oqim) ----------
    if (b.holdId) {
      if (!firstName || !phone) {
        return corsOk({ ok: false, message: "Required fields missing" }, 400);
      }

      try {
        const result = await prisma.$transaction(async (tx) => {
          // a) hold’ni topish va tekshirish
          const hold = await tx.appointmentHold.findUnique({
            where: { id: b.holdId! },
          });
          if (!hold) throw new Error("Hold not found");
          if (hold.expiresAt <= new Date()) throw new Error("Hold expired");

          // b) bemorni upsert
          const patient = await tx.patient.upsert({
            where: { phone },
            update: { firstName, lastName, gender },
            create: { firstName, lastName, phone, gender },
            select: { id: true },
          });

          // c) appointment yaratish (unique: doctorId+date+from)
          const appt = await tx.appointment.create({
            data: {
              date: hold.date, // Date
              from: hold.from,
              to: hold.to,
              note,
              doctorId: hold.doctorId,
              patientId: patient.id,
              status: "PENDING",
              source: "miniapp",
            },
            include: {
              doctor: { select: { id: true, firstName: true, lastName: true } },
              patient: { select: { id: true, firstName: true, lastName: true, phone: true } },
            },
          });

          // d) hold’ni tozalash
          await tx.appointmentHold.delete({ where: { id: hold.id } });

          return appt;
        });

        return corsOk({ ok: true, appointment: result }, 201);
      } catch (e: any) {
        // Prisma unique violation => slot allaqachon band
        if (e?.code === "P2002") {
          return corsOk({ ok: false, message: "Slot already booked" }, 409);
        }
        const msg = e?.message || "Booking failed";
        return corsOk({ ok: false, message: msg }, msg.includes("Hold") ? 410 : 400);
      }
    }

    // --------- 2) LEGACY FLOW (holdsiz) — ixtiyoriy ---------
    // Agar mini-app hali holdId yubormayotgan bo‘lsa, vaqtincha ishlayveradi.
    if (!b.doctorId || !b.date || !b.from || !b.to || !firstName || !phone) {
      return corsOk({ ok: false, message: "Missing fields" }, 400);
    }

    const dateUtc = new Date(`${b.date}T00:00:00.000Z`);

    // doktor tekshiruvi
    const doctor = await prisma.doctor.findUnique({
      where: { id: b.doctorId },
      select: { id: true },
    });
    if (!doctor) return corsOk({ ok: false, message: "Doctor not found" }, 404);

    // busy check
    const busy = await prisma.appointment.findFirst({
      where: { doctorId: doctor.id, date: dateUtc, from: b.from },
      select: { id: true },
    });
    if (busy) return corsOk({ ok: false, message: "This time is already booked" }, 409);

    // patient upsert
    const patient = await prisma.patient.upsert({
      where: { phone },
      update: { firstName, lastName, gender },
      create: { firstName, lastName, phone, gender },
      select: { id: true, firstName: true, lastName: true, phone: true },
    });

    // appointment create
    const appt = await prisma.appointment.create({
      data: {
        doctorId: doctor.id,
        patientId: patient.id,
        date: dateUtc,
        from: b.from,
        to: b.to!,
        note,
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
    console.error("miniapp/book POST error:", e);
    return new NextResponse(JSON.stringify({ ok: false, message: "Internal error" }), {
      status: 500,
      headers: corsHeaders({ "Content-Type": "application/json" }),
    });
  }
}