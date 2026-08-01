import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json([], { status: 200 });
  }

  const { data: badges, error } = await supabase
    .from("user_badges")
    .select("id, label, variant, effect")
    .eq("user_id", userId);

  if (error) {
    console.error("Ошибка получения плашек:", error.message);
    return NextResponse.json([], { status: 200 });
  }

  return NextResponse.json(badges || []);
}