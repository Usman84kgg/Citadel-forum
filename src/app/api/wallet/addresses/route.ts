import { NextResponse } from "next/server";
import { walletDB } from "@/lib/db/wallet";

export async function GET() {
  const addresses = await walletDB.getAddresses();
  return NextResponse.json(addresses);
}