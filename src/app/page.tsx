export const dynamic = "force-dynamic";

import { AppShell } from "@/components/app-shell";
import { getIdeasByStatusAndCategory } from "@/actions/ideas";
import { getCategoriesSimple } from "@/actions/categories";
import { CategoryFilter } from "@/components/category-filter";
import { SortableIdeaList } from "@/components/sortable-idea-list";
import { Sparkles } from "lucide-react";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ kategorie?: string }>;
}

export default async function VorratPage({ searchParams }: Props) {
  const params = await searchParams;
  const categoryId = params.kategorie;
  const [ideas, categories] = await Promise.all([
    getIdeasByStatusAndCategory("VORRAT", categoryId),
    getCategoriesSimple(),
  ]);

  return (
    <AppShell>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Vorrat</h1>
          <p className="text-sm text-zinc-500">
            {ideas.length} {ideas.length === 1 ? "Idee" : "Ideen"} zum Abdrehen
          </p>
        </div>
      </div>

      <CategoryFilter categories={categories} activeId={categoryId} />

      {ideas.length === 0 ? (
        <div className="mt-12 flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-zinc-800">
            <Sparkles className="h-8 w-8 text-zinc-600" />
          </div>
          <div>
            <p className="font-medium text-zinc-400">Keine Ideen im Vorrat</p>
            <p className="mt-1 text-sm text-zinc-600">
              Erstelle deine erste Short-Idee!
            </p>
          </div>
          <Link
            href="/idee/neu"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Neue Idee
          </Link>
        </div>
      ) : (
        <SortableIdeaList ideas={ideas} />
      )}
    </AppShell>
  );
}
