import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { marketDB } from "@/lib/db/market";

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
    const { title, description, price, categorySlug, type } = await request.json();
    const listing = await marketDB.createListing({
      title, description, price, categorySlug, type,
      sellerId: payload.sub as string,
    });
    return NextResponse.json({ success: true, listing });
  } catch {
    return NextResponse.json({ error: "Ошибка" }, { status: 500 });
  }
}