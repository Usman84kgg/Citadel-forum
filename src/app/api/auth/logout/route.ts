import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  // Флаг secure должен совпадать с тем, что выставлялся при входе —
  // иначе в некоторых окружениях куки не считаются «той же самой»
  // и не гарантированно перезаписываются.
  const isHttps =
    process.env.NODE_ENV === "production" &&
    process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https");

  const response = NextResponse.json(
    { success: true },
    { headers: { "Cache-Control": "no-store" } },
  );

  response.cookies.set("access_token", "", {
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  response.cookies.set("refresh_token", "", {
    httpOnly: true,
    secure: isHttps,
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return response;
}