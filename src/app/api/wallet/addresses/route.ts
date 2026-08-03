import { NextResponse } from "next/server";
import { walletDB } from "@/lib/wallet/mock-db";

export async function GET() {
  const addresses = walletDB.getActiveAddresses();
  return NextResponse.json(addresses);
}