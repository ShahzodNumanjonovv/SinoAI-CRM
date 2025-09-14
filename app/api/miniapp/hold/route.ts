// app/api/miniapp/hold/route.ts
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";
import { addMinutes } from "date-fns";

export async function POST(req: Request) {
  try {
    const { doctorId, date, from, to } = await req.json();

    const expiresAt = addMinutes(new Date(), 3); // 3 daqiqa hold

    // Eski muddati o’tgan hold’larni o‘chirib turamiz (quick cleanup)
    await prisma.appointmentHold.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });

    const created = await prisma.appointmentHold.create({
      data: { doctorId, date: new Date(date + "T00:00:00.000Z"), from, to, expiresAt },
      select: { id: true, expiresAt: true },
    });

    return NextResponse.json({ ok: true, holdId: created.id, expiresAt: created.expiresAt });
  } catch (e: any) {
    // Agar slot band bo'lsa unique violation keladi
    return NextResponse.json({ ok: false, message: "Slot already held" }, { status: 409 });
  }
}

// hold’ni bekor qilish
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id")!;
  await prisma.appointmentHold.delete({ where: { id } }).catch(() => {});
  return NextResponse.json({ ok: true });
}