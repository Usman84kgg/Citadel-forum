import { NextResponse } from "next/server";
import { createAccessToken, createRefreshToken } from "@/lib/auth/jwt";

// ==========================================================
// ВРЕМЕННО: email владельца (замени на свой)
// Позже перенесём в переменную окружения Vercel
// ==========================================================
const OWNER_EMAIL = "citadelforum77@gmail.com";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email обязателен" }, { status: 400 });
    }

    // ВРЕМЕННАЯ ЗАГЛУШКА — позже заменим на проверку пароля через БД
    const isOwner = email === OWNER_EMAIL;
    const role = isOwner ? "owner" : "member";

    const accessToken = await createAccessToken({
      sub: isOwner ? "owner_1" : `user_${Date.now()}`,
      email,
      username: email.split("@")[0] ?? "User",
      role,
    });

    const refreshToken = await createRefreshToken({
      sub: isOwner ? "owner_1" : `user_${Date.now()}`,
      type: "refresh",
    });

    const response = NextResponse.json({
      success: true,
      user: { email, username: email.split("@")[0], role },
    });

    response.cookies.set("access_token", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 600,
      path: "/",
    });

    response.cookies.set("refresh_token", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 604800,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}