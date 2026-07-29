import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { supabase } from "@/lib/db/supabase";

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || "citadel-dev-secret-change-in-production");
const CHANGE_COST = 10000; // $100 в центах

export async function POST(request: Request) {
  const token = request.headers.get("cookie")?.split("; ").find((c) => c.startsWith("access_token="))?.split("=")[1];
  if (!token) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  try {
    const { payload } = await jwtVerify(token, SECRET);
    const userId = payload.sub as string;
    const { newUsername } = await request.json();

    if (!newUsername || newUsername.length < 3) {
      return NextResponse.json({ error: "Ник должен быть не менее 3 символов" }, { status: 400 });
    }

    // Проверяем, не занят ли ник
    const { data: existing } = await supabase.from("users").select("id").eq("username", newUsername).single();
    if (existing) {
      return NextResponse.json({ error: "Этот ник уже занят" }, { status: 409 });
    }

    // Проверяем баланс через таблицу accounts
    const { data: account } = await supabase.from("accounts").select("balance").eq("user_id", userId).eq("type", "available").single();

    if (!account || account.balance < CHANGE_COST) {
      return NextResponse.json({ error: "Недостаточно средств. Стоимость смены ника: $100" }, { status: 402 });
    }

    // Списываем $100
    await supabase.from("accounts").update({ balance: account.balance - CHANGE_COST }).eq("user_id", userId).eq("type", "available");

    // Меняем ник
    await supabase.from("users").update({ username: newUsername }).eq("id", userId);

    return NextResponse.json({ success: true, username: newUsername });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}