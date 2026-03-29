import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "Keine Datei" }, { status: 400 });
  }

  const blob = await put(`screenshots/${Date.now()}-${file.name}`, file, {
    access: "private",
    contentType: file.type,
  });

  return NextResponse.json({ url: blob.url, pathname: blob.pathname });
}
