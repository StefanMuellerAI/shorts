"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Archive, PlusCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Vorrat", icon: Sparkles },
  { href: "/idee/neu", label: "Neue Idee", icon: PlusCircle },
  { href: "/archiv", label: "Archiv", icon: Archive },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-xl safe-bottom">
      <div className="mx-auto flex max-w-lg items-center justify-around">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center gap-0.5 py-3 text-xs transition-colors",
                isActive
                  ? "text-indigo-400"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Icon
                className={cn("h-5 w-5", isActive && "text-indigo-400")}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
