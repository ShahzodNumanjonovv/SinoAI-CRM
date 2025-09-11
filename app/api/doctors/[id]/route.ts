// app/api/doctors/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const doctor = await prisma.doctor.findUnique({
    where: { id },
    include: { department: { select: { id: true, name: true } } },
  });
  if (!doctor) {
    return NextResponse.json({ ok: false, message: "Topilmadi" }, { status: 404 });
  }

  const departments = await prisma.department.findMany({
    where: { active: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({
    ok: true,
    doctor: {
      id: doctor.id,
      code: doctor.code,
      firstName: doctor.firstName,
      lastName: doctor.lastName,
      speciality: doctor.speciality,
      roomNo: doctor.roomNo,
      priceUZS: doctor.priceUZS,
      departmentId: doctor.departmentId,
      createdAt: doctor.createdAt,
    },
    departments,
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  try {
    const updated = await prisma.doctor.update({
      where: { id },
      data: {
        code: body.code ?? null,
        firstName: body.firstName,
        lastName: body.lastName,
        speciality: body.speciality,
        roomNo: body.roomNo ?? null,
        priceUZS: body.priceUZS,
        departmentId: body.departmentId ?? null,
      },
    });
    return NextResponse.json({ ok: true, doctor: updated });
  } catch (e: any) {
    // unique, foreign key va hok.
    const message =
      e?.code === "P2002"
        ? "Bunday #Kod allaqachon mavjud."
        : "Saqlashda xatolik.";
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await prisma.doctor.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    // P2025: record not found; P2003: FK constraint
    let message = "O‘chirishda xatolik.";
    if (e?.code === "P2025") message = "Yozuv topilmadi.";
    if (e?.code === "P2003")
      message = "Ushbu shifokor bog‘langan ma’lumotlar mavjud.";
    return NextResponse.json({ ok: false, message }, { status: 400 });
  }
}