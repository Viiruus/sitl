// server/utils/prisma.ts
import pkg from "@prisma/client";
const { PrismaClient } = pkg as any;

// helper pour gérer PrismaLibSQL vs PrismaLibSql selon versions
async function getLibSqlAdapter() {
  const m = await import("@prisma/adapter-libsql");
  const Ctor = (m as any).PrismaLibSQL ?? (m as any).PrismaLibSql;
  if (!Ctor) throw new Error("No PrismaLibSQL/PrismaLibSql export found in @prisma/adapter-libsql");
  return Ctor;
}

async function getBetterSqliteAdapter() {
  const m = await import("@prisma/adapter-better-sqlite3");
  return m.PrismaBetterSqlite3;
}

const isVercel = process.env.VERCEL === "1" || !!process.env.VERCEL_ENV;

let prismaPromise: Promise<InstanceType<typeof PrismaClient>> | null = null;

export function prisma() {
  if (!prismaPromise) {
    prismaPromise = (async () => {
      // ✅ Priorité à Turso dès que c’est configuré (même en local si tu veux tester)
      const tursoUrl = process.env.TURSO_DATABASE_URL || process.env.LIBSQL_URL;
      const tursoToken = process.env.TURSO_AUTH_TOKEN || process.env.LIBSQL_AUTH_TOKEN;

      if (tursoUrl) {
        if (!tursoToken) {
          throw new Error("TURSO_AUTH_TOKEN is missing (required when TURSO_DATABASE_URL is set).");
        }
        const PrismaLibSQL = await getLibSqlAdapter();
        const adapter = new PrismaLibSQL({ url: tursoUrl, authToken: tursoToken });
        return new PrismaClient({ adapter });
      }

      // ✅ Sur Vercel: on refuse de fallback sur better-sqlite3
      // (évite le crash Node 24 + DB non persistante)
      if (isVercel) {
        throw new Error(
          "TURSO_DATABASE_URL is not set at runtime on Vercel. Refusing to use better-sqlite3 in serverless."
        );
      }

      // ✅ Local seulement: fallback SQLite fichier
      const PrismaBetterSqlite3 = await getBetterSqliteAdapter();
      const adapter = new PrismaBetterSqlite3({
        url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
      });
      return new PrismaClient({ adapter });
    })();
  }
  return prismaPromise;
}
