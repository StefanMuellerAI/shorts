"use client";

import { useState } from "react";
import { createUser } from "@/actions/users";
import { useToast } from "@/components/toast";
import { Loader2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";

export function CreateUserForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      await createUser(formData);
      toast("Benutzer erstellt!", "success");
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Fehler beim Erstellen.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-zinc-700 bg-zinc-900/30 px-4 py-4 text-sm font-medium text-zinc-400 transition hover:border-zinc-600 hover:text-zinc-300"
      >
        <UserPlus className="h-4 w-4" />
        Neuen Benutzer anlegen
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3 animate-fade-in"
    >
      <h2 className="text-sm font-semibold text-white">Neuer Benutzer</h2>

      <input
        name="name"
        required
        placeholder="Name"
        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-indigo-500"
      />
      <input
        name="email"
        type="email"
        required
        placeholder="E-Mail"
        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-indigo-500"
      />
      <input
        name="password"
        type="text"
        required
        placeholder="Initiales Passwort"
        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white placeholder-zinc-500 outline-none focus:border-indigo-500"
      />
      <select
        name="role"
        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:border-indigo-500"
      >
        <option value="USER">Benutzer</option>
        <option value="ADMIN">Admin</option>
      </select>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Erstellen
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-400 transition hover:bg-zinc-700"
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}
