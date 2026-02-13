-- Add variants metadata for uploaded responsive images
ALTER TABLE "GuideProfile" ADD COLUMN "profileImageVariants" JSONB;
ALTER TABLE "Aventure" ADD COLUMN "coverImageVariants" JSONB;
ALTER TABLE "AventureImage" ADD COLUMN "variants" JSONB;
