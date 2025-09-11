// app/api/doctors/[id]/availability/route.ts
import { prisma } from "@/lib/db";
import { corsNoContent, corsOk } from "@/lib/cors";

export async function OPTIONS() {
  return corsNoContent();
}

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> } // ✅ Next 15: params Promise
) {
  try {
    const { id } = await ctx.params; // ✅ MUHIM: await
    const dateStr = new URL(req.url).searchParams.get("date"); // "YYYY-MM-DD"

    if (!id || !dateStr) {
      return corsOk({ ok: false, message: "doctorId/date required" }, 400);
    }

    // Shu doktorga, shu kunda band bo‘lgan from-lar ro‘yxati
    const rows = await prisma.appointment.findMany({
      where: { doctorId: id, date: new Date(dateStr) },
      select: { from: true },
    });

    return corsOk({ ok: true, busySlots: rows.map((r) => r.from) });
  } catch (e) {
    console.error(e);
    return corsOk({ ok: false, message: "Internal error" }, 500);
  }
}