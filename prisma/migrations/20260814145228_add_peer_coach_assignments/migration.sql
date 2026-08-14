-- CreateTable
CREATE TABLE "PeerCoachAssignment" (
    "id" TEXT NOT NULL,
    "peerCoachId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PeerCoachAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PeerCoachAssignment_peerCoachId_idx" ON "PeerCoachAssignment"("peerCoachId");

-- CreateIndex
CREATE INDEX "PeerCoachAssignment_memberId_idx" ON "PeerCoachAssignment"("memberId");

-- CreateIndex
CREATE INDEX "PeerCoachAssignment_programId_idx" ON "PeerCoachAssignment"("programId");

-- CreateIndex
CREATE UNIQUE INDEX "PeerCoachAssignment_memberId_programId_key" ON "PeerCoachAssignment"("memberId", "programId");

-- AddForeignKey
ALTER TABLE "PeerCoachAssignment" ADD CONSTRAINT "PeerCoachAssignment_peerCoachId_fkey" FOREIGN KEY ("peerCoachId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeerCoachAssignment" ADD CONSTRAINT "PeerCoachAssignment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeerCoachAssignment" ADD CONSTRAINT "PeerCoachAssignment_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
