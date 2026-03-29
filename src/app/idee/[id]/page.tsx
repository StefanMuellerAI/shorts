export const dynamic = "force-dynamic";

import { AppShell } from "@/components/app-shell";
import { getIdeaById } from "@/actions/ideas";
import { CategoryBadge } from "@/components/category-badge";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Image, Pencil } from "lucide-react";
import { IdeaStatusToggle } from "@/components/idea-status-toggle";
import { IdeaDeleteButton } from "@/components/idea-delete-button";
import { getBlobDisplayUrl } from "@/lib/blob";

interface Props {
  params: Promise<{ id: string }>;
}

function BulletList({ items }: { items: string[] }) {
  if (!items || items.length === 0) return null;
  return (
    <ul className="space-y-1.5">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2 text-sm text-zinc-300 leading-relaxed">
          <span className="shrink-0 text-zinc-500">–</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

export default async function IdeaDetailPage({ params }: Props) {
  const { id } = await params;
  const idea = await getIdeaById(id);

  if (!idea) notFound();

  return (
    <AppShell>
      <div className="mb-5 flex items-center gap-3">
        <Link
          href={idea.status === "VORRAT" ? "/" : "/archiv"}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 transition hover:bg-zinc-700 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1" />
        <Link
          href={`/idee/${id}/bearbeiten`}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 transition hover:bg-zinc-700 hover:text-white"
        >
          <Pencil className="h-4 w-4" />
        </Link>
      </div>

      <div className="space-y-5">
        <div className="flex items-center gap-3">
          {idea.category && (
            <CategoryBadge name={idea.category.name} color={idea.category.color} />
          )}
          <span className="flex items-center gap-1 text-xs text-zinc-600">
            {idea.sourceType === "LINK" ? (
              <ExternalLink className="h-3 w-3" />
            ) : (
              <Image className="h-3 w-3" />
            )}
            {idea.sourceType === "LINK" ? "Link" : "Screenshot"}
          </span>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Hook
            </h2>
            <BulletList items={idea.hook} />
          </div>

          <div>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Kernaussage
            </h2>
            <BulletList items={idea.kernaussage} />
          </div>

          <div>
            <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Mein Take
            </h2>
            <BulletList items={idea.meinTake} />
          </div>
        </div>

        {idea.sourceType === "LINK" && idea.sourceUrl && (
          <a
            href={idea.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2.5 text-sm text-indigo-400 transition hover:bg-zinc-900"
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            <span className="truncate">{idea.sourceUrl}</span>
          </a>
        )}

        {idea.sourceType === "SCREENSHOT" && idea.screenshotUrl && (
          <div className="overflow-hidden rounded-lg border border-zinc-800">
            <img
              src={getBlobDisplayUrl(idea.screenshotUrl)}
              alt="Quelle Screenshot"
              className="w-full"
            />
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-zinc-600">
          <span>Von {idea.createdBy.name}</span>
          <span>·</span>
          <span>
            {new Date(idea.createdAt).toLocaleDateString("de-DE", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>

        <div className="flex gap-3 pt-2">
          <IdeaStatusToggle id={idea.id} status={idea.status} />
          <IdeaDeleteButton id={idea.id} />
        </div>
      </div>
    </AppShell>
  );
}
