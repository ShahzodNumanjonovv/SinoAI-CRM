import { NextResponse } from "next/server";
const ORIGIN = process.env.ALLOWED_ORIGIN ?? "*"; // prod’da aniq domen qo‘yish tavsiya
export function withCors(handler: any) {
  return async (req: Request, ctx: any) => {
    if (req.method === "OPTIONS") {
      return new NextResponse(null, {
        headers: {
          "Access-Control-Allow-Origin": ORIGIN,
          "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type,x-telegram-id",
        },
      });
    }
    const res: NextResponse = await handler(req, ctx);
    res.headers.set("Access-Control-Allow-Origin", ORIGIN);
    return res;
  };
}