import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";
import { getAuthorProfileData } from "@/lib/db/userProfile";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  const { data: user, error } = await supabase
    .from("users")
    .select("id, username, avatar_url, created_at")
    .eq("username", username)
    .single();

  if (error || !user) {
    return NextResponse.json({ error: "Пользователь не найден" }, { status: 404 });
  }

  const [{ badges, stats }, listingsRes] = await Promise.all([
    getAuthorProfileData(user.id),
    supabase
      .from("listings")
      .select("id, title, price, status, created_at")
      .eq("seller_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false }),
  ]);

  return NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      avatarUrl: user.avatar_url,
      createdAt: user.created_at,
    },
    stats,
    badges,
    listings: listingsRes.data || [],
  });
}