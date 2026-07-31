import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/password";
import { supabase } from "@/lib/db/supabase";

export async function GET() {
  // Удаляем старые записи
  await supabase.from("users").delete().eq("email", "citadelforum77@gmail.com");

  // Создаём владельца с правильным хешем
  const passwordHash = await hashPassword("password");

  const { data, error } = await supabase.from("users").insert({
    email: "citadelforum77@gmail.com",
    username: "CitadelOwner",
    password_hash: passwordHash,
    email_verified: true,
  }).select().single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, user: data });
}