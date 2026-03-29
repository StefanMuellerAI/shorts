"use client";

import { useState } from "react";
import { importIdeas } from "@/actions/ideas";
import { useToast } from "@/components/toast";
import { Upload, Loader2, CheckCircle2, XCircle, FileJson } from "lucide-react";
import { useRouter } from "next/navigation";

interface ImportResult {
  index: number;
  success: boolean;
  error?: string;
}

export function ImportForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ImportResult[] | null>(null);
  const [previewCount, setPreviewCount] = useState(0);

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

      {results && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-zinc-300">Ergebnis</h3>
          <div className="max-h-64 space-y-1 overflow-y-auto rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
            {results.map((r) => (
              <div
                key={r.index}
                className="flex items-center gap-2 text-xs"
              >
                {r.success ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                ) : (
                  <XCircle className="h-3.5 w-3.5 shrink-0 text-red-400" />
                )}
                <span className={r.success ? "text-zinc-400" : "text-red-400"}>
                  Idee {r.index + 1}:{" "}
                  {r.success ? "Importiert" : r.error}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <h3 className="mb-2 text-sm font-semibold text-zinc-300">
          Erwartetes JSON-Format
        </h3>
        <pre className="overflow-x-auto text-xs text-zinc-500 leading-relaxed">
{`[
  {
    "hook": ["Stichpunkt 1", "Stichpunkt 2"],
    "kernaussage": ["Punkt 1", "Punkt 2", "Punkt 3"],
    "meinTake": ["Take 1", "Take 2"],
    "category": "Kategoriename",
    "sourceType": "LINK",
    "sourceUrl": "https://..."
  }
]`}
        </pre>
      </div>
    </div>
  );
}
