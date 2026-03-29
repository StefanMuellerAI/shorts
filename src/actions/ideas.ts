"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { SourceType } from "@prisma/client";

export async function getIdeasByStatus(status: "VORRAT" | "ABGEDREHT") {
  return prisma.shortIdea.findMany({
    where: { status },
    include: { category: true, createdBy: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getIdeasByStatusAndCategory(
  status: "VORRAT" | "ABGEDREHT",
  categoryId?: string
) {
  return prisma.shortIdea.findMany({
    where: {
      status,
      ...(categoryId ? { categoryId } : {}),
    },
    include: { category: true, createdBy: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getIdeaById(id: string) {
  return prisma.shortIdea.findUnique({
    where: { id },
    include: { category: true, createdBy: { select: { name: true, email: true } } },
  });
}

function parseJsonArray(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.filter((s) => typeof s === "string" && s.trim());
  } catch {
    // not JSON
  }
  return raw.split("\n").map((s) => s.trim()).filter(Boolean);
}

export async function createIdea(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Nicht authentifiziert");

  const hookRaw = formData.get("hook") as string;
  const kernaussageRaw = formData.get("kernaussage") as string;
  const meinTakeRaw = formData.get("meinTake") as string;
  const categoryId = formData.get("categoryId") as string;
  const sourceType = formData.get("sourceType") as SourceType;
  const sourceUrl = formData.get("sourceUrl") as string | null;
  const screenshotUrl = formData.get("screenshotUrl") as string | null;

  const hook = parseJsonArray(hookRaw);
  const kernaussage = parseJsonArray(kernaussageRaw);
  const meinTake = parseJsonArray(meinTakeRaw);

  if (hook.length === 0) {
    throw new Error("Bitte gib mindestens einen Hook-Stichpunkt ein.");
  }

  await prisma.shortIdea.create({
    data: {
      hook,
      kernaussage,
      meinTake,
      categoryId: categoryId || null,
      sourceType: sourceType || "LINK",
      sourceUrl: sourceUrl || null,
      screenshotUrl: screenshotUrl || null,
      createdById: session.user.id,
    },
  });

  revalidatePath("/");
  return { success: true };
}

export async function updateIdea(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Nicht authentifiziert");

  const hookRaw = formData.get("hook") as string;
  const kernaussageRaw = formData.get("kernaussage") as string;
  const meinTakeRaw = formData.get("meinTake") as string;
  const categoryId = formData.get("categoryId") as string;
  const sourceType = formData.get("sourceType") as SourceType;
  const sourceUrl = formData.get("sourceUrl") as string | null;
  const screenshotUrl = formData.get("screenshotUrl") as string | null;

  const hook = parseJsonArray(hookRaw);
  const kernaussage = parseJsonArray(kernaussageRaw);
  const meinTake = parseJsonArray(meinTakeRaw);

  await prisma.shortIdea.update({
    where: { id },
    data: {
      hook,
      kernaussage,
      meinTake,
      categoryId,
      sourceType,
      sourceUrl: sourceUrl || null,
      screenshotUrl: screenshotUrl || null,
    },
  });

  revalidatePath("/");
  revalidatePath(`/idee/${id}`);
  return { success: true, id };
}

export async function toggleIdeaStatus(id: string) {
  const idea = await prisma.shortIdea.findUnique({ where: { id } });
  if (!idea) throw new Error("Idee nicht gefunden");

  const newStatus = idea.status === "VORRAT" ? "ABGEDREHT" : "VORRAT";

  await prisma.shortIdea.update({
    where: { id },
    data: { status: newStatus },
  });

  revalidatePath("/");
  revalidatePath("/archiv");
  revalidatePath(`/idee/${id}`);
}

export async function deleteIdea(id: string) {
  await prisma.shortIdea.delete({ where: { id } });
  revalidatePath("/");
  revalidatePath("/archiv");
}

export async function importIdeas(
  ideas: {
    hook: string[];
    kernaussage: string[];
    meinTake: string[];
    category: string;
    sourceType: string;
    sourceUrl?: string;
  }[]
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Nicht authentifiziert");

  const categories = await prisma.category.findMany();
  const results: { index: number; success: boolean; error?: string }[] = [];

  for (let i = 0; i < ideas.length; i++) {
    const idea = ideas[i];
    try {
      const cat = categories.find(
        (c) => c.name.toLowerCase() === idea.category.toLowerCase()
      );
      if (!cat) {
        results.push({ index: i, success: false, error: `Kategorie "${idea.category}" nicht gefunden` });
        continue;
      }

      await prisma.shortIdea.create({
        data: {
          hook: idea.hook,
          kernaussage: idea.kernaussage,
          meinTake: idea.meinTake,
          categoryId: cat.id,
          sourceType: idea.sourceType === "SCREENSHOT" ? "SCREENSHOT" : "LINK",
          sourceUrl: idea.sourceUrl || null,
          createdById: session.user.id,
        },
      });
      results.push({ index: i, success: true });
    } catch (error) {
      results.push({
        index: i,
        success: false,
        error: error instanceof Error ? error.message : "Unbekannter Fehler",
      });
    }
  }

  revalidatePath("/");
  return results;
}
