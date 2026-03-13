// server/utils/prisma.ts
import pkg from "@prisma/client";
import { statSync } from "node:fs";
import { resolve } from "node:path";
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

type PrismaState = {
  promise: Promise<InstanceType<typeof PrismaClient>> | null;
  mode: "turso" | "sqlite" | null;
  sqlitePath: string | null;
  sqliteFingerprint: string | null;
};

const globalPrismaState = globalThis as typeof globalThis & {
  __bdkPrismaState?: PrismaState;
};

const prismaState: PrismaState =
  globalPrismaState.__bdkPrismaState ??
  (globalPrismaState.__bdkPrismaState = {
    promise: null,
    mode: null,
    sqlitePath: null,
    sqliteFingerprint: null,
  });

function getLocalSqliteUrl() {
  return process.env.DATABASE_URL ?? "file:./prisma/dev.db";
}

function getLocalSqlitePath(sqliteUrl: string) {
  if (sqliteUrl.startsWith("file://")) {
    return new URL(sqliteUrl).pathname;
  }

  const rawPath = sqliteUrl.startsWith("file:") ? sqliteUrl.slice(5) : sqliteUrl;
  const cleanPath = decodeURIComponent(rawPath.split("?")[0] || "");
  return resolve(process.cwd(), cleanPath);
}

function getLocalSqliteAdapterUrl(sqliteUrl: string) {
  return `file:${getLocalSqlitePath(sqliteUrl)}`;
}

function getSqliteFingerprint(sqlitePath: string) {
  try {
    const stats = statSync(sqlitePath);
    return [stats.dev, stats.ino, stats.size, stats.mtimeMs].join(":");
  } catch {
    return null;
  }
}

async function disconnectPrismaClient() {
  if (!prismaState.promise) return;

  try {
    const client = await prismaState.promise;
    await client.$disconnect();
  } catch {
    // Ignore disconnect errors while resetting a stale local SQLite handle.
  }
}

async function resetPrismaClient() {
  await disconnectPrismaClient();
  prismaState.promise = null;
  prismaState.mode = null;
  prismaState.sqlitePath = null;
  prismaState.sqliteFingerprint = null;
}

async function createPrismaClient() {
  // ✅ Priorité à Turso dès que c’est configuré (même en local si tu veux tester)
  const tursoUrl = process.env.TURSO_DATABASE_URL || process.env.LIBSQL_URL;
  const tursoToken = process.env.TURSO_AUTH_TOKEN || process.env.LIBSQL_AUTH_TOKEN;

  if (tursoUrl) {
    if (!tursoToken) {
      throw new Error("TURSO_AUTH_TOKEN is missing (required when TURSO_DATABASE_URL is set).");
    }
    const PrismaLibSQL = await getLibSqlAdapter();
    const adapter = new PrismaLibSQL({ url: tursoUrl, authToken: tursoToken });
    prismaState.mode = "turso";
    prismaState.sqlitePath = null;
    prismaState.sqliteFingerprint = null;
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
  const sqliteUrl = getLocalSqliteUrl();
  const sqlitePath = getLocalSqlitePath(sqliteUrl);
  const PrismaBetterSqlite3 = await getBetterSqliteAdapter();
  const adapter = new PrismaBetterSqlite3({
    url: getLocalSqliteAdapterUrl(sqliteUrl),
  });

  prismaState.mode = "sqlite";
  prismaState.sqlitePath = sqlitePath;
  prismaState.sqliteFingerprint = getSqliteFingerprint(sqlitePath);

  return new PrismaClient({ adapter });
}

export async function prisma() {
  if (prismaState.mode === "sqlite" && prismaState.promise && prismaState.sqlitePath) {
    const currentFingerprint = getSqliteFingerprint(prismaState.sqlitePath);
    if (currentFingerprint !== prismaState.sqliteFingerprint) {
      console.warn(`[prisma] SQLite database file changed on disk, recreating client for ${prismaState.sqlitePath}`);
      await resetPrismaClient();
    }
  }

  if (!prismaState.promise) {
    prismaState.promise = createPrismaClient().catch(async (error) => {
      await resetPrismaClient();
      throw error;
    });
  }

  return prismaState.promise;
}
