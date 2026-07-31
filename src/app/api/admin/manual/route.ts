import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { walletDB } from "@/lib/db/wallet";

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || "c");

async function checkAdmin(request: Request): Promise<boolean> {
  const cookie = request.headers.get("cookie");
  if (!cookie) return false;
  const token = cookie
    .split("; ")
    .find((c) => c.startsWith("access_token="))
    ?.split("=")[1];
  if (!token) return false;
  try {
    const result = await jwtVerify(token, SECRET);
    const role = result.payload.role as string;
    return role === "admin" || role === "owner";
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!(await checkAdmin(request))) {
    return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  }

  const body = await request.json();
  const { userId, amount, action } = body as { userId: string; amount: number; action: string };

  let result: { success: boolean; error?: string } = { success: true };

  if (action === "credit") {
    result = await walletDB.manualCredit(userId, amount);
  } else if (action === "debit") {
    result = await walletDB.manualDebit(userId, amount);
  }

  return NextResponse.json(result);
}