import { NextResponse } from "next/server";

let customBadges: any[] = [
  { id: "admin", label: "Администратор", variant: "danger", effect: "neon" },
  { id: "moderator", label: "Модератор", variant: "info", effect: "solid" },
  { id: "vip", label: "VIP", variant: "gold", effect: "neon" },
  { id: "verified", label: "Проверенный продавец", variant: "success", effect: "solid" },
  { id: "generous", label: "Щедрый", variant: "warning", effect: "fire" },
];
let userBadges: any[] = [{ userId: "mock_user_1", badgeId: "vip" }];

export async function GET() {
  return NextResponse.json({ badges: customBadges, userBadges });
}

export async function POST(request: Request) {
  const b = await request.json();
  if (b.action === "create") customBadges.push({ id: b.id, label: b.label, variant: b.variant, effect: b.effect });
  if (b.action === "assign") userBadges.push({ userId: b.userId, badgeId: b.badgeId });
  if (b.action === "remove") userBadges = userBadges.filter((x: any) => !(x.userId === b.userId && x.badgeId === b.badgeId));
  if (b.action === "delete") { customBadges = customBadges.filter((x: any) => x.id !== b.badgeId); userBadges = userBadges.filter((x: any) => x.badgeId !== b.badgeId); }
  return NextResponse.json({ success: true });
}