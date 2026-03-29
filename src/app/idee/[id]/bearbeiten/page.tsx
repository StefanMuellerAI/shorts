export const dynamic = "force-dynamic";

import { AppShell } from "@/components/app-shell";
import { IdeaForm } from "@/components/idea-form";
import { getIdeaById } from "@/actions/ideas";
import { getCategoriesSimple } from "@/actions/categories";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditIdeaPage({ params }: Props) {
  const { id } = await params;
  const [idea, categories] = await Promise.all([
    getIdeaById(id),
    getCategoriesSimple(),
  ]);

  if (!idea) notFound();

  return (
    <AppShell>
      <div className="mb-5 flex items-center gap-3">
        <Link
          href={`/idee/${id}`}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 transition hover:bg-zinc-700 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-bold text-white">Idee bearbeiten</h1>
      </div>

      <IdeaForm categories={categories} initialData={idea} />
    </AppShell>
  );
}
