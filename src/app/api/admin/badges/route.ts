import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || "c");

let customBadges: any[] = [
  { id: "admin", label: "Администратор", variant: "danger", effect: "neon" },
  { id: "moderator", label: "Модератор", variant: "info", effect: "solid" },
  { id: "vip", label: "VIP", variant: "gold", effect: "neon" },
];
let userBadges: any[] = [{ userId: "mock_user_1", badgeId: "vip" }];

async function checkAdmin(req: Request) {
  const t = req.headers.get("cookie")?.split("; ").find(c => c.startsWith("access_token="))?.split("=")[1];
  if (!t) return false;
  try { const p = await jwtVerify(t, SECRET); return p.payload.role === "admin" || p.payload.role === "owner"; }
  catch { return false; }
}

export async function GET(req: Request) {
  if (!await checkAdmin(req)) return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  return NextResponse.json({ badges: customBadges, userBadges });
}

export async function POST(req: Request) {
  if (!await checkAdmin(req)) return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  const b = await req.json();
  if (b.action === "create") { customBadges.push({ id: b.id, label: b.label, variant: b.variant, effect: b.effect }); }
  if (b.action === "assign") { userBadges.push({ userId: b.userId, badgeId: b.badgeId }); }
  if (b.action === "remove") { userBadges = userBadges.filter(x => !(x.userId === b.userId && x.badgeId === b.badgeId)); }
  if (b.action === "delete") { customBadges = customBadges.filter(x => x.id !== b.badgeId); userBadges = userBadges.filter(x => x.badgeId !== b.badgeId); }
  return NextResponse.json({ success: true });
}