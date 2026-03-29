export const dynamic = "force-dynamic";

import { AppShell } from "@/components/app-shell";
import { getCategoriesSimple } from "@/actions/categories";
import { getSetting } from "@/actions/settings";
import { DEFAULT_AI_PROMPT } from "@/lib/ai-prompt";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ImportForm } from "@/components/admin/import-form";

export default async function ImportPage() {
  const [categories, aiPrompt] = await Promise.all([
    getCategoriesSimple(),
    getSetting("ai_prompt"),
  ]);

  return (
    <AppShell>
      <div className="mb-5 flex items-center gap-3">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 transition hover:bg-zinc-700 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-bold text-white">JSON-Import</h1>
      </div>

      <ImportForm
        categories={categories.map((c) => c.name)}
        aiPrompt={aiPrompt || DEFAULT_AI_PROMPT}
      />
    </AppShell>
  );
}
