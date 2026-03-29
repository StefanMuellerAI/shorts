import { PrismaClient } from "@prisma/client";

function getPrismaUrl(): string {
  const url = process.env.POSTGRES_PRISMA_URL || "";
  const params = new URLSearchParams();
  if (!url.includes("pgbouncer=")) params.set("pgbouncer", "true");
  if (!url.includes("prepared_statements=")) params.set("prepared_statements", "false");
  const separator = url.includes("?") ? "&" : "?";
  return params.toString() ? `${url}${separator}${params.toString()}` : url;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: getPrismaUrl(),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
