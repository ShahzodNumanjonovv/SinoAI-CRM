// app/api/doctors/[id]/availability/route.ts
import { prisma } from "@/lib/db";
import { corsNoContent, corsOk } from "@/lib/cors";

// Preflight
export async function OPTIONS(req: Request) {
  return corsNoContent(req);
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
      return corsOk({ ok: false, message: "doctorId/date required" }, 400, req);
    }

    // Sana/timezone muammolarini oldini olish: kun boshini UTC’da olamiz
    // (agar DB’da DATE/kun sifatida saqlansa ham to‘g‘ri tushadi)
    const date = new Date(`${dateStr}T00:00:00.000Z`);

    // 1) CANCELLED bo‘lmagan appointmentlar
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

    // 3) Band slotlarni unikal qilamiz
    const busySlots = Array.from(
      new Set<string>([...appts, ...holds].map((r) => r.from))
    );

    return corsOk({ ok: true, busySlots }, 200, req);
  } catch (e) {
    console.error("availability GET error:", e);
    return corsOk({ ok: false, message: "Internal error" }, 500, req);
  }
}