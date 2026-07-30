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

export async function GET(req: Request) {
  if (!await checkAdmin(req)) return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  const d = await walletDB.getAddresses();
  return NextResponse.json(d);
}

export async function POST(req: Request) {
  if (!await checkAdmin(req)) return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  const { currency, network, address, label, isActive } = await req.json();
  if (isActive !== undefined) await walletDB.toggleAddress(currency, network, isActive);
  else await walletDB.updateAddress(currency, network, address, label);
  return NextResponse.json({ success: true });
}