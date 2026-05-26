-- Add explicit delivery context so publication and each added session can be notified once.
ALTER TABLE "StageNotificationDelivery" ADD COLUMN "sessionId" INTEGER;
ALTER TABLE "StageNotificationDelivery" ADD COLUMN "deliveryKey" TEXT;

UPDATE "StageNotificationDelivery"
SET "deliveryKey" = 'publish:' || "subscriptionId" || ':' || "aventureId"
WHERE "deliveryKey" IS NULL;

CREATE UNIQUE INDEX "StageNotificationDelivery_deliveryKey_key" ON "StageNotificationDelivery"("deliveryKey");
CREATE INDEX "StageNotificationDelivery_sessionId_idx" ON "StageNotificationDelivery"("sessionId");

DROP INDEX "StageNotificationDelivery_subscriptionId_aventureId_key";
