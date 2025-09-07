// app/api/users/[id]/route.ts
import { NextResponse } from "next/server";
import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/users/:id  -> bitta user
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const user = await prisma.user.findUnique({ where: { id: params.id } });
  if (!user) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, user });
}

// PUT /api/users/:id  -> yangilash
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const { firstName, lastName, phone, role } = body as {
    firstName?: string;
    lastName?: string;
    phone?: string;
    role?: string;
  };

  try {
    const user = await prisma.user.update({
      where: { id: params.id },
      data: { firstName, lastName, phone, role },
    });
    return NextResponse.json({ ok: true, user });
  } catch (e) {
    return NextResponse.json({ ok: false, error: "Update failed" }, { status: 400 });
  }
}

// DELETE /api/users/:id  -> o‘chirish
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    // FK cheklovlari bo‘lsa chiroyli xabar
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2003") {
      return NextResponse.json(
        { ok: false, error: "Ushbu foydalanuvchi bilan bog‘liq ma’lumotlar bor" },
        { status: 409 }
      );
    }
    return NextResponse.json({ ok: false, error: "Delete failed" }, { status: 400 });
  }
}