import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await prisma.invoice.update({
    where: { id: params.id },
    data: { status: "PAID" },
  });
  // qaytish
  return NextResponse.redirect(new URL(`/kassir/${params.id}`, _req.url));
}