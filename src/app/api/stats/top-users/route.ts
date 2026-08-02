import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";
import { getAuthorsProfileData } from "@/lib/db/userProfile";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data: users, error } = await supabase
    .from("users")
    .select("id, username, avatar_url")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error || !users || users.length === 0) {
    return NextResponse.json([]);
  }

  const ids = users.map((u) => u.id);
  const profiles = await getAuthorsProfileData(ids);

  const enriched = users
    .map((u) => ({
      id: u.id,
      username: u.username,
      avatarUrl: u.avatar_url,
      reputation: profiles[u.id]?.stats.reputation || 0,
      deals: profiles[u.id]?.stats.deals || 0,
      badges: profiles[u.id]?.badges || [],
    }))
    .sort((a, b) => b.reputation - a.reputation || b.deals - a.deals)
    .slice(0, 5);

  return NextResponse.json(enriched);
}