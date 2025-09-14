// lib/cors.ts
const ALLOWLIST = [
  "https://sinoaiapp.netlify.app",
  "http://localhost:5173",
];

function pickOrigin(req: Request) {
  const origin = req.headers.get("origin") || "";
  // kerak bo'lsa *.netlify.app kabi qamrovni ham qo'shish mumkin:
  if (ALLOWLIST.includes(origin) || origin.endsWith(".netlify.app")) return origin;
  return ""; // mos kelmasa, CORS ruxsat bermaymiz
}

export function corsHeaders(req: Request) {
  const origin = pickOrigin(req);
  const h: Record<string, string> = {
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
  };
  if (origin) h["Access-Control-Allow-Origin"] = origin; // faqat bitta origin
  return h;
}

export function corsNoContent(req: Request) {
  return new Response(null, { status: 204, headers: corsHeaders(req) });
}

export function corsOk(body: any, status = 200, req?: Request) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...(req ? corsHeaders(req) : {}) },
  });
}