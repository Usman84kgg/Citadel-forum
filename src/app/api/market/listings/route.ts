import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { marketDB } from "@/lib/db/market";
import { supabase } from "@/lib/db/supabase";

const SECRET = new TextEncoder().encode(process.env.AUTH_SECRET || "citadel-dev-secret-change-in-production");

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || undefined;
  const listings = await marketDB.getListings(category);
  return NextResponse.json(listings);
}

export async function POST(request: Request) {
  const token = request.headers.get("cookie")?.split("; ").find((c) => c.startsWith("access_token="))?.split("=")[1];
  if (!token) return NextResponse.json({ error: "Не авторизован" }, { status: 401 });

  try {
    const { payload } = await jwtVerify(token, SECRET);

    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const price = parseFloat(formData.get("price") as string);
    const categorySlug = formData.get("categorySlug") as string;
    const type = formData.get("type") as string;
    const file = formData.get("image") as File | null;

    let imageUrl: string | null = null;

    if (file && file.size > 0) {
      const ext = file.name.split(".").pop() || "jpg";
      const fileName = `${crypto.randomUUID()}.${ext}`;
      const buffer = await file.arrayBuffer();

      const { error: uploadError } = await supabase.storage
        .from("listing-images")
        .upload(fileName, buffer, { contentType: file.type, upsert: false });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("listing-images").getPublicUrl(fileName);
      imageUrl = urlData.publicUrl;
    }

    const listing = await marketDB.createListing({
      title,
      description,
      price,
      categorySlug,
      type,
      sellerId: payload.sub as string,
      imageUrl,
    });

    return NextResponse.json({ success: true, listing });
  } catch (e: any) {
    console.error("createListing error:", e);
    return NextResponse.json({ error: e.message || "Ошибка" }, { status: 500 });
  }
}
