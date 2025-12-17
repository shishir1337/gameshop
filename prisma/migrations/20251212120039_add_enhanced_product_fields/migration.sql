-- Add new columns
ALTER TABLE "Product" ADD COLUMN     "digitalProduct" JSONB,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'active',
ADD COLUMN     "type" TEXT NOT NULL DEFAULT 'digital_currency';

-- Convert images from TEXT[] to JSONB format
-- First, add a temporary column
ALTER TABLE "Product" ADD COLUMN "images_jsonb" JSONB;

-- Migrate existing string[] images to JSONB format (array of objects)
UPDATE "Product" 
SET "images_jsonb" = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'url', value,
      'alt', '',
      'isPrimary', (ordinality = 1)
    )
  )
  FROM unnest("images") WITH ORDINALITY AS t(value, ordinality)
);

-- Drop old column and rename new one
ALTER TABLE "Product" DROP COLUMN "images";
ALTER TABLE "Product" RENAME COLUMN "images_jsonb" TO "images";

-- Make images NOT NULL (it should already have data from migration above)
ALTER TABLE "Product" ALTER COLUMN "images" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Product_type_idx" ON "Product"("type");

-- CreateIndex
CREATE INDEX "Product_status_idx" ON "Product"("status");

-- CreateIndex
CREATE INDEX "Product_featured_idx" ON "Product"("featured");
