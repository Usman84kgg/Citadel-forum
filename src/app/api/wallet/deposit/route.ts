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
    const { currency, amount, method, txId } = await request.json();
    if (!currency || !amount || !method) {
      return NextResponse.json({ error: "Валюта, сумма и способ обязательны" }, { status: 400 });
    }

    const deposit = await walletDB.createDeposit({ userId, currency, amount, method, txId });
    return NextResponse.json({ success: true, deposit });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Ошибка сервера" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const userId = await getUserId(request);
  if (!userId)
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  const deposits = await walletDB.getDeposits(userId);
  return NextResponse.json(deposits);
}