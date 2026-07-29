import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || "citadel-dev-secret-change-in-production");

// Хранилище кастомных плашек (в будущем — БД)
let customBadges: Array<{
  id: string;
  label: string;
  variant: string;
  effect: string;
  color?: string;
}> = [
  { id: "admin", label: "Администратор", variant: "danger", effect: "neon" },
  { id: "moderator", label: "Модератор", variant: "info", effect: "solid" },
  { id: "verified", label: "Проверенный продавец", variant: "success", effect: "solid" },
  { id: "vip", label: "VIP", variant: "gold", effect: "neon" },
  { id: "generous", label: "Щедрый", variant: "warning", effect: "fire" },
  { id: "guarantor", label: "Гарант", variant: "info", effect: "outline" },
  { id: "newbie", label: "Новый пользователь", variant: "muted", effect: "solid" },
];

// Плашки, выданные пользователям
let userBadges: Array<{ userId: string; badgeId: string; customLabel?: string; customValue?: string }> = [
  { userId: "mock_user_1", badgeId: "vip" },
  { userId: "mock_user_1", badgeId: "verified" },
];

async function checkAdmin(request: Request) {
  const token = request.headers.get("cookie")?.split("; ").find((c) => c.startsWith("access_token="))?.split("=")[1];
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload.role === "admin" || payload.role === "owner";
  } catch { return false; }
}

// GET — список всех доступных плашек
export async function GET(request: Request) {
  if (!(await checkAdmin(request))) return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  return NextResponse.json({ badges: customBadges, userBadges });
}

// POST — создать новую плашку или выдать пользователю
export async function POST(request: Request) {
  if (!(await checkAdmin(request))) return NextResponse.json({ error: "Доступ запрещён" }, { status: 403 });
  const body = await request.json();

  // Создание новой плашки
  if (body.action === "create") {
    const badge = {
      id: body.id || `badge_${Date.now()}`,
      label: body.label,
      variant: body.variant || "gold",
      effect: body.effect || "solid",
      color: body.color,
    };
    customBadges.push(badge);
    return NextResponse.json({ success: true, badge });
  }

  // Выдача плашки пользователю
  if (body.action === "assign") {
    userBadges.push({
      userId: body.userId,
      badgeId: body.badgeId,
      customLabel: body.customLabel,
      customValue: body.customValue,
    });
    return NextResponse.json({ success: true });
  }

  // Удаление плашки у пользователя
  if (body.action === "remove") {
    userBadges = userBadges.filter(
      (ub) => !(ub.userId === body.userId && ub.badgeId === body.badgeId),
    );
    return NextResponse.json({ success: true });
  }

  // Удаление плашки из системы
  if (body.action === "delete") {
    customBadges = customBadges.filter((b) => b.id !== body.badgeId);
    userBadges = userBadges.filter((ub) => ub.badgeId !== body.badgeId);
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: "Неизвестное действие" }, { status: 400 });
}