"use client";

import { useState, useRef } from "react";
import { createIdea, updateIdea } from "@/actions/ideas";
import { MagicButton } from "@/components/magic-button";
import { useToast } from "@/components/toast";
import {
  Link as LinkIcon,
  Image,
  Upload,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface IdeaFormProps {
  categories: Category[];
  initialData?: {
    id: string;
    hook: string;
    kernaussage: string;
    meinTake: string;
    categoryId: string;
    sourceType: string;
    sourceUrl: string | null;
    screenshotUrl: string | null;
  };
}

export function IdeaForm({ categories, initialData }: IdeaFormProps) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [sourceType, setSourceType] = useState<"LINK" | "SCREENSHOT">(
    (initialData?.sourceType as "LINK" | "SCREENSHOT") || "LINK"
  );
  const [sourceUrl, setSourceUrl] = useState(initialData?.sourceUrl || "");
  const [screenshotUrl, setScreenshotUrl] = useState(
    initialData?.screenshotUrl || ""
  );
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [hook, setHook] = useState(initialData?.hook || "");
  const [kernaussage, setKernaussage] = useState(initialData?.kernaussage || "");
  const [meinTake, setMeinTake] = useState(initialData?.meinTake || "");
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) {
        setScreenshotUrl(data.url);
        toast("Screenshot hochgeladen!", "success");
      } else {
        toast("Upload fehlgeschlagen.", "error");
      }
    } catch {
      toast("Upload fehlgeschlagen.", "error");
    } finally {
      setUploading(false);
    }
  }

  function handleAiResult(result: {
    hook: string;
    kernaussage: string;
    meinTake: string;
    categoryId?: string;
  }) {
    setHook(result.hook);
    setKernaussage(result.kernaussage);
    setMeinTake(result.meinTake);
    if (result.categoryId) setCategoryId(result.categoryId);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.set("hook", hook);
      formData.set("kernaussage", kernaussage);
      formData.set("meinTake", meinTake);
      formData.set("categoryId", categoryId);
      formData.set("sourceType", sourceType);
      formData.set("sourceUrl", sourceUrl);
      formData.set("screenshotUrl", screenshotUrl);

      if (initialData) {
        await updateIdea(initialData.id, formData);
      } else {
        await createIdea(formData);
      }
    } catch {
      toast("Fehler beim Speichern.", "error");
      setSubmitting(false);
    }
  }

  const sourceReady =
    sourceType === "LINK" ? sourceUrl.trim().length > 0 : screenshotUrl.length > 0;

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      {/* Source type toggle */}
      <div>
        <label className="mb-2 block text-sm font-medium text-zinc-300">
          Quelle
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSourceType("LINK")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition",
              sourceType === "LINK"
                ? "bg-indigo-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            )}
          >
            <LinkIcon className="h-4 w-4" />
            Link
          </button>
          <button
            type="button"
            onClick={() => setSourceType("SCREENSHOT")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium transition",
              sourceType === "SCREENSHOT"
                ? "bg-indigo-600 text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
            )}
          >
            <Image className="h-4 w-4" />
            Screenshot
          </button>
        </div>
      </div>

      {/* Source input */}
      {sourceType === "LINK" ? (
        <input
          type="url"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          placeholder="https://beispiel.de/artikel"
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        />
      ) : (
        <div>
          {screenshotUrl ? (
            <div className="relative overflow-hidden rounded-lg border border-zinc-800">
              <img
                src={screenshotUrl}
                alt="Screenshot"
                className="max-h-48 w-full object-cover"
              />
              <button
                type="button"
                onClick={() => setScreenshotUrl("")}
                className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-zinc-900/80 text-zinc-300 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-900/50 px-4 py-8 text-center transition hover:border-zinc-600">
              {uploading ? (
                <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
              ) : (
                <Upload className="h-8 w-8 text-zinc-500" />
              )}
              <span className="text-sm text-zinc-500">
                {uploading ? "Wird hochgeladen..." : "Screenshot hochladen"}
              </span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleUpload(file);
                }}
              />
            </label>
          )}
        </div>
      )}

      {/* Magic Button */}
      {sourceReady && (
        <MagicButton
          sourceType={sourceType}
          sourceUrl={sourceUrl}
          screenshotUrl={screenshotUrl}
          categories={categories}
          onResult={handleAiResult}
        />
      )}

      {/* Hook */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">
          Hook
        </label>
        <input
          value={hook}
          onChange={(e) => setHook(e.target.value)}
          required
          placeholder="Der erste Satz, der Aufmerksamkeit erzeugt..."
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        />
      </div>

      {/* Kernaussage */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">
          Kernaussage
        </label>
        <textarea
          value={kernaussage}
          onChange={(e) => setKernaussage(e.target.value)}
          required
          rows={3}
          placeholder="Die zentrale Information des Shorts..."
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none"
        />
      </div>

      {/* Mein Take */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">
          Mein Take
        </label>
        <textarea
          value={meinTake}
          onChange={(e) => setMeinTake(e.target.value)}
          required
          rows={3}
          placeholder="Deine persoenliche Meinung / Einordnung..."
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-none"
        />
      </div>

      {/* Kategorie */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-zinc-300">
          Kategorie
        </label>
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-white outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="">Kategorie waehlen...</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50 active:scale-[0.98]"
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {initialData ? "Idee aktualisieren" : "Idee speichern"}
      </button>
    </form>
  );
}
