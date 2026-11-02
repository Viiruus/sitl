CREATE TABLE "GuideWhatsAppMessage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "guideId" INTEGER,
    "guideNameSnapshot" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "templateName" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "components" JSONB NOT NULL,
    "messageId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "failureReason" TEXT,
    "sentAt" DATETIME,
    "statusAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GuideWhatsAppMessage_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "GuideWhatsAppMessage_messageId_key" ON "GuideWhatsAppMessage"("messageId");
CREATE INDEX "GuideWhatsAppMessage_guideId_createdAt_idx" ON "GuideWhatsAppMessage"("guideId", "createdAt");
CREATE INDEX "GuideWhatsAppMessage_createdAt_id_idx" ON "GuideWhatsAppMessage"("createdAt", "id");
CREATE INDEX "GuideWhatsAppMessage_kind_status_idx" ON "GuideWhatsAppMessage"("kind", "status");

-- Reprendre les seuls anciens envois dont le statut a été conservé.
-- Les événements de réservation et les suggestions ne prouvent pas un envoi.
INSERT INTO "GuideWhatsAppMessage" (
  "guideId", "guideNameSnapshot", "phoneNumber", "kind", "templateName", "language",
  "components", "messageId", "status", "failureReason", "sentAt", "createdAt", "updatedAt"
)
SELECT
  request."guideId",
  COALESCE(NULLIF(TRIM(COALESCE(guide."firstName", '') || ' ' || COALESCE(guide."lastName", '')), ''), guide."email"),
  request."guidePhoneSnapshot",
  'CONTACT_REQUEST',
  COALESCE(request."templateName", 'guide_contact_request'),
  'fr',
  json_array(json_object('type', 'body', 'parameters', json_array(
    json_object('type', 'text', 'text', COALESCE(request."climberNameSnapshot", NULLIF(TRIM(COALESCE(climber."firstName", '') || ' ' || COALESCE(climber."lastName", '')), ''), 'Un grimpeur')),
    json_object('type', 'text', 'text', request."climberPhoneSnapshot"),
    json_object('type', 'text', 'text', request."messagePreview")
  ))),
  request."messageId",
  COALESCE(request."messageStatus", CASE WHEN request."sentAt" IS NOT NULL THEN 'accepted' ELSE 'pending' END),
  request."failureReason",
  request."sentAt",
  request."createdAt",
  request."updatedAt"
FROM "GuideContactRequest" request
JOIN "User" guide ON guide."id" = request."guideId"
JOIN "User" climber ON climber."id" = request."climberId";
