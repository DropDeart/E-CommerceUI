import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const session = req.cookies.get("next-auth.session-token"); 

  if (url.pathname.startsWith("/admin") && !session) {
    return NextResponse.redirect(new URL("/giris-yap", req.url));
  }
}
