-- CreateEnum
CREATE TYPE "AccountabilityCycleStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'EXTENDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AccountabilityOutcome" AS ENUM ('GRADUATE', 'CONTINUE_30_DAYS', 'COACH_ARLETTA', 'ACCOUNTABILITY_PARTNER');

-- CreateEnum
CREATE TYPE "CoachingDocumentType" AS ENUM ('INITIAL_ASSESSMENT', 'WEEKLY_CHECK_IN', 'PEER_COACH_CHECK_IN', 'WEEKLY_SCORECARD', 'DAILY_TRADING_JOURNAL', 'FINAL_REPORT_CARD', 'OTHER');

-- CreateTable
CREATE TABLE "AccountabilityCycle" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "peerCoachId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "AccountabilityCycleStatus" NOT NULL DEFAULT 'ACTIVE',
    "outcome" "AccountabilityOutcome",
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountabilityCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachingDocument" (
    "id" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "type" "CoachingDocumentType" NOT NULL,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "weekNumber" INTEGER,
    "uploadedByUserId" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoachingDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoachingCheckIn" (
    "id" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "weekNumber" INTEGER,
    "checkInDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextCheckInDate" TIMESTAMP(3),
    "progressStatus" TEXT,
    "strengths" TEXT,
    "challenges" TEXT,
    "actionItems" TEXT,
    "coachNotes" TEXT,
    "traderQuestions" TEXT,
    "supportNeeded" TEXT,
    "journalConsistency" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoachingCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AccountabilityCycle_assignmentId_idx" ON "AccountabilityCycle"("assignmentId");

-- CreateIndex
CREATE INDEX "AccountabilityCycle_memberId_idx" ON "AccountabilityCycle"("memberId");

-- CreateIndex
CREATE INDEX "AccountabilityCycle_peerCoachId_idx" ON "AccountabilityCycle"("peerCoachId");

-- CreateIndex
CREATE INDEX "AccountabilityCycle_programId_idx" ON "AccountabilityCycle"("programId");

-- CreateIndex
CREATE INDEX "AccountabilityCycle_status_idx" ON "AccountabilityCycle"("status");

-- CreateIndex
CREATE INDEX "CoachingDocument_cycleId_idx" ON "CoachingDocument"("cycleId");

-- CreateIndex
CREATE INDEX "CoachingDocument_type_idx" ON "CoachingDocument"("type");

-- CreateIndex
CREATE INDEX "CoachingCheckIn_cycleId_idx" ON "CoachingCheckIn"("cycleId");

-- CreateIndex
CREATE INDEX "CoachingCheckIn_checkInDate_idx" ON "CoachingCheckIn"("checkInDate");

-- AddForeignKey
ALTER TABLE "AccountabilityCycle" ADD CONSTRAINT "AccountabilityCycle_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "PeerCoachAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountabilityCycle" ADD CONSTRAINT "AccountabilityCycle_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountabilityCycle" ADD CONSTRAINT "AccountabilityCycle_peerCoachId_fkey" FOREIGN KEY ("peerCoachId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountabilityCycle" ADD CONSTRAINT "AccountabilityCycle_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachingDocument" ADD CONSTRAINT "CoachingDocument_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "AccountabilityCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachingDocument" ADD CONSTRAINT "CoachingDocument_uploadedByUserId_fkey" FOREIGN KEY ("uploadedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CoachingCheckIn" ADD CONSTRAINT "CoachingCheckIn_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "AccountabilityCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
