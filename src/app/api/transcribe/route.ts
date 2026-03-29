import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

function getClient() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("ElevenLabs API Key nicht konfiguriert.");
  return new ElevenLabsClient({ apiKey });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  try {
    const client = getClient();

    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json({ error: "Keine Audiodatei" }, { status: 400 });
    }

    const transcript = await client.speechToText.convert({
      file: audioFile,
      modelId: "scribe_v2",
      languageCode: "deu",
    });

    return NextResponse.json({ text: transcript.text });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Transkription fehlgeschlagen.",
      },
      { status: 500 }
    );
  }
}
