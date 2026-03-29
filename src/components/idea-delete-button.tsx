"use client";

import { deleteIdea } from "@/actions/ideas";
import { useToast } from "@/components/toast";
import { Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
}

export function IdeaDeleteButton({ id }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(false);

  async function handleDelete() {
    if (!confirm) {
      setConfirm(true);
      setTimeout(() => setConfirm(false), 3000);
      return;
    }

    setLoading(true);
    try {
      await deleteIdea(id);
      toast("Idee geloescht.", "success");
      router.push("/");
    } catch {
      toast("Fehler beim Loeschen.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center justify-center gap-2 rounded-lg bg-zinc-800 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/10 active:scale-[0.98] disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
      {confirm ? "Wirklich?" : "Loeschen"}
    </button>
  );
}
