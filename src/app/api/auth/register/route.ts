import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/password";
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

    // Проверяем, не занят ли email
    const { data: existing } = await supabase.from("users").select("id").eq("email", email).single();
    if (existing) {
      return NextResponse.json({ error: "Пользователь с таким email уже существует" }, { status: 409 });
    }

    // Хешируем пароль
    const passwordHash = await hashPassword(password);

    // Сохраняем пользователя в Supabase
    const { data: user, error: dbError } = await supabase.from("users").insert({
      email,
      username,
      password_hash: passwordHash,
      email_verified: false,
    }).select().single();

    if (dbError) {
      return NextResponse.json({ error: "Ошибка при создании пользователя" }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, username: user.username } });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}