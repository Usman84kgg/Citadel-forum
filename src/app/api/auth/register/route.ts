import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/password";
import { createAccessToken, createRefreshToken } from "@/lib/auth/jwt";

// Временно используем заглушку вместо БД
const MOCK_USERS: Array<{
  id: string;
  email: string;
  username: string;
  passwordHash: string;
}> = [];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, username, password } = body;

    if (!email || !username || !password) {
      return NextResponse.json(
        { error: "Все поля обязательны" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Пароль должен быть не менее 8 символов" },
        { status: 400 },
      );
    }

    // Проверка на существующего пользователя (заглушка)
    const exists = MOCK_USERS.find(
      (u) => u.email === email || u.username === username,
    );
    if (exists) {
      return NextResponse.json(
        { error: "Пользователь с таким email или именем уже существует" },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);
    const user = {
      id: `user_${Date.now()}`,
      email,
      username,
      passwordHash,
    };

    MOCK_USERS.push(user);

    const accessToken = await createAccessToken({
      sub: user.id,
      email: user.email,
      username: user.username,
    });

    const refreshToken = await createRefreshToken({
      sub: user.id,
      type: "refresh",
    });

    const response = NextResponse.json({ success: true, user: { id: user.id, email: user.email, username: user.username } });

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