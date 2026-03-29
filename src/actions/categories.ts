"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getCategories() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { ideas: true } } },
  });
}

export async function getCategoriesSimple() {
  return prisma.category.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createCategory(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Keine Berechtigung");
  }

  const name = formData.get("name") as string;
  const color = formData.get("color") as string;

  if (!name) throw new Error("Name ist erforderlich");

  await prisma.category.create({
    data: { name, color: color || "#6366f1" },
  });

  revalidatePath("/admin/kategorien");
}

export async function updateCategory(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Keine Berechtigung");
  }

  const name = formData.get("name") as string;
  const color = formData.get("color") as string;

  await prisma.category.update({
    where: { id },
    data: { name, color },
  });

  revalidatePath("/admin/kategorien");
}

export async function deleteCategory(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Keine Berechtigung");
  }

  const count = await prisma.shortIdea.count({ where: { categoryId: id } });
  if (count > 0) {
    throw new Error(
      `Kategorie kann nicht geloescht werden, da noch ${count} Ideen zugeordnet sind.`
    );
  }

  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/kategorien");
}
