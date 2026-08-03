import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { walletDB } from "@/lib/wallet/mock-db";

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

  const { currency, amount, method, addressTo } = await request.json();
  if (!currency || !amount || !method || !addressTo) {
    return NextResponse.json({ error: "Все поля обязательны" }, { status: 400 });
  }

  const balance = walletDB.getBalance(userId);
  if (balance < amount) {
    return NextResponse.json({ error: "Недостаточно средств" }, { status: 400 });
  }

  const withdrawal = walletDB.createWithdrawal({ userId, currency, amount, method, addressTo });
  return NextResponse.json({ success: true, withdrawal });
}

export async function GET(request: Request) {
  const userId = await getUserId(request);
  if (!userId)
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const withdrawals = walletDB.getWithdrawals(userId);
  return NextResponse.json(withdrawals);
}