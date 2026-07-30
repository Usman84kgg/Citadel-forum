import { NextResponse } from "next/server";
import { createAccessToken, createRefreshToken } from "@/lib/auth/jwt";
import { verifyPassword } from "@/lib/auth/password";
import { supabase } from "@/lib/db/supabase";

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

    // Ищем пользователя в базе данных
    const { data: user, error: dbError } = await supabase
      .from("users")
      .select("id, email, username, password_hash")
      .eq("email", email)
      .single();

    if (dbError || !user) {
      return NextResponse.json(
        { error: "Неверный email или пароль" },
        { status: 401 },
      );
    }

    // Проверяем пароль
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Неверный email или пароль" },
        { status: 401 },
      );
    }

    // Определяем роль (owner — только для этого email)
    const role =
      email === "citadelforum77@gmail.com" ? "owner" : "member";

    const accessToken = await createAccessToken({
      sub: user.id,
      email: user.email,
      username: user.username,
      role,
    });

    const refreshToken = await createRefreshToken({
      sub: user.id,
      type: "refresh",
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role,
      },
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