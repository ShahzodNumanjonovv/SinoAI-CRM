// app/api/appointments/day/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { parseISO, startOfDay, endOfDay } from "date-fns";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const dateStr = searchParams.get("date");
  if (!dateStr) return NextResponse.json({ ok: false, message: "date required" }, { status: 400 });
  const start = startOfDay(parseISO(dateStr));
  const end = endOfDay(start);

  const items = await prisma.appointment.findMany({
    where: { date: { gte: start, lte: end }, status: { in: ["PENDING", "CONFIRMED"] } },
    include: {
      doctor: { select: { id: true, firstName: true, lastName: true } },
      patient: { select: { firstName: true, lastName: true, phone: true } },
    },
    orderBy: [{ doctorId: "asc" }, { from: "asc" }],
  });

  return NextResponse.json({ ok: true, items });
}