// app/api/doctors/[id]/availability/route.ts
import { prisma } from "@/lib/db";
import { corsNoContent, corsOk } from "@/lib/cors";

export async function OPTIONS() {
  return corsNoContent();
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params; // Next 15: params Promise
    const url = new URL(req.url);
    const dateStr = url.searchParams.get("date"); // "YYYY-MM-DD"

    if (!id || !dateStr) {
      return corsOk({ ok: false, message: "doctorId/date required" }, 400);
    }

    const date = new Date(dateStr); // Sana faqat kun sifatida ishlatiladi (DB ham shunday)

    // 1) CANCELLED bo‘lmagan appointmentlar (PENDING/CONFIRMED/DONE)
    const appts = await prisma.appointment.findMany({
      where: {
        doctorId: id,
        date,
        NOT: { status: "CANCELLED" as any },
      },
      select: { from: true },
    });

    // 2) Muddati tugamagan holdlar
    const now = new Date();
    const holds = await prisma.appointmentHold.findMany({
      where: {
        doctorId: id,
        date,
        expiresAt: { gt: now },
      },
      select: { from: true },
    });

    // 3) Birlashtiramiz va takrorlarni olib tashlaymiz
    const busy = Array.from(
      new Set<string>([...appts, ...holds].map((r) => r.from))
    );

    return corsOk({ ok: true, busySlots: busy });
  } catch (e) {
    console.error(e);
    return corsOk({ ok: false, message: "Internal error" }, 500);
  }
}