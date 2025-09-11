// app/api/miniapp/doctors/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { corsHeaders, corsNoContent, corsOk } from "@/lib/cors";

export async function OPTIONS() {
  return corsNoContent();
}

export async function GET() {
  try {
    const rows = await prisma.doctor.findMany({
      where: { /* kerak bo‘lsa filterlar */ },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        speciality: true,
        department: { select: { name: true } },
        avatarUrl: true,          // schema’da bor (yo‘q bo‘lsa null qaytadi)
        experienceYears: true,    // number
        priceUZS: true,
      },
    });

    // MiniApp’ning DoctorCard formatiga moslashtiramiz
    const doctors = rows.map((d) => ({
      id: d.id,
      firstName: d.firstName,
      lastName: d.lastName,
      clinic: d.department?.name ?? "",        // DoctorCard’dagi “clinic” sarlavhasi
      avatar: d.avatarUrl || "/avatar-fallback.png",
      experienceYears: typeof d.experienceYears === "number" ? d.experienceYears : 0,
      rating: 4.8,                              // hozircha stub (UI o‘zgarmasin)
      patients: 1200,                           // hozircha stub (UI o‘zgarmasin)
      priceUZS: d.priceUZS,
      speciality: d.speciality,
    }));

    return corsOk({ ok: true, doctors }, 200);
  } catch (e) {
    console.error("miniapp/doctors GET error:", e);
    return new NextResponse(JSON.stringify({ ok: false, message: "Internal error" }), {
      status: 500,
      headers: corsHeaders({ "Content-Type": "application/json" }),
    });
  }
}