-- CreateTable
CREATE TABLE "PeerCoachCheckIn" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,
    "checkInDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attendedLiveSessions" BOOLEAN,
    "liveSessionsAttended" INTEGER,
    "watchedMissedReplays" BOOLEAN,
    "missedSessionReason" TEXT,
    "totalTrades" INTEGER,
    "greenTrades" INTEGER,
    "redTrades" INTEGER,
    "tickers" TEXT,
    "tickerFocus" TEXT,
    "tradingPlanDiscipline" TEXT,
    "biggestStrength" TEXT,
    "biggestChallenge" TEXT,
    "challengeOther" TEXT,
    "beginningBalance" DECIMAL(12,2),
    "endingBalance" DECIMAL(12,2),
    "weeklyGainLoss" DECIMAL(12,2),
    "weeklyPercentage" DECIMAL(8,2),
    "biggestLesson" TEXT,
    "traderFeeling" TEXT,
    "traderQuestions" TEXT,
    "helpNeeded" TEXT,
    "supportNextWeek" TEXT,
    "strengthsNoticed" TEXT,
    "focusNextWeek" TEXT,
    "actionItem" TEXT,
    "commitmentScore" INTEGER,
    "moveOnePoint" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PeerCoachCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PeerCoachCheckIn_assignmentId_idx" ON "PeerCoachCheckIn"("assignmentId");

-- CreateIndex
CREATE UNIQUE INDEX "PeerCoachCheckIn_assignmentId_weekNumber_key" ON "PeerCoachCheckIn"("assignmentId", "weekNumber");

-- AddForeignKey
ALTER TABLE "PeerCoachCheckIn" ADD CONSTRAINT "PeerCoachCheckIn_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "PeerCoachAssignment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
