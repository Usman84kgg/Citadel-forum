import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { walletDB } from "@/lib/db/wallet";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "citadel-dev-secret-change-in-production",
);

async function checkAdmin(req: Request) {
  const t = req.headers
    .get("cookie")
    ?.split("; ")
    .find((c) => c.startsWith("access_token="))
    ?.split("=")[1];
  if (!t) return false;
  try {
    const p = await jwtVerify(t, SECRET);
    return p.payload.role === "admin" || p.payload.role === "owner";
  } catch {
    return false;
  }
}

export async function GET(req: Request) {
  if (!(await checkAdmin(req)))
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  const addresses = await walletDB.getAllAddresses();
  return NextResponse.json(addresses);
}

export async function POST(req: Request) {
  if (!(await checkAdmin(req)))
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });

  const body = await req.json();
  const { action } = body;

  try {
    if (action === "create") {
      const { currency, network, address, label } = body;
      if (!currency || !network || !address) {
        return NextResponse.json({ error: "Заполните все поля" }, { status: 400 });
      }
      await walletDB.createAddress({ currency, network, address, label: label || "" });
    } else if (action === "update") {
      const { id, address, label } = body;
      await walletDB.updateAddress(id, { address, label: label || "" });
    } else if (action === "toggle") {
      const { id, isActive } = body;
      await walletDB.toggleAddress(id, isActive);
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Ошибка" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  if (!(await checkAdmin(req)))
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "ID обязателен" }, { status: 400 });

  try {
    await walletDB.deleteAddress(id);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Ошибка" }, { status: 500 });
  }
}