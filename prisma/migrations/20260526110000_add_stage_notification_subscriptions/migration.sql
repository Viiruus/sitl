-- CreateTable
CREATE TABLE "StageNotificationSubscription" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "kind" TEXT NOT NULL DEFAULT 'STAGE_LISTING',
    "discipline" TEXT,
    "region" TEXT,
    "dateStart" DATETIME,
    "dateEnd" DATETIME,
    "guideId" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastNotifiedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StageNotificationSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StageNotificationSubscription_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StageNotificationDelivery" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "subscriptionId" INTEGER NOT NULL,
    "aventureId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "templateName" TEXT NOT NULL,
    "messageId" TEXT,
    "failureReason" TEXT,
    "sentAt" DATETIME,
    "lastPayload" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StageNotificationDelivery_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "StageNotificationSubscription" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "StageNotificationDelivery_aventureId_fkey" FOREIGN KEY ("aventureId") REFERENCES "Aventure" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "StageNotificationSubscription_kind_active_idx" ON "StageNotificationSubscription"("kind", "active");

-- CreateIndex
CREATE INDEX "StageNotificationSubscription_userId_active_idx" ON "StageNotificationSubscription"("userId", "active");

-- CreateIndex
CREATE INDEX "StageNotificationSubscription_guideId_active_idx" ON "StageNotificationSubscription"("guideId", "active");

-- CreateIndex
CREATE UNIQUE INDEX "StageNotificationDelivery_messageId_key" ON "StageNotificationDelivery"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "StageNotificationDelivery_subscriptionId_aventureId_key" ON "StageNotificationDelivery"("subscriptionId", "aventureId");

-- CreateIndex
CREATE INDEX "StageNotificationDelivery_aventureId_idx" ON "StageNotificationDelivery"("aventureId");
