import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "citadel-dev-secret-change-in-production"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/_next") || pathname.includes(".")) return NextResponse.next();

  const isAdminRoute = pathname.startsWith("/admin");
  const isProfileRoute = pathname.startsWith("/profile");

  // Админка — только для owner/admin. Профиль — только для авторизованных.
  // Проверка идёт на сервере, до рендера страницы, поэтому кэш браузера
  // или страница из bfcache не могут показать личный кабинет после выхода.
  if (isAdminRoute || isProfileRoute) {
    const token = request.cookies.get("access_token")?.value;
    if (!token) return NextResponse.redirect(new URL("/login", request.url));
    try {
      const { payload } = await jwtVerify(token, SECRET);
      if (isAdminRoute) {
        const role = payload.role as string;
        if (role !== "owner" && role !== "admin") return NextResponse.redirect(new URL("/", request.url));
      }
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next|logo|.*\\.).*)"] };