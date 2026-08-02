import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabase
    .from("listings")
    .select(`
      id, title, price, created_at,
      seller:seller_id ( id, username, avatar_url )
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(4);

  if (error || !data) return NextResponse.json([]);

  return NextResponse.json(data);
}