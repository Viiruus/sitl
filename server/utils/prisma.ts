import pkg from "@prisma/client";
const { PrismaClient } = pkg;

// petit helper pour gérer PrismaLibSQL vs PrismaLibSql selon versions
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
      if (isVercel) {
        const PrismaLibSQL = await getLibSqlAdapter();
        const adapter = new PrismaLibSQL({
          url: process.env.TURSO_DATABASE_URL!,
          authToken: process.env.TURSO_AUTH_TOKEN!,
        });
        return new PrismaClient({ adapter });
      } else {
        const PrismaBetterSqlite3 = await getBetterSqliteAdapter();
        const adapter = new PrismaBetterSqlite3({
          url: process.env.DATABASE_URL!,
        });
        return new PrismaClient({ adapter });
      }
    })();
  }
  return prismaPromise;
}
