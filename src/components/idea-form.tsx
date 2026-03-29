"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createIdea, updateIdea } from "@/actions/ideas";
import { MagicButton } from "@/components/magic-button";
import { BulletEditor } from "@/components/bullet-editor";
import { VoiceInput } from "@/components/voice-input";
import { useToast } from "@/components/toast";
import {
  Link as LinkIcon,
  Image,
  Upload,
  Loader2,
  X,
  Clipboard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getBlobDisplayUrl } from "@/lib/blob";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface IdeaFormProps {
  categories: Category[];
  initialData?: {
    id: string;
    hook: string[];
    kernaussage: string[];
    meinTake: string[];
    categoryId: string;
    sourceType: string;
    sourceUrl: string | null;
    screenshotUrl: string | null;
  };
}

export function IdeaForm({ categories, initialData }: IdeaFormProps) {
  const { toast } = useToast();
  const router = useRouter();
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

  const [hook, setHook] = useState<string[]>(
    initialData?.hook?.length ? initialData.hook : [""]
  );
  const [kernaussage, setKernaussage] = useState<string[]>(
    initialData?.kernaussage?.length ? initialData.kernaussage : [""]
  );
  const [meinTake, setMeinTake] = useState<string[]>(
    initialData?.meinTake?.length ? initialData.meinTake : [""]
  );
  const [categoryId, setCategoryId] = useState(initialData?.categoryId || "");
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const handlePasteOrDrop = useCallback(
    (file: File) => {
      if (file.type.startsWith("image/")) {
        setSourceType("SCREENSHOT");
        handleUploadFile(file);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) handlePasteOrDrop(file);
          return;
        }
      }
    }
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [handlePasteOrDrop]);

  async function handleUploadFile(file: File) {
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
        toast(data.error || "Upload fehlgeschlagen.", "error");
      }
    } catch {
      toast("Upload fehlgeschlagen.", "error");
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) {
      handleUploadFile(file);
    }
  }

  async function handlePasteFromClipboard() {
    try {
      const items = await navigator.clipboard.read();
      for (const item of items) {
        const imageType = item.types.find((t) => t.startsWith("image/"));
        if (imageType) {
          const blob = await item.getType(imageType);
          const file = new File([blob], `paste-${Date.now()}.png`, {
            type: imageType,
          });
          handleUploadFile(file);
          return;
        }
      }
      toast("Kein Bild in der Zwischenablage gefunden.", "error");
    } catch {
      toast("Zugriff auf Zwischenablage nicht moeglich.", "error");
    }
  }

  function handleAiResult(result: {
    hook: string[];
    kernaussage: string[];
    meinTake: string[];
    categoryId?: string;
  }) {
    setHook(result.hook.length > 0 ? result.hook : [""]);
    setKernaussage(result.kernaussage.length > 0 ? result.kernaussage : [""]);
    setMeinTake(result.meinTake.length > 0 ? result.meinTake : [""]);
    if (result.categoryId) setCategoryId(result.categoryId);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const filteredHook = hook.filter((s) => s.trim());
      const filteredKern = kernaussage.filter((s) => s.trim());
      const filteredTake = meinTake.filter((s) => s.trim());

      if (filteredHook.length === 0 || filteredKern.length === 0 || filteredTake.length === 0) {
        toast("Bitte fuelle mindestens einen Stichpunkt pro Feld aus.", "error");
        setSubmitting(false);
        return;
      }

      const formData = new FormData();
      formData.set("hook", JSON.stringify(filteredHook));
      formData.set("kernaussage", JSON.stringify(filteredKern));
      formData.set("meinTake", JSON.stringify(filteredTake));
      formData.set("categoryId", categoryId);
      formData.set("sourceType", sourceType);
      formData.set("sourceUrl", sourceUrl);
      formData.set("screenshotUrl", screenshotUrl);

      if (initialData) {
        const result = await updateIdea(initialData.id, formData);
        toast("Idee aktualisiert!", "success");
        router.push(`/idee/${result.id}`);
      } else {
        await createIdea(formData);
        toast("Idee gespeichert!", "success");
        router.push("/");
      }
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Fehler beim Speichern.",
        "error"
      );
    } finally {
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
                src={getBlobDisplayUrl(screenshotUrl)}
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
            <div
              ref={dropZoneRef}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="space-y-2"
            >
              {uploading ? (
                <div className="flex flex-col items-center gap-2 rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-900/50 px-4 py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-zinc-500" />
                  <span className="text-sm text-zinc-500">Wird hochgeladen...</span>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handlePasteFromClipboard}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-4 text-sm font-medium text-zinc-300 transition hover:bg-zinc-700 hover:text-white active:scale-[0.98]"
                  >
                    <Clipboard className="h-5 w-5" />
                    Einfuegen
                  </button>
                  <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-4 text-sm font-medium text-zinc-300 transition hover:bg-zinc-700 hover:text-white active:scale-[0.98]">
                    <Upload className="h-5 w-5" />
                    Datei waehlen
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUploadFile(file);
                      }}
                    />
                  </label>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Magic Button */}
      <MagicButton
        sourceType={sourceType}
        sourceUrl={sourceUrl}
        screenshotUrl={screenshotUrl}
        categories={categories}
        onResult={handleAiResult}
        disabled={!sourceReady}
      />

      {/* Hook */}
      <BulletEditor
        label="Hook"
        value={hook}
        onChange={setHook}
        placeholder="Aufmerksamkeit erzeugen..."
        minItems={1}
        maxItems={3}
      >
        <VoiceInput
          onTranscription={(bullets) =>
            setHook((prev) => {
              const filtered = prev.filter((s) => s.trim());
              return [...filtered, ...bullets].slice(0, 3);
            })
          }
        />
      </BulletEditor>

      {/* Kernaussage */}
      <BulletEditor
        label="Kernaussage"
        value={kernaussage}
        onChange={setKernaussage}
        placeholder="Zentrale Information..."
        minItems={1}
        maxItems={5}
      >
        <VoiceInput
          onTranscription={(bullets) =>
            setKernaussage((prev) => {
              const filtered = prev.filter((s) => s.trim());
              return [...filtered, ...bullets].slice(0, 5);
            })
          }
        />
      </BulletEditor>

      {/* Mein Take */}
      <BulletEditor
        label="Mein Take"
        value={meinTake}
        onChange={setMeinTake}
        placeholder="Persoenliche Einordnung..."
        minItems={1}
        maxItems={4}
      >
        <VoiceInput
          onTranscription={(bullets) =>
            setMeinTake((prev) => {
              const filtered = prev.filter((s) => s.trim());
              return [...filtered, ...bullets].slice(0, 4);
            })
          }
        />
      </BulletEditor>

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
