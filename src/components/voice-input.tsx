"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { useToast } from "@/components/toast";

interface VoiceInputProps {
  onTranscription: (bullets: string[]) => void;
}

export function VoiceInput({ onTranscription }: VoiceInputProps) {
  const { toast } = useToast();
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [hasMediaDevices, setHasMediaDevices] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    setHasMediaDevices(
      typeof navigator !== "undefined" &&
        !!navigator.mediaDevices?.getUserMedia
    );
  }, []);

  if (!hasMediaDevices) return null;

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const audioBlob = new Blob(chunksRef.current, { type: "audio/webm" });
        await transcribe(audioBlob);
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setRecording(true);
    } catch {
      toast("Mikrofon-Zugriff nicht moeglich.", "error");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setRecording(false);
  }

  async function transcribe(audioBlob: Blob) {
    setProcessing(true);
    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");
      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Transkription fehlgeschlagen");

      const text = data.text?.trim();
      if (!text) {
        toast("Keine Sprache erkannt.", "error");
        return;
      }

      const sentences = text
        .split(/(?<=[.!?])\s+/)
        .map((s: string) => s.trim())
        .filter((s: string) => s.length > 0);

      onTranscription(sentences.length > 0 ? sentences : [text]);
      toast("Sprache transkribiert!", "success");
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Transkription fehlgeschlagen.",
        "error"
      );
    } finally {
      setProcessing(false);
    }
  }

  function handleClick() {
    if (processing) return;
    if (recording) {
      stopRecording();
    } else {
      startRecording();
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={processing}
      className={`flex h-7 w-7 items-center justify-center rounded-md transition ${
        recording
          ? "bg-red-500/20 text-red-400 animate-pulse"
          : processing
            ? "bg-zinc-800 text-zinc-500"
            : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
      }`}
      title={recording ? "Aufnahme stoppen" : "Spracheingabe starten"}
    >
      {processing ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : recording ? (
        <MicOff className="h-3.5 w-3.5" />
      ) : (
        <Mic className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
