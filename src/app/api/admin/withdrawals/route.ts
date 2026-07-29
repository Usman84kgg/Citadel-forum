import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { walletDB } from "@/lib/wallet/mock-db";

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || "citadel-dev-secret-change-in-production");

async function checkAdmin(request: Request) {
  const token = request.headers.get("cookie")?.split("; ").find((c) => c.startsWith("access_token="))?.split("=")[1];
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload.role === "admin" || payload.role === "owner";
  } catch { return false; }
}

export async function GET(request: Request) {
  if (!(await checkAdmin(request))) return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  return NextResponse.json(walletDB.getPendingWithdrawals());
}

export async function POST(request: Request) {
  if (!(await checkAdmin(request))) return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  const { id, action, note, txId } = await request.json();
  if (action === "approve") walletDB.approveWithdrawal(id);
  if (action === "paid") walletDB.markWithdrawalPaid(id, txId);
  if (action === "reject") walletDB.rejectWithdrawal(id, note);
  return NextResponse.json({ success: true });
}