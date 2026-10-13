/*
  Warnings:

  - A unique constraint covering the columns `[approvalId]` on the table `ContentItem` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "ContentItem" ADD COLUMN     "approvalId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "ContentItem_approvalId_key" ON "ContentItem"("approvalId");

-- AddForeignKey
ALTER TABLE "ContentItem" ADD CONSTRAINT "ContentItem_approvalId_fkey" FOREIGN KEY ("approvalId") REFERENCES "Approval"("id") ON DELETE SET NULL ON UPDATE CASCADE;
