import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { supabase } from "@/lib/db/supabase";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "citadel-dev-secret-change-in-production",
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

    // 1. Публикации
    const { count: postsCount } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId);

    // 2. Спасибо (реакции типа "thanks" или "like")
    const { data: reactions } = await supabase
      .from("reactions")
      .select("type")
      .eq("user_id", userId);

    const thanksCount =
      reactions?.filter((r) => r.type === "thanks" || r.type === "like").length || 0;

    // 3. Сделки и оборот
    const { data: deals } = await supabase
      .from("deals")
      .select("amount, status")
      .eq("seller_id", userId)
      .or(`buyer_id.eq.${userId}`);

    const completedDeals = deals?.filter((d) => d.status === "completed") || [];
    const dealsCount = completedDeals.length;
    const turnover = completedDeals.reduce(
      (sum, deal) => sum + (Number(deal.amount) || 0),
      0,
    );

    // 4. Репутация
    const { data: repData } = await supabase
      .from("user_reputations")
      .select("score")
      .eq("user_id", userId);

    const totalRep =
      repData?.reduce((sum, r) => sum + (r.score || 0), 0) || 0;
    const positiveRep = repData?.filter((r) => r.score > 0).length || 0;
    const negativeRep = repData?.filter((r) => r.score < 0).length || 0;

    // 5. Баланс из accounts
    const { data: accounts } = await supabase
      .from("accounts")
      .select("balance, type")
      .eq("user_id", userId);

    const available =
      accounts?.find((a) => a.type === "available")?.balance ?? 0;
    const hold = accounts?.find((a) => a.type === "hold")?.balance ?? 0;
    const totalBalance = available + hold;

    return NextResponse.json({
      posts: postsCount || 0,
      thanks: thanksCount,
      deals: dealsCount,
      turnover: turnover,
      reputation: totalRep,
      positiveRep,
      negativeRep,
      balance: totalBalance,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}