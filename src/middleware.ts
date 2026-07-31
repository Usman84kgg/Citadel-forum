import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "citadel-dev-secret-change-in-production"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Пропускаем ВСЕ страницы без проверки
  if (
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/forum") ||
    pathname.startsWith("/market") ||
    pathname.startsWith("/wallet") ||
    pathname.startsWith("/escrow") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/admin") ||        // ← админка открыта
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|logo|.*\\.).*)"],
};