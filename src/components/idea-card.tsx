"use client";

import Link from "next/link";
import { CategoryBadge } from "@/components/category-badge";
import { Check, Undo2, GripVertical } from "lucide-react";
import { toggleIdeaStatus } from "@/actions/ideas";
import { useToast } from "@/components/toast";
import { cn } from "@/lib/utils";

interface IdeaCardProps {
  idea: {
    id: string;
    hook: string[];
    kernaussage: string[];
    sourceType: string;
    sourceUrl: string | null;
    status: string;
    createdAt: Date;
    category: { name: string; color: string } | null;
    createdBy: { name: string };
  };
  draggable?: boolean;
  dragHandleProps?: Record<string, unknown>;
}

export function IdeaCard({ idea, draggable, dragHandleProps }: IdeaCardProps) {
  const { toast } = useToast();
  const isVorrat = idea.status === "VORRAT";

  async function handleToggle() {
    try {
      await toggleIdeaStatus(idea.id);
      toast(
        isVorrat ? "Idee als abgedreht markiert!" : "Idee zurueck im Vorrat!",
        "success"
      );
    } catch {
      toast("Fehler beim Aendern des Status.", "error");
    }
  }

  const hookPreview = idea.hook?.[0] || "Ohne Hook";

  return (
    <div className="group relative flex items-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-3 transition hover:border-zinc-700 hover:bg-zinc-900">
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

      <button
        onClick={handleToggle}
        className={cn(
          "shrink-0 flex h-9 w-9 items-center justify-center rounded-full shadow-lg transition active:scale-95",
          isVorrat
            ? "bg-emerald-600 text-white hover:bg-emerald-500"
            : "bg-zinc-700 text-zinc-300 hover:bg-zinc-600"
        )}
        title={isVorrat ? "Als abgedreht markieren" : "Zurueck in den Vorrat"}
      >
        {isVorrat ? (
          <Check className="h-4 w-4" strokeWidth={3} />
        ) : (
          <Undo2 className="h-4 w-4" />
        )}
      </button>
    </div>
  );
}
