import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/password";
import { createAccessToken, createRefreshToken } from "@/lib/auth/jwt";
import { supabase } from "@/lib/db/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, username, password } = body;

    if (!email || !username || !password) {
      return NextResponse.json({ error: "Все поля обязательны" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Пароль должен быть не менее 8 символов" }, { status: 400 });
    }

    const { data: existing } = await supabase.from("users").select("id").eq("email", email).single();
    if (existing) {
      return NextResponse.json({ error: "Пользователь с таким email уже существует" }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const { data: user, error: dbError } = await supabase.from("users").insert({
      email,
      username,
      password_hash: passwordHash,
      email_verified: false,
    }).select().single();

    if (dbError || !user) {
      return NextResponse.json({ error: "Ошибка при создании пользователя" }, { status: 500 });
    }

    const role = email === "citadelforum77@gmail.com" ? "owner" : "member";

    const accessToken = await createAccessToken({
      sub: user.id,
      email: user.email,
      username: user.username,
      role,
    });
    const refreshToken = await createRefreshToken({ sub: user.id, type: "refresh" });

    const isHttps = process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https");

    const response = NextResponse.json({
      success: true,
      user: { id: user.id, email: user.email, username: user.username, role },
    });

    response.cookies.set("access_token", accessToken, {
      httpOnly: true, secure: isHttps, sameSite: "lax", maxAge: 600, path: "/",
    });
    response.cookies.set("refresh_token", refreshToken, {
      httpOnly: true, secure: isHttps, sameSite: "lax", maxAge: 604800, path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}