import { NextResponse } from "next/server";
import { marketDB } from "@/lib/db/market";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const listing = await marketDB.getListing(params.id);
  if (!listing) return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  return NextResponse.json(listing);
}
