import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { marketDB } from "@/lib/db/market";

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || "citadel-dev-secret-change-in-production"
);

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const comments = await marketDB.getComments(id);
  return NextResponse.json(comments);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const token = request.headers
    .get("cookie")
    ?.split("; ")
    .find((c) => c.startsWith("access_token="))
    ?.split("=")[1];

  if (!token) {
    return NextResponse.json(
      { error: "Не авторизован" },
      { status: 401 }
    );
  }

  try {
    const { payload } = await jwtVerify(token, SECRET);
    const { content } = await request.json();

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Комментарий не может быть пустым" },
        { status: 400 }
      );
    }

    const comment = await marketDB.createComment({
      listingId: id,
      userId: payload.sub as string,
      content: content.trim(),
    });

    return NextResponse.json({
      success: true,
      comment,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Ошибка" },
      { status: 500 }
    );
  }
}