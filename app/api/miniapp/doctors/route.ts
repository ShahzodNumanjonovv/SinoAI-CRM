// app/api/miniapp/doctors/route.ts
import { prisma } from "@/lib/db";
import { corsNoContent, corsOk } from "@/lib/cors";

// Preflight
export async function OPTIONS(req: Request) {
  return corsNoContent(req);
}

// GET /api/miniapp/doctors
export async function GET(req: Request) {
  try {
    const doctors = await prisma.doctor.findMany({
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
      const raw = d.avatarUrl || "/avatar-fallback.png";
      // Nisbiy bo‘lsa — so‘rov URL’idan absolyut qilamiz (render/netlify uchun ham to‘g‘ri)
      const avatar = /^https?:\/\//i.test(raw) ? raw : new URL(raw, req.url).href;

      return {
        id: d.id,
        firstName: d.firstName,
        lastName: d.lastName,
        clinic: "",
        avatar, // miniapp 'avatar' nomi bilan kutadi
        experienceYears: d.experienceYears ?? 0,
        rating: 4.8,     // demo
        patients: 1200,  // demo
        priceUZS: d.priceUZS,
        speciality: d.speciality,
      };
    });

    return corsOk({ ok: true, doctors: data }, 200, req);
  } catch (e) {
    console.error("miniapp/doctors GET error:", e);
    return corsOk({ ok: false, message: "Internal error" }, 500, req);
  }
}