import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { walletDB } from "@/lib/db/wallet";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "citadel-dev-secret-change-in-production",
);

export async function GET(request: Request) {
  const token = request.headers
    .get("cookie")
    ?.split("; ")
    .find((c) => c.startsWith("access_token="))
    ?.split("=")[1];

  if (!token)
    return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  try {
    const { payload } = await jwtVerify(token, SECRET);
    const balance = await walletDB.getBalance(payload.sub as string);
    return NextResponse.json(balance);
  } catch {
    return NextResponse.json({ error: "Токен истёк" }, { status: 401 });
  }
}