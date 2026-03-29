"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Clapperboard, LogOut, Settings, FileJson, Sparkles, Users } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function TopBar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isAdmin = session?.user?.role === "ADMIN";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600">
            <Clapperboard className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-bold text-white">Shorts</span>
        </Link>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-zinc-300 uppercase transition hover:bg-zinc-700"
          >
            {session?.user?.name?.charAt(0) || "?"}
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-zinc-800 bg-zinc-900 p-1 shadow-2xl animate-fade-in">
              <div className="border-b border-zinc-800 px-3 py-2">
                <p className="text-sm font-medium text-white truncate">
                  {session?.user?.name}
                </p>
                <p className="text-xs text-zinc-500 truncate">
                  {session?.user?.email}
                </p>
              </div>

              {isAdmin && (
                <>
                  <Link
                    href="/admin/kategorien"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800"
                  >
                    <Settings className="h-4 w-4" />
                    Kategorien
                  </Link>
                  <Link
                    href="/admin/benutzer"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800"
                  >
                    <Users className="h-4 w-4" />
                    Benutzer
                  </Link>
                  <Link
                    href="/admin/einstellungen"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800"
                  >
                    <Sparkles className="h-4 w-4" />
                    KI-Prompt
                  </Link>
                  <Link
                    href="/admin/import"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800"
                  >
                    <FileJson className="h-4 w-4" />
                    Import
                  </Link>
                </>
              )}

              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 transition hover:bg-zinc-800"
              >
                <LogOut className="h-4 w-4" />
                Abmelden
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
