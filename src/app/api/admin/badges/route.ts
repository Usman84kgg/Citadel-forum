import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || "c");

let customBadges: Array<{ id: string; label: string; variant: string; effect: string }> = [
  { id: "admin", label: "Администратор", variant: "danger", effect: "neon" },
  { id: "moderator", label: "Модератор", variant: "info", effect: "solid" },
  { id: "vip", label: "VIP", variant: "gold", effect: "neon" },
];

let userBadges: Array<{ userId: string; badgeId: string }> = [
  { userId: "mock_user_1", badgeId: "vip" },
];

async function checkAdmin(request: Request) {
  const token = request.headers
    .get("cookie")
    ?.split("; ")
    .find(function (cookie) {
      return cookie.startsWith("access_token=");
    })
    ?.split("=")[1];

  if (!token) return false;

  try {
    const verification = await jwtVerify(token, SECRET);
    const role = verification.payload.role as string;
    return role === "admin" || role === "owner";
  } catch {
    return false;
  }
}

export async function GET(request: Request) {
  if (!(await checkAdmin(request))) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }
  return NextResponse.json({ badges: customBadges, userBadges });
}

export async function POST(request: Request) {
  if (!(await checkAdmin(request))) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const body = await request.json();

  if (body.action === "create") {
    customBadges.push({
      id: body.id,
      label: body.label,
      variant: body.variant,
      effect: body.effect,
    });
  }

  if (body.action === "assign") {
    userBadges.push({
      userId: body.userId,
      badgeId: body.badgeId,
    });
  }

  if (body.action === "remove") {
    userBadges = userBadges.filter(function (item) {
      return !(item.userId === body.userId && item.badgeId === body.badgeId);
    });
  }

  if (body.action === "delete") {
    customBadges = customBadges.filter(function (item) {
      return item.id !== body.badgeId;
    });
    userBadges = userBadges.filter(function (item) {
      return item.badgeId !== body.badgeId;
    });
  }

  return NextResponse.json({ success: true });
}