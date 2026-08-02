import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("ad_campaigns")
    .select("*")
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || []);
}

export async function POST(req: Request) {
  const b = await req.json();
  
  if (b.action === "toggle") {
    const { data: ex } = await supabase.from("ad_campaigns").select("is_active").eq("id", b.id).single();
    await supabase.from("ad_campaigns").update({ is_active: !ex?.is_active }).eq("id", b.id);
    return NextResponse.json({ success: true });
  }
  
  if (b.action === "delete") {
    await supabase.from("ad_campaigns").delete().eq("id", b.id);
    return NextResponse.json({ success: true });
  }

  const { data, error } = await supabase.from("ad_campaigns").insert({
    title: b.title,
    slot: b.slot || "slot_1",
    media_url: b.mediaUrl || null,
    media_type: b.mediaType || "text",
    text_content: b.textContent || null,
    link_url: b.linkUrl || null,
    is_active: true,
    priority: b.priority || 0,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, ad: data });
}