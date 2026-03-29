import { type NextRequest, NextResponse } from "next/server";
import { get } from "@vercel/blob";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse("Nicht authentifiziert", { status: 401 });
  }

  const url = request.nextUrl.searchParams.get("url");

  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  try {
    const result = await get(url, { access: "private" });

    if (result?.statusCode !== 200) {
      return new NextResponse("Not found", { status: 404 });
    }

    return new NextResponse(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType,
        "X-Content-Type-Options": "nosniff",
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch {
    return new NextResponse("Blob not found", { status: 404 });
  }
}
