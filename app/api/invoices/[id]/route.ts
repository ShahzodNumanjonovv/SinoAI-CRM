// app/api/invoices/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const inv = await prisma.invoice.findUnique({
    where: { id: params.id },
    include: {
      patient: true,
      items: { include: { service: true } },
      discount: true,
    },
  });

  if (!inv) {
    return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, invoice: inv });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await req.json();

    if (!["DRAFT", "UNPAID", "PAID", "CANCELLED"].includes(status)) {
      return NextResponse.json(
        { ok: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    const updated = await prisma.invoice.update({
      where: { id: params.id },
      data: { status },
      include: {
        patient: true,
        items: { include: { service: true } },
        discount: true,
      },
    });

    return NextResponse.json({ ok: true, invoice: updated });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}