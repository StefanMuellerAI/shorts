import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

const MAX_DIMENSION = 2048;
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4 MB target (under Anthropic's 5 MB limit)

async function compressImage(buffer: Buffer): Promise<{ data: Buffer; contentType: string }> {
  let img = sharp(buffer).rotate(); // auto-rotate based on EXIF

  const metadata = await img.metadata();
  const width = metadata.width || 0;
  const height = metadata.height || 0;

  if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
    img = img.resize(MAX_DIMENSION, MAX_DIMENSION, { fit: "inside", withoutEnlargement: true });
  }

  let quality = 85;
  let output = await img.jpeg({ quality, mozjpeg: true }).toBuffer();

  while (output.length > MAX_FILE_SIZE && quality > 30) {
    quality -= 10;
    output = await img.jpeg({ quality, mozjpeg: true }).toBuffer();
  }

  return { data: output, contentType: "image/jpeg" };
}

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

  const arrayBuffer = await file.arrayBuffer();
  const { data, contentType } = await compressImage(Buffer.from(arrayBuffer));

  const filename = file.name.replace(/\.[^.]+$/, ".jpg");

  const blob = await put(`screenshots/${Date.now()}-${filename}`, data, {
    access: "private",
    contentType,
  });

  return NextResponse.json({ url: blob.url, pathname: blob.pathname });
}
