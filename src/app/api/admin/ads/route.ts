import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";

export async function GET() {
  const { data } = await supabase.from("ad_campaigns").select("*").order("priority", { ascending: false });
  return NextResponse.json(data || []);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { action, id, title, slot, mediaUrl, mediaType, linkUrl, isActive, priority } = body;

  if (action === "toggle") {
    const { data: existing } = await supabase.from("ad_campaigns").select("is_active").eq("id", id).single();
    await supabase.from("ad_campaigns").update({ is_active: !existing?.is_active }).eq("id", id);
    return NextResponse.json({ success: true });
  }

  if (action === "delete") {
    await supabase.from("ad_campaigns").delete().eq("id", id);
    return NextResponse.json({ success: true });
  }

  if (action === "update" && id) {
    await supabase.from("ad_campaigns").update({ title, slot, media_url: mediaUrl, media_type: mediaType, link_url: linkUrl, priority }).eq("id", id);
    return NextResponse.json({ success: true });
  }

  // create
  const { data } = await supabase.from("ad_campaigns").insert({
    title, slot, media_url: mediaUrl, media_type: mediaType || "image",
    link_url: linkUrl, is_active: isActive ?? true, priority: priority || 0,
    created_by: "admin",
  }).select().single();

  return NextResponse.json({ success: true, ad: data });
}