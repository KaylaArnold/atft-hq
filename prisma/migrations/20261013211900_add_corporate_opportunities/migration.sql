-- CreateEnum
CREATE TYPE "OpportunityStage" AS ENUM ('PROSPECTING', 'CONTACTED', 'DISCOVERY', 'PROPOSAL_SENT', 'NEGOTIATION', 'WON', 'LOST');

-- CreateTable
CREATE TABLE "Opportunity" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "contactName" TEXT,
    "contactEmail" TEXT,
    "description" TEXT,
    "stage" "OpportunityStage" NOT NULL DEFAULT 'PROSPECTING',
    "estimatedValue" DECIMAL(12,2),
    "nextStep" TEXT,
    "nextFollowUp" TIMESTAMP(3),
    "expectedClose" TIMESTAMP(3),
    "ownerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Opportunity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Opportunity_stage_idx" ON "Opportunity"("stage");

-- CreateIndex
CREATE INDEX "Opportunity_ownerId_idx" ON "Opportunity"("ownerId");

-- CreateIndex
CREATE INDEX "Opportunity_nextFollowUp_idx" ON "Opportunity"("nextFollowUp");

-- CreateIndex
CREATE INDEX "Opportunity_expectedClose_idx" ON "Opportunity"("expectedClose");

-- AddForeignKey
ALTER TABLE "Opportunity" ADD CONSTRAINT "Opportunity_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
