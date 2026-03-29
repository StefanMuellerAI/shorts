"use client";

import { TopBar } from "@/components/top-bar";
import { BottomNav } from "@/components/bottom-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <TopBar />
      <main className="mx-auto w-full max-w-lg flex-1 px-4 pb-24 pt-4">
        {children}
      </main>
      <BottomNav />
    </>
  );
}
