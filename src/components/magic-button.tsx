"use client";

import { useState } from "react";
import { Wand2, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/components/toast";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface MagicButtonProps {
  sourceType: "LINK" | "SCREENSHOT";
  sourceUrl: string;
  screenshotUrl: string;
  categories: Category[];
  onResult: (result: {
    hook: string;
    kernaussage: string;
    meinTake: string;
    categoryId?: string;
  }) => void;
  disabled?: boolean;
}

export function MagicButton({
  sourceType,
  sourceUrl,
  screenshotUrl,
  categories,
  onResult,
  disabled,
}: MagicButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  async function handleClick() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceType,
          sourceUrl,
          screenshotUrl,
          categories,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Fehler bei der KI-Generierung");
      }

      onResult(data);
      toast("Felder automatisch ausgefuellt!", "success");
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "KI-Generierung fehlgeschlagen.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading || disabled}
      className="relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:shadow-indigo-500/40 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          KI analysiert...
        </>
      ) : (
        <>
          <Wand2 className="h-5 w-5" />
          Mit KI ausfuellen
          <Sparkles className="h-4 w-4 opacity-60" />
        </>
      )}
      {!loading && !disabled && (
        <div className="absolute inset-0 animate-shimmer pointer-events-none" />
      )}
    </button>
  );
}
