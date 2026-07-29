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

    const deposits = walletDB.getDeposits(userId).map((d) => ({ ...d, operationType: "deposit" }));
    const withdrawals = walletDB.getWithdrawals(userId).map((w) => ({ ...w, operationType: "withdrawal" }));

    const all = [...deposits, ...withdrawals].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    return NextResponse.json(all);
  } catch {
    return NextResponse.json({ error: "Токен истёк" }, { status: 401 });
  }
}