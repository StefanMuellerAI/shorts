export const dynamic = "force-dynamic";

import { AppShell } from "@/components/app-shell";
import { IdeaForm } from "@/components/idea-form";
import { getCategoriesSimple } from "@/actions/categories";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function NewIdeaPage() {
  const categories = await getCategoriesSimple();

  return (
    <AppShell>
      <div className="mb-5 flex items-center gap-3">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 transition hover:bg-zinc-700 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-bold text-white">Neue Idee</h1>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-center">
          <p className="text-sm text-amber-400">
            Noch keine Kategorien vorhanden. Bitte erstelle zuerst Kategorien im
            Admin-Bereich.
          </p>
          <Link
            href="/admin/kategorien"
            className="mt-2 inline-block text-sm font-medium text-indigo-400 hover:underline"
          >
            Kategorien verwalten
          </Link>
        </div>
      ) : (
        <IdeaForm categories={categories} />
      )}
    </AppShell>
  );
}
