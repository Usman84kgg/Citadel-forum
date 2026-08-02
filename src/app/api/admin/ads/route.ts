import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("ad_campaigns")
    .select("*")
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Ошибка GET ads:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data || []);
}

export async function POST(req: Request) {
  try {
    const b = await req.json();
    console.log("POST /api/admin/ads received:", b);
    
    if (b.action === "toggle") {
      const { data: ex } = await supabase.from("ad_campaigns").select("is_active").eq("id", b.id).single();
      await supabase.from("ad_campaigns").update({ is_active: !ex?.is_active }).eq("id", b.id);
      return NextResponse.json({ success: true });
    }
    
    if (b.action === "delete") {
      await supabase.from("ad_campaigns").delete().eq("id", b.id);
      return NextResponse.json({ success: true });
    }

    const insertData: any = {
      title: b.title,
      slot: b.slot || "slot_1",
      media_type: b.mediaType || "text",
      text_content: b.textContent || null,
      link_url: b.linkUrl || null,
      is_active: true,
      priority: b.priority || 0,
    };

    if (b.mediaUrl && b.mediaType !== "text") {
      insertData.media_url = b.mediaUrl;
    }

    console.log("Вставка данных:", insertData);

    const { data, error } = await supabase
      .from("ad_campaigns")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Ошибка вставки:", error);
      return NextResponse.json({ 
        error: "Ошибка создания",
        details: error.message 
      }, { status: 500 });
    }

    console.log("Успешно создано:", data);
    return NextResponse.json({ success: true, ad: data });
  } catch (error) {
    console.error("Критическая ошибка:", error);
    return NextResponse.json({ 
      error: "Ошибка сервера",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}