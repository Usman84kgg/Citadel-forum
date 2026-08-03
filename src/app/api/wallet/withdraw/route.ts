import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { walletDB } from "@/lib/db/wallet";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "citadel-dev-secret-change-in-production",
);

async function getUserId(request: Request) {
  const token = request.headers
    .get("cookie")
    ?.split("; ")
    .find((c) => c.startsWith("access_token="))
    ?.split("=")[1];
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload.sub as string;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const userId = await getUserId(request);
  if (!userId)
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  try {
    const { currency, amount, method, addressTo } = await request.json();
    if (!currency || !amount || !method || !addressTo) {
      return NextResponse.json({ error: "Все поля обязательны" }, { status: 400 });
    }

    const balance = await walletDB.getBalance(userId);
    if (balance.available < amount) {
      return NextResponse.json({ error: "Недостаточно средств" }, { status: 400 });
    }

    const withdrawal = await walletDB.createWithdrawal({ userId, currency, amount, method, addressTo });
    return NextResponse.json({ success: true, withdrawal });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Ошибка сервера" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const userId = await getUserId(request);
  if (!userId)
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const withdrawals = await walletDB.getWithdrawals(userId);
  return NextResponse.json(withdrawals);
}