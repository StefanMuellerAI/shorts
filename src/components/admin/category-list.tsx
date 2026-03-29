"use client";

import { deleteCategory, updateCategory } from "@/actions/categories";
import { useToast } from "@/components/toast";
import { Trash2, Pencil, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CategoryItem {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  _count: { ideas: number };
}

export function CategoryList({ categories }: { categories: CategoryItem[] }) {
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-zinc-400">
        {categories.length}{" "}
        {categories.length === 1 ? "Kategorie" : "Kategorien"}
      </h2>
      {categories.map((cat) => (
        <CategoryRow key={cat.id} category={cat} />
      ))}
    </div>
  );
}

function CategoryRow({ category }: { category: CategoryItem }) {
  const { toast } = useToast();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name);
  const [color, setColor] = useState(category.color);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const formData = new FormData();
      formData.set("name", name);
      formData.set("color", color);
      await updateCategory(category.id, formData);
      toast("Kategorie aktualisiert.", "success");
      setEditing(false);
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

  async function handleDelete() {
    try {
      await deleteCategory(category.id);
      toast("Kategorie geloescht.", "success");
      router.refresh();
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Fehler beim Loeschen.",
        "error"
      );
    }
  }

  if (editing) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 space-y-3 animate-fade-in">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white outline-none focus:border-indigo-500"
        />
        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-500">Farbe:</label>
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {saving && <Loader2 className="h-3 w-3 animate-spin" />}
            Speichern
          </button>
          <button
            onClick={() => {
              setEditing(false);
              setName(category.name);
              setColor(category.color);
            }}
            className="rounded-lg bg-zinc-800 px-3 py-1.5 text-xs text-zinc-400 hover:bg-zinc-700"
          >
            Abbrechen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
      <div
        className="h-4 w-4 shrink-0 rounded-full"
        style={{ backgroundColor: category.color }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">
          {category.name}
        </p>
        <p className="text-xs text-zinc-500">{category._count.ideas} Ideen</p>
      </div>
      <button
        onClick={() => setEditing(true)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-300"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={handleDelete}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
