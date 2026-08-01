import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { supabase } from "@/lib/db/supabase";
import { walletDB } from "@/lib/db/wallet";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "citadel-dev-secret-change-in-production"
);

export async function GET(request: Request) {
  const token = request.headers
    .get("cookie")
    ?.split("; ")
    .find((c) => c.startsWith("access_token="))
    ?.split("=")[1];

  if (!token) {
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);
    const userId = payload.sub as string;

    // Запрашиваем всё параллельно для скорости
    const [balance, postsResult, dealsResult, reviewsResult] = await Promise.all([
      // Баланс кошелька
      walletDB.getBalance(userId),

      // Количество постов
      supabase
        .from("posts")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),

      // Все сделки где пользователь покупатель или продавец
      supabase
        .from("deals")
        .select("amount, status")
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`),

      // Отзывы о пользователе (репутация)
      supabase
        .from("reviews")
        .select("is_positive")
        .eq("target_user_id", userId),
    ]);

    // Считаем статистику сделок
    const deals = dealsResult.data || [];
    const completedDeals = deals.filter(
      (d) => d.status === "delivered" || d.status === "completed"
    );
    const turnover = completedDeals.reduce(
      (sum, d) => sum + (Number(d.amount) || 0),
      0
    );

    // Считаем репутацию
    const reviews = reviewsResult.data || [];
    const positiveRep = reviews.filter((r) => r.is_positive === true).length;
    const negativeRep = reviews.filter((r) => r.is_positive === false).length;
    const reputation = positiveRep - negativeRep;

    return NextResponse.json({
      posts: postsResult.count || 0,
      thanks: 0, // подключите если есть таблица likes/thanks
      deals: deals.length,
      turnover: Math.round(turnover / 100), // хранится в центах
      reputation,
      positiveRep,
      negativeRep,
      balance: balance.available,
    });
  } catch {
    return NextResponse.json({ error: "Токен истёк" }, { status: 401 });
  }
}