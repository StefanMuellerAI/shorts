"use client";

import { useState } from "react";
import { setSetting } from "@/actions/settings";
import { useToast } from "@/components/toast";
import { Loader2, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";

interface PromptEditorProps {
  currentPrompt: string;
  defaultPrompt: string;
}

export function PromptEditor({ currentPrompt, defaultPrompt }: PromptEditorProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [prompt, setPrompt] = useState(currentPrompt);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await setSetting("ai_prompt", prompt);
      toast("KI-Prompt gespeichert!", "success");
      router.refresh();
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Fehler beim Speichern.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  }

  function handleReset() {
    setPrompt(defaultPrompt);
  }

  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm font-medium text-zinc-300">
            KI-Prompt (System-Prompt fuer Claude)
          </label>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1 text-xs text-zinc-500 transition hover:text-zinc-300"
          >
            <RotateCcw className="h-3 w-3" />
            Zuruecksetzen
          </button>
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={16}
          className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 resize-y font-mono"
        />
        <p className="mt-1 text-xs text-zinc-600">
          Dieser Prompt wird als System-Prompt an Claude gesendet. Das JSON-Antwortformat
          mit Arrays (hook, kernaussage, meinTake, categoryName) muss beibehalten werden.
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        Prompt speichern
      </button>
    </div>
  );
}
