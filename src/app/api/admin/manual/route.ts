import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { walletDB } from "@/lib/db/wallet";

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || "c");

async function checkAdmin(req: Request) {
  const t = req.headers.get("cookie")?.split("; ").find(c => c.startsWith("access_token="))?.split("=")[1];
  if (!t) return false;
  try { const p = await jwtVerify(t, SECRET); return p.payload.role === "admin" || p.payload.role === "owner"; }
  catch { return false; }
}

export async function POST(req: Request) {
  if (!await checkAdmin(req)) return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  const { userId, amount, action } = await req.json();
  let r;
  if (action === "credit") r = await walletDB.manualCredit(userId, amount);
  if (action === "debit") r = await walletDB.manualDebit(userId, amount);
  return NextResponse.json(r);
}