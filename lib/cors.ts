// lib/cors.ts

// Ruxsat berilgan frontendlardan kelgan so'rovlarga CORS ochamiz.
// Kerak bo'lsa ro'yxatni kengaytirish mumkin.
const ALLOWLIST = [
  "https://sinoaiapp.netlify.app",
  "http://localhost:5173",
];

// netlify sub-domainlarga ham ruxsat berish uchun helper
function isAllowedOrigin(origin: string) {
  if (!origin) return false;
  if (ALLOWLIST.includes(origin)) return true;
  try {
    const u = new URL(origin);
    return u.hostname.endsWith(".netlify.app");
  } catch {
    return false;
  }
}

// req bo'lsa, undan originni olamiz va tekshiramiz
function pickOrigin(req?: Request) {
  const origin = req?.headers?.get("origin") ?? "";
  return isAllowedOrigin(origin) ? origin : "";
}

// Ichki: CORS headerlarni tuzib beradi.
// Agar origin topilmasa => `Access-Control-Allow-Origin: *` qo'yiladi
// va `Allow-Credentials` qo'yilmaydi (standartga mos).
function buildCorsHeaders(origin: string) {
  const h: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Vary": "Origin",
  };

  if (origin) {
    h["Access-Control-Allow-Origin"] = origin;
    h["Access-Control-Allow-Credentials"] = "true";
  } else {
    // req berilmaganda yoki origin allowlistga tushmasa — keng ruxsat,
    // lekin credentials yo'q (standart).
    h["Access-Control-Allow-Origin"] = "*";
  }

  return h;
}

/** Tashqi foydalanish: CORS headerlarni qaytaradi (req ixtiyoriy) */
export function corsHeaders(req?: Request) {
  const origin = pickOrigin(req);
  return buildCorsHeaders(origin);
}

/** Preflight uchun 204 javob (req ixtiyoriy — mavjud bo‘lsa, aniq origin qaytadi) */
export function corsNoContent(req?: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(req) });
}

/** JSON OK helper (req ixtiyoriy) */
export function corsOk(body: any, status = 200, req?: Request) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(req),
    },
  });
}