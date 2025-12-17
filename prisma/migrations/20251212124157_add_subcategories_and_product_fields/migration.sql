-- AlterTable: Update ProductCategory to support hierarchy
ALTER TABLE "ProductCategory" ADD COLUMN "parentId" TEXT;
ALTER TABLE "ProductCategory" ADD COLUMN "level" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "ProductCategory_parentId_idx" ON "ProductCategory"("parentId");
CREATE INDEX "ProductCategory_level_idx" ON "ProductCategory"("level");

-- AddForeignKey for category hierarchy
ALTER TABLE "ProductCategory" ADD CONSTRAINT "ProductCategory_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "ProductCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop the unique constraint on name if it exists, we'll add a composite one
-- Note: This might fail if there are duplicate names, but that's expected
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProductCategory_name_key') THEN
        ALTER TABLE "ProductCategory" DROP CONSTRAINT "ProductCategory_name_key";
    END IF;
END $$;

-- Create unique constraint for name within parent (NULL parentId means main category)
-- This allows same name in different parent categories
CREATE UNIQUE INDEX IF NOT EXISTS "ProductCategory_name_parentId_key" ON "ProductCategory"("name", COALESCE("parentId", ''::text));

-- AlterTable: Add new fields to Product
ALTER TABLE "Product" ADD COLUMN "guide" TEXT;
ALTER TABLE "Product" ADD COLUMN "region" TEXT;
ALTER TABLE "Product" ADD COLUMN "subcategoryId" TEXT;
ALTER TABLE "Product" ADD COLUMN "deliveryType" TEXT NOT NULL DEFAULT 'standard';
ALTER TABLE "Product" ADD COLUMN "isInstantDelivery" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Product" ADD COLUMN "trackStock" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex for new Product fields
CREATE INDEX "Product_subcategoryId_idx" ON "Product"("subcategoryId");
CREATE INDEX "Product_region_idx" ON "Product"("region");
CREATE INDEX "Product_deliveryType_idx" ON "Product"("deliveryType");
CREATE INDEX "Product_isInstantDelivery_idx" ON "Product"("isInstantDelivery");
CREATE INDEX "Product_trackStock_idx" ON "Product"("trackStock");

-- AddForeignKey for subcategory
ALTER TABLE "Product" ADD CONSTRAINT "Product_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "ProductCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: OrderInformationField
CREATE TABLE "OrderInformationField" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "fieldName" TEXT NOT NULL,
    "fieldType" TEXT NOT NULL DEFAULT 'text',
    "placeholder" TEXT,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "fieldOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderInformationField_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for OrderInformationField
CREATE INDEX "OrderInformationField_productId_idx" ON "OrderInformationField"("productId");
CREATE INDEX "OrderInformationField_fieldOrder_idx" ON "OrderInformationField"("fieldOrder");

-- AddForeignKey for OrderInformationField
ALTER TABLE "OrderInformationField" ADD CONSTRAINT "OrderInformationField_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: ProductReview
CREATE TABLE "ProductReview" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "userId" TEXT,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for ProductReview
CREATE INDEX "ProductReview_productId_idx" ON "ProductReview"("productId");
CREATE INDEX "ProductReview_userId_idx" ON "ProductReview"("userId");
CREATE INDEX "ProductReview_rating_idx" ON "ProductReview"("rating");

-- AddForeignKey for ProductReview
ALTER TABLE "ProductReview" ADD CONSTRAINT "ProductReview_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: Favourite
CREATE TABLE "Favourite" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favourite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for Favourite
CREATE UNIQUE INDEX "Favourite_userId_productId_key" ON "Favourite"("userId", "productId");
CREATE INDEX "Favourite_userId_idx" ON "Favourite"("userId");
CREATE INDEX "Favourite_productId_idx" ON "Favourite"("productId");

-- AddForeignKey for Favourite
ALTER TABLE "Favourite" ADD CONSTRAINT "Favourite_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Favourite" ADD CONSTRAINT "Favourite_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
