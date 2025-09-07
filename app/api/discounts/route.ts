import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const discounts = await prisma.discount.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
    take: 100
  });
  return NextResponse.json({ ok: true, discounts });
}