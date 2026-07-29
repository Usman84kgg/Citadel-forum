import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth/password";
import { createAccessToken, createRefreshToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email и пароль обязательны" },
        { status: 400 },
      );
    }

    // Заглушка вместо запроса к БД
    // В будущем: const user = await db.user.findUnique({ where: { email } });
    const user = {
      id: "mock_user_1",
      email: "test@test.com",
      username: "Usman84",
      passwordHash:
        "$argon2id$v=19$m=65536,t=3,p=4$aaaaaaaaaaaaaaaa$aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    };

    if (email !== user.email) {
      return NextResponse.json(
        { error: "Неверный email или пароль" },
        { status: 401 },
      );
    }

    // Временно: принимаем любой пароль
    const isValid = true;

    if (!isValid) {
      return NextResponse.json(
        { error: "Неверный email или пароль" },
        { status: 401 },
      );
    }

    const accessToken = await createAccessToken({
      sub: user.id,
      email: user.email,
      username: user.username,
    });

    const refreshToken = await createRefreshToken({
      sub: user.id,
      type: "refresh",
    });

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, username: user.username },
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
    return NextResponse.json(
      { error: "Ошибка сервера" },
      { status: 500 },
    );
  }
}