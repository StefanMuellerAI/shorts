"use client";

import Link from "next/link";
import { CategoryBadge } from "@/components/category-badge";
import { Check, Undo2, ExternalLink, Image } from "lucide-react";
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
    category: { name: string; color: string };
    createdBy: { name: string };
  };
}

export function IdeaCard({ idea }: IdeaCardProps) {
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
  const bulletCount = idea.kernaussage?.length || 0;

  return (
    <div className="group relative rounded-2xl border border-zinc-800 bg-zinc-900/50 p-4 transition hover:border-zinc-700 hover:bg-zinc-900 animate-fade-in">
      <Link href={`/idee/${idea.id}`} className="block">
        <div className="mb-2 flex items-start justify-between gap-3">
          <CategoryBadge name={idea.category.name} color={idea.category.color} />
          <div className="flex items-center gap-1 text-zinc-600">
            {idea.sourceType === "LINK" ? (
              <ExternalLink className="h-3.5 w-3.5" />
            ) : (
              <Image className="h-3.5 w-3.5" />
            )}
          </div>
        </div>

        <h3 className="mb-1 text-base font-semibold text-white leading-snug line-clamp-2">
          {hookPreview}
        </h3>
        <p className="text-xs text-zinc-500">
          {bulletCount} {bulletCount === 1 ? "Punkt" : "Punkte"} Kernaussage
        </p>

        <div className="mt-3 flex items-center justify-between text-xs text-zinc-600">
          <span>{idea.createdBy.name}</span>
          <span>
            {new Date(idea.createdAt).toLocaleDateString("de-DE", {
              day: "2-digit",
              month: "2-digit",
              year: "2-digit",
            })}
          </span>
        </div>
      </Link>

      <button
        onClick={handleToggle}
        className={cn(
          "absolute -right-2 -top-2 flex h-9 w-9 items-center justify-center rounded-full shadow-lg transition active:scale-95",
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
