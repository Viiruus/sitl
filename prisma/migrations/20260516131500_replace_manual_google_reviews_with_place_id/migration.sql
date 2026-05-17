ALTER TABLE "GuideProfile" DROP COLUMN "googleRating";
ALTER TABLE "GuideProfile" DROP COLUMN "googleReviewCount";
ALTER TABLE "GuideProfile" DROP COLUMN "googleReviewHighlights";
ALTER TABLE "GuideProfile" ADD COLUMN "googlePlaceId" TEXT;
