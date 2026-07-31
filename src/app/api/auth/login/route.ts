import { NextResponse } from "next/server";
import { createAccessToken, createRefreshToken } from "@/lib/auth/jwt";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email обязателен" }, { status: 400 });
    }

    const role = email === "cotadelforum77@gmail.com" ? "owner" : "member";

    const accessToken = await createAccessToken({
      sub: email,
      email,
      username: email.split("@")[0] ?? "User",
      role,
    });

    const refreshToken = await createRefreshToken({
      sub: email,
      type: "refresh",
    });

    const response = NextResponse.json({
      success: true,
      user: { email, username: email.split("@")[0], role },
    });

    response.cookies.set("access_token", accessToken, {
      httpOnly: true, secure: true, sameSite: "lax", maxAge: 600, path: "/",
    });

    response.cookies.set("refresh_token", refreshToken, {
      httpOnly: true, secure: true, sameSite: "lax", maxAge: 604800, path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}