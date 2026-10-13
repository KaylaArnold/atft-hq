-- CreateEnum
CREATE TYPE "LibraryDocumentType" AS ENUM ('SOP', 'POLICY', 'TEMPLATE', 'TRAINING', 'REFERENCE');

-- CreateEnum
CREATE TYPE "LibraryDocumentStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ARCHIVED');

-- CreateTable
CREATE TABLE "LibraryDocument" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "content" TEXT,
    "type" "LibraryDocumentType" NOT NULL DEFAULT 'SOP',
    "status" "LibraryDocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "ownerId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LibraryDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LibraryDocument_type_idx" ON "LibraryDocument"("type");

-- CreateIndex
CREATE INDEX "LibraryDocument_status_idx" ON "LibraryDocument"("status");

-- CreateIndex
CREATE INDEX "LibraryDocument_ownerId_idx" ON "LibraryDocument"("ownerId");

-- CreateIndex
CREATE INDEX "LibraryDocument_updatedAt_idx" ON "LibraryDocument"("updatedAt");

-- AddForeignKey
ALTER TABLE "LibraryDocument" ADD CONSTRAINT "LibraryDocument_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LibraryDocument" ADD CONSTRAINT "LibraryDocument_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
