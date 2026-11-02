CREATE TABLE "BrigadeImageFolder" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "name" TEXT NOT NULL,
  "nameKey" TEXT NOT NULL,
  "createdById" INTEGER,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "BrigadeImageFolder_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "BrigadeImageFolder_nameKey_key" ON "BrigadeImageFolder"("nameKey");

CREATE TABLE "BrigadeImage" (
  "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  "url" TEXT NOT NULL,
  "alt" TEXT NOT NULL DEFAULT '',
  "variants" JSONB,
  "folderId" INTEGER NOT NULL,
  "uploadedById" INTEGER,
  "credit" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "BrigadeImage_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "BrigadeImageFolder" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT "BrigadeImage_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "BrigadeImage_url_key" ON "BrigadeImage"("url");
CREATE INDEX "BrigadeImage_folderId_createdAt_id_idx" ON "BrigadeImage"("folderId", "createdAt", "id");
CREATE INDEX "BrigadeImage_uploadedById_idx" ON "BrigadeImage"("uploadedById");
