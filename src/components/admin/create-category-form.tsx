"use client";

import { useState } from "react";
import { createCategory } from "@/actions/categories";
import { useToast } from "@/components/toast";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";

const PRESET_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#64748b",
];

export function CreateCategoryForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [color, setColor] = useState(PRESET_COLORS[0]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      formData.set("color", color);
      await createCategory(formData);
      toast("Kategorie erstellt!", "success");
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Fehler beim Erstellen.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-900/30 px-4 py-4 text-sm font-medium text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-300"
      >
        <Plus className="h-4 w-4" />
        Neue Kategorie anlegen
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3 animate-fade-in"
    >
      <h2 className="text-sm font-semibold text-white">Neue Kategorie</h2>

      <input
        name="name"
        required
        placeholder="Kategorie-Name"
        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-indigo-500"
      />

      <div>
        <label className="mb-1.5 block text-xs font-medium text-zinc-500">
          Farbe
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className="h-8 w-8 rounded-full transition-transform hover:scale-110"
              style={{
                backgroundColor: c,
                outline: color === c ? `2px solid ${c}` : "none",
                outlineOffset: "2px",
              }}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Erstellen
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-400 transition hover:bg-zinc-700"
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}
