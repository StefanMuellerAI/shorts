import { PrismaClient } from "@prisma/client";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

function generatePassword(length = 16): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function main() {
  const adminEmails = process.env.ADMIN_EMAILS?.split(",").map((e) =>
    e.trim()
  );

  if (!adminEmails || adminEmails.length === 0) {
    console.log("No ADMIN_EMAILS set in environment. Skipping admin seeding.");
    return;
  }

  console.log("\n--- Seeding Admin Users ---\n");

  for (const email of adminEmails) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log(`  Admin already exists: ${email}`);
      continue;
    }

    const password = generatePassword();
    const hashed = hashSync(password, 12);

    await prisma.user.create({
      data: {
        email,
        name: email.split("@")[0],
        password: hashed,
        role: "ADMIN",
      },
    });

    console.log(`  Created admin: ${email}`);
    console.log(`  Initial password: ${password}`);
    console.log("");
  }

  console.log("--- Seeding complete ---\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
