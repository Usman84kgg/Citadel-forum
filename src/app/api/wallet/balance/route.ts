import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { walletDB } from "@/lib/wallet/mock-db";

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || "citadel-dev-secret-change-in-production");

export async function GET(request: Request) {
  const token = request.headers.get("cookie")?.split("; ").find((c) => c.startsWith("access_token="))?.split("=")[1];
  if (!token) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  try {
    const { payload } = await jwtVerify(token, SECRET);
    const userId = payload.sub as string;
    const available = walletDB.getBalance(userId);
    const hold = walletDB.getHoldBalance(userId);
    return NextResponse.json({ available, hold, total: available + hold, currency: "USD" });
  } catch {
    return NextResponse.json({ error: "Токен истёк" }, { status: 401 });
  }
}