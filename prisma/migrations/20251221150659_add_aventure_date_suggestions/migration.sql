-- CreateTable
CREATE TABLE "AventureDateSuggestion" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "aventureId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AventureDateSuggestion_aventureId_fkey" FOREIGN KEY ("aventureId") REFERENCES "Aventure" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "AventureDateSuggestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "AventureDateSuggestion_aventureId_idx" ON "AventureDateSuggestion"("aventureId");

-- CreateIndex
CREATE INDEX "AventureDateSuggestion_userId_idx" ON "AventureDateSuggestion"("userId");
