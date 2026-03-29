import Anthropic from "@anthropic-ai/sdk";
import { auth } from "@/lib/auth";
import { get } from "@vercel/blob";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `Du bist ein Experte fuer Social-Media-Content, speziell fuer Short-Videos (TikTok, YouTube Shorts, Instagram Reels).

Deine Aufgabe: Analysiere die gegebene Quelle (Website-Inhalt oder Bild) und erstelle daraus eine Short-Video-Idee mit folgenden Feldern:

1. **Hook**: Ein packender erster Satz (1-2 Saetze), der sofort Aufmerksamkeit erregt und zum Weiterschauen motiviert. Direkt, provokant oder ueberraschend.
2. **Kernaussage**: Die zentrale Information oder Botschaft des Shorts in 2-4 Saetzen. Was soll der Zuschauer lernen oder verstehen?
3. **Mein Take**: Eine persoenliche Einordnung oder Meinung zum Thema in 2-3 Saetzen. Authentisch und meinungsstark.
4. **Kategorie**: Waehle die passendste Kategorie aus der gegebenen Liste.

Antworte IMMER als valides JSON im folgenden Format:
{
  "hook": "...",
  "kernaussage": "...",
  "meinTake": "...",
  "categoryName": "..."
}`;

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { sourceType, sourceUrl, screenshotUrl, categories } = body;

    const categoryList = categories
      .map((c: { name: string }) => c.name)
      .join(", ");

    const userPrompt = `Verfuegbare Kategorien: ${categoryList}\n\nErstelle eine Short-Video-Idee basierend auf dieser Quelle.`;

    type ImageMediaType = "image/png" | "image/jpeg" | "image/gif" | "image/webp";

    type ContentBlock =
      | { type: "text"; text: string }
      | {
          type: "image";
          source: { type: "base64"; media_type: ImageMediaType; data: string };
        };

    const content: ContentBlock[] = [];

    if (sourceType === "LINK" && sourceUrl) {
      try {
        const res = await fetch(sourceUrl, {
          headers: { "User-Agent": "Mozilla/5.0 (compatible; ShortsBot/1.0)" },
          signal: AbortSignal.timeout(10000),
        });
        const html = await res.text();
        const textContent = html
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
          .replace(/<[^>]+>/g, " ")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, 8000);

        content.push({
          type: "text",
          text: `${userPrompt}\n\nWebsite-URL: ${sourceUrl}\n\nWebsite-Inhalt:\n${textContent}`,
        });
      } catch {
        content.push({
          type: "text",
          text: `${userPrompt}\n\nWebsite-URL: ${sourceUrl}\n\n(Inhalt konnte nicht geladen werden, bitte basierend auf der URL analysieren)`,
        });
      }
    } else if (sourceType === "SCREENSHOT" && screenshotUrl) {
      const blobResult = await get(screenshotUrl, { access: "private" });
      if (!blobResult) throw new Error("Screenshot nicht gefunden");
      const arrayBuffer = await new Response(blobResult.stream).arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString("base64");
      const mediaType = (blobResult.blob.contentType || "image/png") as ImageMediaType;

      content.push({
        type: "image",
        source: { type: "base64", media_type: mediaType, data: base64 },
      });
      content.push({ type: "text", text: userPrompt });
    } else {
      return NextResponse.json(
        { error: "Keine Quelle angegeben" },
        { status: 400 }
      );
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content }],
    });

    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      throw new Error("Keine Textantwort von Claude");
    }

    const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Kein JSON in der Antwort gefunden");

    const result = JSON.parse(jsonMatch[0]);

    const matchedCategory = categories.find(
      (c: { id: string; name: string }) =>
        c.name.toLowerCase() === result.categoryName?.toLowerCase()
    );

    return NextResponse.json({
      hook: result.hook,
      kernaussage: result.kernaussage,
      meinTake: result.meinTake,
      categoryId: matchedCategory?.id || null,
    });
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { error: "KI-Generierung fehlgeschlagen. Bitte versuche es erneut." },
      { status: 500 }
    );
  }
}
