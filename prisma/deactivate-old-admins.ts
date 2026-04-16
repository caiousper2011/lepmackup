import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const dbUrl = process.argv[2];
if (!dbUrl) {
  console.error("Uso: npx tsx prisma/deactivate-old-admins.ts <DATABASE_URL>");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: dbUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Desativa todos os admins que NÃO são o caio2016usper@gmail.com
  const result = await prisma.adminUser.updateMany({
    where: { email: { not: "caio2016usper@gmail.com" } },
    data: { active: false },
  });
  console.log("Admins desativados:", result.count);

  const admins = await prisma.adminUser.findMany({
    select: { email: true, active: true },
  });
  console.log("Status dos admins:", admins);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
