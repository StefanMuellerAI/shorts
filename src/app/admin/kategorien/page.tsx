export const dynamic = "force-dynamic";

import { AppShell } from "@/components/app-shell";
import { getCategories } from "@/actions/categories";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { CategoryList } from "@/components/admin/category-list";
import { CreateCategoryForm } from "@/components/admin/create-category-form";

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <AppShell>
      <div className="mb-5 flex items-center gap-3">
        <Link
          href="/"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400 transition hover:bg-zinc-700 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="text-xl font-bold text-white">Kategorien</h1>
      </div>

      <div className="space-y-6">
        <CreateCategoryForm />
        <CategoryList categories={categories} />
      </div>
    </AppShell>
  );
}
