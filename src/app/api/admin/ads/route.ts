import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";

export async function GET() {
  const { data } = await supabase.from("ad_campaigns").select("*").order("priority", { ascending: false });
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
  const { data } = await supabase.from("ad_campaigns").insert({
    title: b.title, slot: b.slot, media_url: b.mediaUrl, media_type: b.mediaType || "image",
    link_url: b.linkUrl, is_active: true, priority: b.priority || 0, created_by: "admin",
  }).select().single();
  return NextResponse.json({ success: true, ad: data });
}