-- CreateTable
CREATE TABLE "InitialAccountabilityAssessment" (
    "id" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "strengths" TEXT NOT NULL,
    "weaknesses" TEXT NOT NULL,
    "stepsTaken" TEXT NOT NULL,
    "biggestObstacle" TEXT NOT NULL,
    "commitmentScore" INTEGER NOT NULL,
    "commitmentReason" TEXT,
    "brokenTradingRule" TEXT NOT NULL,
    "attendanceConsistency" TEXT NOT NULL,
    "journalingConsistency" TEXT NOT NULL,
    "primaryEmotion" TEXT NOT NULL,
    "oneAreaToImprove" TEXT NOT NULL,
    "successDefinition" TEXT NOT NULL,
    "coachSupportNeeded" TEXT NOT NULL,
    "willingToBeAccountable" BOOLEAN NOT NULL,
    "accountabilityExplanation" TEXT,
    "personalCommitment" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InitialAccountabilityAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InitialAccountabilityAssessment_cycleId_key" ON "InitialAccountabilityAssessment"("cycleId");

-- AddForeignKey
ALTER TABLE "InitialAccountabilityAssessment" ADD CONSTRAINT "InitialAccountabilityAssessment_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "AccountabilityCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
