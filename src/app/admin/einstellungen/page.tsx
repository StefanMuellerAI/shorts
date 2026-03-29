export const dynamic = "force-dynamic";

import { AppShell } from "@/components/app-shell";
import { getSetting } from "@/actions/settings";
import { DEFAULT_AI_PROMPT } from "@/lib/ai-prompt";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PromptEditor } from "@/components/admin/prompt-editor";

export default async function SettingsPage() {
  const currentPrompt = await getSetting("ai_prompt");

  return (
    <AppShell>
      <div className="mb-5 flex items-center gap-3">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 transition hover:bg-zinc-700 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-bold text-white">Einstellungen</h1>
      </div>

      <PromptEditor
        currentPrompt={currentPrompt || DEFAULT_AI_PROMPT}
        defaultPrompt={DEFAULT_AI_PROMPT}
      />
    </AppShell>
  );
}
