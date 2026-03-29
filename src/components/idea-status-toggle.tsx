"use client";

import { toggleIdeaStatus } from "@/actions/ideas";
import { useToast } from "@/components/toast";
import { Check, Undo2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  id: string;
  status: string;
}

export function IdeaStatusToggle({ id, status }: Props) {
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isVorrat = status === "VORRAT";

  async function handleClick() {
    setLoading(true);
    try {
      await toggleIdeaStatus(id);
      toast(
        isVorrat ? "Idee als abgedreht markiert!" : "Idee zurueck im Vorrat!",
        "success"
      );
      router.push(isVorrat ? "/" : "/archiv");
    } catch {
      toast("Fehler beim Aendern des Status.", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-50 ${
        isVorrat
          ? "bg-emerald-600 text-white hover:bg-emerald-500"
          : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
      }`}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isVorrat ? (
        <Check className="h-4 w-4" />
      ) : (
        <Undo2 className="h-4 w-4" />
      )}
      {isVorrat ? "Abgedreht" : "Zurueck in Vorrat"}
    </button>
  );
}
