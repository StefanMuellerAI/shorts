"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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

export async function createIdea(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Nicht authentifiziert");

  const hook = formData.get("hook") as string;
  const kernaussage = formData.get("kernaussage") as string;
  const meinTake = formData.get("meinTake") as string;
  const categoryId = formData.get("categoryId") as string;
  const sourceType = formData.get("sourceType") as SourceType;
  const sourceUrl = formData.get("sourceUrl") as string | null;
  const screenshotUrl = formData.get("screenshotUrl") as string | null;

  if (!hook || !kernaussage || !meinTake || !categoryId || !sourceType) {
    throw new Error("Alle Pflichtfelder muessen ausgefuellt sein.");
  }

  await prisma.shortIdea.create({
    data: {
      hook,
      kernaussage,
      meinTake,
      categoryId,
      sourceType,
      sourceUrl: sourceUrl || null,
      screenshotUrl: screenshotUrl || null,
      createdById: session.user.id,
    },
  });

  revalidatePath("/");
  redirect("/");
}

export async function updateIdea(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Nicht authentifiziert");

  const hook = formData.get("hook") as string;
  const kernaussage = formData.get("kernaussage") as string;
  const meinTake = formData.get("meinTake") as string;
  const categoryId = formData.get("categoryId") as string;
  const sourceType = formData.get("sourceType") as SourceType;
  const sourceUrl = formData.get("sourceUrl") as string | null;
  const screenshotUrl = formData.get("screenshotUrl") as string | null;

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
  redirect(`/idee/${id}`);
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
