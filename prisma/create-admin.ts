import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashSync } from "bcryptjs";

const dbUrl = process.argv[2] || process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("Uso: npx tsx prisma/create-admin.ts <DATABASE_URL>");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: dbUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hash = hashSync("LeP@Admin2024!", 12);
  const admin = await prisma.adminUser.upsert({
    where: { email: "caio2016usper@gmail.com" },
    update: { active: true },
    create: {
      email: "caio2016usper@gmail.com",
      passwordHash: hash,
      mustChangePassword: true,
      active: true,
    },
  });
  console.log("Admin criado:", admin.email, "| id:", admin.id);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("Erro:", e);
  process.exit(1);
});
