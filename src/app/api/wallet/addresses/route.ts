import { NextResponse } from "next/server";
import { walletDB } from "@/lib/wallet/mock-db";

// Публичный эндпоинт — адреса для пополнения доступны всем авторизованным
export async function GET() {
  const addresses = walletDB.getActiveAddresses();
  return NextResponse.json(addresses);
}