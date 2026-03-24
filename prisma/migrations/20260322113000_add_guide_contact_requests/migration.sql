-- CreateTable
CREATE TABLE "GuideContactRequest" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "guideId" INTEGER NOT NULL,
    "climberId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "messagePreview" TEXT NOT NULL,
    "climberNameSnapshot" TEXT,
    "climberPhoneSnapshot" TEXT NOT NULL,
    "guidePhoneSnapshot" TEXT NOT NULL,
    "templateName" TEXT,
    "messageId" TEXT,
    "messageStatus" TEXT,
    "failureReason" TEXT,
    "sentAt" DATETIME,
    "lastWebhookPayload" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GuideContactRequest_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GuideContactRequest_climberId_fkey" FOREIGN KEY ("climberId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "GuideContactRequest_messageId_key" ON "GuideContactRequest"("messageId");

-- CreateIndex
CREATE INDEX "GuideContactRequest_guideId_createdAt_idx" ON "GuideContactRequest"("guideId", "createdAt");

-- CreateIndex
CREATE INDEX "GuideContactRequest_climberId_createdAt_idx" ON "GuideContactRequest"("climberId", "createdAt");
