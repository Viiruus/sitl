-- CreateTable
CREATE TABLE "WhatsAppOtpChallenge" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER,
    "purpose" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "publicToken" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "source" TEXT,
    "codeHash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "maxAttempts" INTEGER NOT NULL DEFAULT 5,
    "templateName" TEXT,
    "messageId" TEXT,
    "messageStatus" TEXT,
    "failureReason" TEXT,
    "expiresAt" DATETIME NOT NULL,
    "consumedAt" DATETIME,
    "invalidatedAt" DATETIME,
    "lastAttemptAt" DATETIME,
    "sentAt" DATETIME,
    "lastWebhookPayload" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WhatsAppOtpChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppOtpChallenge_publicToken_key" ON "WhatsAppOtpChallenge"("publicToken");

-- CreateIndex
CREATE UNIQUE INDEX "WhatsAppOtpChallenge_messageId_key" ON "WhatsAppOtpChallenge"("messageId");

-- CreateIndex
CREATE INDEX "WhatsAppOtpChallenge_purpose_phoneNumber_status_idx" ON "WhatsAppOtpChallenge"("purpose", "phoneNumber", "status");

-- CreateIndex
CREATE INDEX "WhatsAppOtpChallenge_expiresAt_idx" ON "WhatsAppOtpChallenge"("expiresAt");
