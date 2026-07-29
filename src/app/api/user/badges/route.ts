import { NextResponse } from "next/server";

// Использует то же хранилище, что и админский API
// В будущем оба будут читать из БД

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId") || "mock_user_1";

  // Заглушка: возвращаем предустановленные плашки
  const badges = [
    { id: "vip", label: "VIP", variant: "gold", effect: "neon" },
    { id: "verified", label: "Проверенный продавец", variant: "success", effect: "solid" },
    { id: "generous", label: "Щедрый", variant: "warning", effect: "fire" },
  ];

  return NextResponse.json(badges);
}