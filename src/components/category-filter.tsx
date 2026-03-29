"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  color: string;
}

interface CategoryFilterProps {
  categories: Category[];
  activeId?: string;
}

export function CategoryFilter({ categories, activeId }: CategoryFilterProps) {
  const pathname = usePathname();

  if (categories.length === 0) return null;

  return (
    <div className="mb-4 flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      <Link
        href={pathname}
        className={cn(
          "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition",
          !activeId
            ? "bg-indigo-600 text-white"
            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
        )}
      >
        Alle
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          href={`${pathname}?kategorie=${cat.id}`}
          className={cn(
            "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition",
            activeId === cat.id
              ? "text-white"
              : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
          )}
          style={
            activeId === cat.id
              ? { backgroundColor: cat.color, color: "white" }
              : undefined
          }
        >
          {cat.name}
        </Link>
      ))}
    </div>
  );
}
