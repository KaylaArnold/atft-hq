-- AlterTable
ALTER TABLE "AccountabilityCycle" ADD COLUMN     "accountabilityCoachAssignmentId" TEXT;

-- AlterTable
ALTER TABLE "CoachingDocument" ADD COLUMN     "accountabilityAssignmentId" TEXT;

-- CreateTable
CREATE TABLE "AccountabilityCoachAssignment" (
    "id" TEXT NOT NULL,
    "accountabilityCoachId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountabilityCoachAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AccountabilityCoachAssignment_accountabilityCoachId_idx" ON "AccountabilityCoachAssignment"("accountabilityCoachId");

-- CreateIndex
CREATE INDEX "AccountabilityCoachAssignment_memberId_idx" ON "AccountabilityCoachAssignment"("memberId");

-- CreateIndex
CREATE INDEX "AccountabilityCoachAssignment_programId_idx" ON "AccountabilityCoachAssignment"("programId");

-- AddForeignKey
ALTER TABLE "AccountabilityCycle" ADD CONSTRAINT "AccountabilityCycle_accountabilityCoachAssignmentId_fkey" FOREIGN KEY ("accountabilityCoachAssignmentId") REFERENCES "AccountabilityCoachAssignment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachingDocument" ADD CONSTRAINT "CoachingDocument_accountabilityAssignmentId_fkey" FOREIGN KEY ("accountabilityAssignmentId") REFERENCES "AccountabilityCoachAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountabilityCoachAssignment" ADD CONSTRAINT "AccountabilityCoachAssignment_accountabilityCoachId_fkey" FOREIGN KEY ("accountabilityCoachId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountabilityCoachAssignment" ADD CONSTRAINT "AccountabilityCoachAssignment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountabilityCoachAssignment" ADD CONSTRAINT "AccountabilityCoachAssignment_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
