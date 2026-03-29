"use client";

import { useState } from "react";
import { importIdeas } from "@/actions/ideas";
import { useToast } from "@/components/toast";
import {
  Upload,
  Loader2,
  CheckCircle2,
  XCircle,
  FileJson,
  Copy,
  Check,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface ImportResult {
  index: number;
  success: boolean;
  error?: string;
}

interface ImportFormProps {
  categories: string[];
  aiPrompt: string;
}

export function ImportForm({ categories, aiPrompt }: ImportFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ImportResult[] | null>(null);
  const [previewCount, setPreviewCount] = useState(0);
  const [copied, setCopied] = useState(false);

  const categoryEnum = categories.length > 0
    ? categories.map((c) => `"${c}"`).join(" | ")
    : "(keine Kategorien angelegt)";

  const sampleJson = JSON.stringify(
    [
      {
        hook: ["Stichpunkt 1", "Stichpunkt 2"],
        kernaussage: ["Punkt 1", "Punkt 2", "Punkt 3"],
        meinTake: ["Take 1", "Take 2"],
        category: categories[0] || "Kategoriename",
        sourceType: "LINK",
        sourceUrl: "https://...",
      },
    ],
    null,
    2
  );

  const promptText = `Ich brauche eine JSON-Datei mit mehreren Short-Video-Ideen. Jede Idee soll nach folgenden inhaltlichen Vorgaben erstellt werden:

---
${aiPrompt}
---

WICHTIG fuer das JSON-Format:
- Das Ergebnis MUSS ein JSON-Array sein.
- Das Feld "category" MUSS exakt einen dieser Werte enthalten: ${categoryEnum}
- Das Feld "categoryName" aus dem Prompt oben heisst im JSON "category".
- Felder "sourceType" (Wert "LINK") und "sourceUrl" (die Quell-URL) muessen enthalten sein.

Beispiel fuer ein Element im Array:
${sampleJson}

Erstelle bitte [ANZAHL] Ideen basierend auf [DEINE QUELLEN/THEMEN].`;

  async function handleCopyPrompt() {
    await navigator.clipboard.writeText(promptText);
    setCopied(true);
    toast("In Zwischenablage kopiert!", "success");
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!Array.isArray(data)) {
        toast("Die JSON-Datei muss ein Array enthalten.", "error");
        return;
      }

      setPreviewCount(data.length);
      setResults(null);
    } catch {
      toast("Ungueltige JSON-Datei.", "error");
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const fileInput = e.currentTarget.querySelector<HTMLInputElement>(
        'input[type="file"]'
      );
      const file = fileInput?.files?.[0];
      if (!file) {
        toast("Bitte eine Datei waehlen.", "error");
        setLoading(false);
        return;
      }

      const text = await file.text();
      const data = JSON.parse(text);

      if (!Array.isArray(data)) {
        toast("Die JSON-Datei muss ein Array enthalten.", "error");
        setLoading(false);
        return;
      }

      const normalized = data.map((item) => ({
        hook: Array.isArray(item.hook) ? item.hook : [item.hook].filter(Boolean),
        kernaussage: Array.isArray(item.kernaussage)
          ? item.kernaussage
          : [item.kernaussage].filter(Boolean),
        meinTake: Array.isArray(item.meinTake)
          ? item.meinTake
          : [item.meinTake].filter(Boolean),
        category: item.category || "",
        sourceType: item.sourceType || "LINK",
        sourceUrl: item.sourceUrl || "",
      }));

      const importResults = await importIdeas(normalized);
      setResults(importResults);

      const successCount = importResults.filter((r) => r.success).length;
      const failCount = importResults.filter((r) => !r.success).length;

      if (failCount === 0) {
        toast(`${successCount} Ideen erfolgreich importiert!`, "success");
      } else {
        toast(
          `${successCount} importiert, ${failCount} fehlgeschlagen.`,
          failCount > successCount ? "error" : "success"
        );
      }

      router.refresh();
    } catch {
      toast("Fehler beim Import.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* KI-Prompt mit Kategorien */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-300">
            Prompt fuer die KI
          </h3>
          <button
            type="button"
            onClick={handleCopyPrompt}
            className="flex items-center gap-1.5 rounded-md bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-300 transition hover:bg-zinc-700"
          >
            {copied ? (
              <Check className="h-3 w-3 text-emerald-400" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            {copied ? "Kopiert" : "Kopieren"}
          </button>
        </div>
        <p className="mb-3 text-xs text-zinc-500">
          Kopiere diesen Prompt und gib ihn einer KI, um ein Importfile erstellen zu lassen.
          Die erlaubten Kategorien sind bereits enthalten.
        </p>
        <div className="rounded-lg bg-zinc-950 p-3">
          <div className="mb-2">
            <span className="text-xs font-medium text-zinc-400">
              Erlaubte Kategorien:
            </span>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {categories.length > 0 ? (
                categories.map((c) => (
                  <span
                    key={c}
                    className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300"
                  >
                    {c}
                  </span>
                ))
              ) : (
                <span className="text-xs text-zinc-600">
                  Noch keine Kategorien angelegt
                </span>
              )}
            </div>
          </div>
          <pre className="overflow-x-auto text-xs text-zinc-500 leading-relaxed whitespace-pre-wrap">
            {promptText}
          </pre>
        </div>
      </div>

      {/* Upload */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-900/50 px-4 py-8 text-center transition hover:border-zinc-600">
          <FileJson className="h-10 w-10 text-zinc-500" />
          <span className="text-sm text-zinc-400">
            {previewCount > 0
              ? `${previewCount} Ideen in der Datei`
              : "JSON-Datei auswaehlen"}
          </span>
          <input
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        {previewCount > 0 && (
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Importiere...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                {previewCount} Ideen importieren
              </>
            )}
          </button>
        )}
      </form>

      {/* Ergebnisse */}
      {results && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-zinc-300">Ergebnis</h3>
          <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
            {results.map((r) => (
              <div key={r.index} className="flex items-center gap-2 text-xs">
                {r.success ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 shrink-0 text-red-400" />
                )}
                <span className={r.success ? "text-zinc-400" : "text-red-400"}>
                  Idee {r.index + 1}: {r.success ? "Importiert" : r.error}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
