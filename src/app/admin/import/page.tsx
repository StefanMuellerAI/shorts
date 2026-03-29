export const dynamic = "force-dynamic";

import { AppShell } from "@/components/app-shell";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ImportForm } from "@/components/admin/import-form";

export default function ImportPage() {
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

      <ImportForm />
    </AppShell>
  );
}
