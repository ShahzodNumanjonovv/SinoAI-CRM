import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// POST /kassir/[id]/pay
export async function POST(req: Request, context: any) {
  const id = context?.params?.id as string;
  if (!id) {
    return NextResponse.json({ ok: false, message: "Missing id" }, { status: 400 });
  }

  try {
    await prisma.invoice.update({
      where: { id },
      data: { status: "PAID" },
    });

    return NextResponse.redirect(new URL(`/kassir/${id}`, req.url));
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, message: e?.message ?? "Server error" },
      { status: 500 }
    );
  }
}