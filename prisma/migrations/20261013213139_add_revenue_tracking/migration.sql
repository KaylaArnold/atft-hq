-- CreateEnum
CREATE TYPE "RevenueSource" AS ENUM ('DRIPPER_PROGRAM', 'MEMBERSHIP', 'CLASS', 'CORPORATE_PARTNERSHIP', 'OTHER');

-- CreateTable
CREATE TABLE "RevenueEntry" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "source" "RevenueSource" NOT NULL,
    "description" TEXT,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "recordedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RevenueEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RevenueEntry_paymentDate_idx" ON "RevenueEntry"("paymentDate");

-- CreateIndex
CREATE INDEX "RevenueEntry_source_idx" ON "RevenueEntry"("source");

-- CreateIndex
CREATE INDEX "RevenueEntry_recordedById_idx" ON "RevenueEntry"("recordedById");

-- AddForeignKey
ALTER TABLE "RevenueEntry" ADD CONSTRAINT "RevenueEntry_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
