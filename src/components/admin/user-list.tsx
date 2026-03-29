"use client";

import { deleteUser, resetPassword } from "@/actions/users";
import { useToast } from "@/components/toast";
import { Trash2, Key, Shield, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface UserItem {
  id: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
  _count: { ideas: number };
}

export function UserList({ users }: { users: UserItem[] }) {
  return (
    <div className="space-y-2">
      <h2 className="text-sm font-semibold text-zinc-400">
        {users.length} {users.length === 1 ? "Benutzer" : "Benutzer"}
      </h2>
      {users.map((user) => (
        <UserRow key={user.id} user={user} />
      ))}
    </div>
  );
}

function UserRow({ user }: { user: UserItem }) {
  const { toast } = useToast();
  const router = useRouter();
  const [showReset, setShowReset] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  async function handleDelete() {
    if (!window.confirm(`${user.name} wirklich loeschen?`)) return;
    try {
      await deleteUser(user.id);
      toast("Benutzer geloescht.", "success");
      router.refresh();
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Fehler beim Loeschen.",
        "error"
      );
    }
  }

  async function handleReset() {
    if (!newPassword.trim()) return;
    try {
      await resetPassword(user.id, newPassword);
      toast("Passwort zurueckgesetzt.", "success");
      setShowReset(false);
      setNewPassword("");
    } catch {
      toast("Fehler beim Zuruecksetzen.", "error");
    }
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800">
          {user.role === "ADMIN" ? (
            <Shield className="h-4 w-4 text-indigo-400" />
          ) : (
            <User className="h-4 w-4 text-zinc-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{user.name}</p>
          <p className="text-xs text-zinc-500 truncate">{user.email}</p>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-zinc-600">
            {user._count.ideas} Ideen
          </span>
          <button
            onClick={() => setShowReset(!showReset)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-300"
            title="Passwort zuruecksetzen"
          >
            <Key className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleDelete}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-red-500/10 hover:text-red-400"
            title="Benutzer loeschen"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {showReset && (
        <div className="mt-3 flex gap-2 animate-fade-in">
          <input
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Neues Passwort"
            type="text"
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-white placeholder-zinc-500 outline-none focus:border-indigo-500"
          />
          <button
            onClick={handleReset}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
          >
            Setzen
          </button>
        </div>
      )}
    </div>
  );
}
