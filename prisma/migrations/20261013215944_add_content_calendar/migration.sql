-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('IDEA', 'DRAFT', 'IN_REVIEW', 'APPROVED', 'SCHEDULED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "ContentPlatform" AS ENUM ('INSTAGRAM', 'FACEBOOK', 'TIKTOK', 'YOUTUBE', 'TWITCH', 'EMAIL', 'WEBSITE', 'OTHER');

-- CreateTable
CREATE TABLE "ContentItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "platform" "ContentPlatform" NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'IDEA',
    "publishDate" TIMESTAMP(3),
    "ownerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ContentItem_status_idx" ON "ContentItem"("status");

-- CreateIndex
CREATE INDEX "ContentItem_platform_idx" ON "ContentItem"("platform");

-- CreateIndex
CREATE INDEX "ContentItem_publishDate_idx" ON "ContentItem"("publishDate");

-- CreateIndex
CREATE INDEX "ContentItem_ownerId_idx" ON "ContentItem"("ownerId");

-- AddForeignKey
ALTER TABLE "ContentItem" ADD CONSTRAINT "ContentItem_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
