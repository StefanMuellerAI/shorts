"use client";

import Link from "next/link";
import { CategoryBadge } from "@/components/category-badge";
import { Archive, Undo2, GripVertical, Trash2 } from "lucide-react";
import { toggleIdeaStatus, deleteIdea } from "@/actions/ideas";
import { useToast } from "@/components/toast";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

interface IdeaCardProps {
  idea: {
    id: string;
    hook: string[];
    status: string;
    category: { name: string; color: string } | null;
  };
  draggable?: boolean;
  showDelete?: boolean;
  onRemove?: (id: string) => void;
  dragHandleProps?: Record<string, unknown>;
}

export function IdeaCard({ idea, draggable, showDelete, onRemove, dragHandleProps }: IdeaCardProps) {
  const { toast } = useToast();
  const router = useRouter();
  const isVorrat = idea.status === "VORRAT";
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function handleToggle() {
    try {
      await toggleIdeaStatus(idea.id);
      toast(
        isVorrat ? "Ins Archiv verschoben." : "Zurueck im Vorrat!",
        "success"
      );
      if (onRemove) {
        onRemove(idea.id);
      } else {
        router.refresh();
      }
    } catch {
      toast("Fehler beim Verschieben.", "error");
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      if (confirmTimer.current) clearTimeout(confirmTimer.current);
      confirmTimer.current = setTimeout(() => setConfirmDelete(false), 4000);
      return;
    }

    if (confirmTimer.current) clearTimeout(confirmTimer.current);
    setDeleting(true);
    try {
      await deleteIdea(idea.id);
      toast("Idee geloescht.", "success");
      if (onRemove) {
        onRemove(idea.id);
      } else {
        router.refresh();
      }
    } catch {
      toast("Fehler beim Loeschen.", "error");
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  const hookPreview = idea.hook?.[0] || "Ohne Hook";

  return (
    <div className="group flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-3 transition hover:border-zinc-700 hover:bg-zinc-900">
      {draggable && (
        <div
          {...dragHandleProps}
          className="shrink-0 cursor-grab touch-none text-zinc-600 hover:text-zinc-400 active:cursor-grabbing"
        >
          <GripVertical className="h-5 w-5" />
        </div>
      )}

      <Link href={`/idee/${idea.id}`} className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          {idea.category && (
            <CategoryBadge name={idea.category.name} color={idea.category.color} />
          )}
        </div>
        <h3 className="text-sm font-semibold text-white leading-snug line-clamp-2">
          {hookPreview}
        </h3>
      </Link>

      <div className="shrink-0 flex flex-col gap-1">
        {showDelete && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className={`flex items-center justify-center gap-1 rounded-full transition active:scale-95 ${
              confirmDelete
                ? "bg-red-500/20 text-red-400 px-2.5 h-8 text-xs font-medium"
                : "text-zinc-600 hover:bg-zinc-800 hover:text-red-400 h-8 w-8"
            } ${deleting ? "opacity-50" : ""}`}
            title={confirmDelete ? "Nochmal tippen zum Loeschen" : "Loeschen"}
          >
            <Trash2 className="h-3.5 w-3.5 shrink-0" />
            {confirmDelete && <span>Loeschen?</span>}
          </button>
        )}
        <button
          onClick={handleToggle}
          className="flex h-8 w-8 items-center justify-center rounded-full transition active:scale-95 text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
          title={isVorrat ? "Ins Archiv verschieben" : "Zurueck in den Vorrat"}
        >
          {isVorrat ? (
            <Archive className="h-3.5 w-3.5" />
          ) : (
            <Undo2 className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
