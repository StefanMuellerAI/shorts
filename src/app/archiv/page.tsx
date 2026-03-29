export const dynamic = "force-dynamic";

import { AppShell } from "@/components/app-shell";
import { IdeaCard } from "@/components/idea-card";
import { getIdeasByStatusAndCategory } from "@/actions/ideas";
import { getCategoriesSimple } from "@/actions/categories";
import { CategoryFilter } from "@/components/category-filter";
import { Archive } from "lucide-react";

interface Props {
  searchParams: Promise<{ kategorie?: string }>;
}

export default async function ArchivPage({ searchParams }: Props) {
  const params = await searchParams;
  const categoryId = params.kategorie;
  const [ideas, categories] = await Promise.all([
    getIdeasByStatusAndCategory("ABGEDREHT", categoryId),
    getCategoriesSimple(),
  ]);

  return (
    <AppShell>
      <div className="mb-4">
        <h1 className="text-xl font-bold text-white">Archiv</h1>
        <p className="text-sm text-zinc-500">
          {ideas.length} abgedrehte {ideas.length === 1 ? "Idee" : "Ideen"}
        </p>
      </div>

      <CategoryFilter categories={categories} activeId={categoryId} />

      {ideas.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800">
            <Archive className="h-8 w-8 text-zinc-600" />
          </div>
          <div>
            <p className="font-medium text-zinc-400">Archiv ist leer</p>
            <p className="mt-1 text-sm text-zinc-600">
              Abgedrehte Ideen erscheinen hier.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {ideas.map((idea) => (
            <IdeaCard key={idea.id} idea={idea} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
