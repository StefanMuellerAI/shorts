"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { hashSync } from "bcryptjs";
import { revalidatePath } from "next/cache";

export async function getUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      _count: { select: { ideas: true } },
    },
  });
}

export async function createUser(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Keine Berechtigung");
  }

  const email = formData.get("email") as string;
  const name = formData.get("name") as string;
  const password = formData.get("password") as string;
  const role = (formData.get("role") as string) || "USER";

  if (!email || !name || !password) {
    throw new Error("Alle Felder muessen ausgefuellt sein.");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("Ein Benutzer mit dieser E-Mail existiert bereits.");

  await prisma.user.create({
    data: {
      email,
      name,
      password: hashSync(password, 12),
      role: role === "ADMIN" ? "ADMIN" : "USER",
    },
  });

  revalidatePath("/admin/benutzer");
}

export async function deleteUser(id: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Keine Berechtigung");
  }

  if (session.user.id === id) {
    throw new Error("Du kannst dich nicht selbst loeschen.");
  }

  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/benutzer");
}

export async function resetPassword(id: string, newPassword: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Keine Berechtigung");
  }

  await prisma.user.update({
    where: { id },
    data: { password: hashSync(newPassword, 12) },
  });

  revalidatePath("/admin/benutzer");
}
