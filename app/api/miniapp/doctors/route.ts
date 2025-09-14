// app/api/miniapp/doctors/route.ts
import { prisma } from "@/lib/db";
import { corsNoContent, corsOk, corsHeaders } from "@/lib/cors";

function getBaseUrl(req: Request) {
  // 1) Agar PUBLIC_BASE_URL berilgan bo‘lsa – aynan shuni ishlatamiz
  const env = process.env.PUBLIC_BASE_URL?.trim();
  if (env) return env.replace(/\/+$/, "");

  // 2) Aks holda, x-forwarded-* headerlardan yig‘amiz
  const h = new Headers(req.headers);
  const proto = h.get("x-forwarded-proto") || "https";
  const host =
    h.get("x-forwarded-host") ||
    h.get("host") ||
    "localhost:3000";
  return `${proto}://${host}`.replace(/\/+$/, "");
}

export async function OPTIONS() {
  return corsNoContent();
}

export async function GET(req: Request) {
  try {
    const base = getBaseUrl(req); // <<<< MUHIM

    const doctors = await prisma.doctor.findMany({
      // where: { active: true },
      orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        speciality: true,
        priceUZS: true,
        experienceYil: true,
        avatarUrl: true,
      },
    });

    const data = doctors.map((d) => {
      const raw = d.avatarUrl || "/avatar-fallback.png";
      const avatar = /^https?:\/\//i.test(raw)
        ? raw
        : `${base}${raw.startsWith("/") ? "" : "/"}${raw}`;

      return {
        id: d.id,
        firstName: d.firstName,
        lastName: d.lastName,
        clinic: "",
        avatar,
        experienceYil: d.experienceYil ?? 0,
        rating: 4.8,
        patients: 1200,
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