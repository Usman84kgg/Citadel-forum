import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  const { data, error } = await supabase
    .from("deals")
    .select(`
      id, title, amount, status, created_at,
      buyer:buyer_id ( username ),
      seller:seller_id ( username )
    `)
    .in("status", ["completed", "delivered", "in_progress", "funded"])
    .order("created_at", { ascending: false })
    .limit(3);

  if (error || !data) return NextResponse.json([]);

  return NextResponse.json(data);
}