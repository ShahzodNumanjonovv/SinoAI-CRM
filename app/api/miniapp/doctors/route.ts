// app/api/miniapp/doctors/route.ts
import { prisma } from "@/lib/db";
import { corsNoContent, corsOk, corsHeaders } from "@/lib/cors";

// Preflight
export async function OPTIONS() {
  return corsNoContent();
}

// GET /api/miniapp/doctors
export async function GET(req: Request) {
  try {
    // absolute URL yasash uchun origin
    const origin = new URL(req.url).origin; // masalan http://localhost:3000

    const doctors = await prisma.doctor.findMany({
      // where: { active: true }, // kerak bo‘lsa oching
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        speciality: true,
        priceUZS: true,
        experienceYears: true,
        avatarUrl: true,
      },
    });

    const data = doctors.map((d) => {
      // avatar absolute bo‘lsin (agar nisbiy bo‘lsa 5173 da ham to‘g‘ri ishlaydi)
      const raw = d.avatarUrl || "/avatar-fallback.png";
      const avatar =
        /^https?:\/\//i.test(raw) ? raw : `${origin}${raw.startsWith("/") ? "" : "/"}${raw}`;

      return {
        id: d.id,
        firstName: d.firstName,
        lastName: d.lastName,
        clinic: "", // hozircha bo'sh
        avatar, // mini-app 'avatar' nomi bilan kutadi
        experienceYears: d.experienceYears ?? 0,
        rating: 4.8,    // demo
        patients: 1200, // demo
        priceUZS: d.priceUZS,
        speciality: d.speciality,
      };
    });

    return corsOk({ ok: true, doctors: data });
  } catch (e: any) {
    console.error("miniapp/doctors GET error:", e);
    return new Response(JSON.stringify({ ok: false, message: "Internal error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
}