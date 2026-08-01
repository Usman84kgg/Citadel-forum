import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { supabase } from "@/lib/db/supabase";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "citadel-dev-secret-change-in-production",
);

// Сессию проверяем всегда заново — ни браузер, ни CDN не должны
// кэшировать ответ, иначе после выхода из аккаунта старый ответ
// «пользователь авторизован» может показаться снова.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const token = request.headers
    .get("cookie")
    ?.split("; ")
    .find((c) => c.startsWith("access_token="))
    ?.split("=")[1];

  if (!token) {
    return NextResponse.json(
      { error: "Не авторизован" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);

    // Аватар может смениться после выдачи токена, поэтому берём его
    // напрямую из базы, а не из подписанного JWT.
    const { data: dbUser } = await supabase
      .from("users")
      .select("avatar_url")
      .eq("id", payload.sub as string)
      .single();

    return NextResponse.json(
      {
        user: {
          id: payload.sub,
          email: payload.email,
          username: payload.username,
          role: payload.role,
          avatarUrl: dbUser?.avatar_url ?? null,
        },
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Токен истёк" },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }
}