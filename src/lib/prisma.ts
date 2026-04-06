import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function makePrisma() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

function getPrismaClient() {
  // In dev, when Prisma schema/client is regenerated, HMR can keep an old instance
  // in global scope. Recreate it if it's not an instance of the current PrismaClient.
  if (
    !globalForPrisma.prisma ||
    !(globalForPrisma.prisma instanceof PrismaClient)
  ) {
    globalForPrisma.prisma = makePrisma();
  }

  return globalForPrisma.prisma;
}

export const prisma = getPrismaClient();
