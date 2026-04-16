import { PrismaClient } from "../src/generated/prisma";
import { hashSync } from "bcryptjs";

const prisma = new PrismaClient();

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
  console.log("✅ Admin criado:", admin.email, "| id:", admin.id);
  console.log("🔑 Senha temporária: LeP@Admin2024!");
  console.log("⚠️  mustChangePassword = true (trocar no primeiro acesso)");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("❌ Erro:", e);
  process.exit(1);
});
