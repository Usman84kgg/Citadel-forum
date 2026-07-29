import { NextResponse } from "next/server";
import { marketDB } from "@/lib/db/market";

export async function GET() {
  const categories = await marketDB.getCategories();
  return NextResponse.json(categories);
}