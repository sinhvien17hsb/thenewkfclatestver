import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";
import fs from "fs";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function getDbUrl(): string {
  // On Vercel the deployment root is read-only; copy db to /tmp which is writable
  if (process.env.VERCEL) {
    const src = path.join(process.cwd(), "dev.db");
    const dest = "/tmp/dev.db";
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(src, dest);
    }
    return `file:${dest}`;
  }
  return process.env.DATABASE_URL ?? `file:${path.join(process.cwd(), "dev.db")}`;
}

function createPrismaClient() {
  const url = getDbUrl();
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
