-- CreateTable
CREATE TABLE "MonthlyBalance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "startingBalance" DECIMAL(12,2) NOT NULL,
    "endingBalance" DECIMAL(12,2) NOT NULL,
    "signature" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "late" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyBalance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MonthlyBalance_programId_year_month_idx" ON "MonthlyBalance"("programId", "year", "month");

-- CreateIndex
CREATE INDEX "MonthlyBalance_userId_idx" ON "MonthlyBalance"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyBalance_userId_programId_month_year_key" ON "MonthlyBalance"("userId", "programId", "month", "year");

-- AddForeignKey
ALTER TABLE "MonthlyBalance" ADD CONSTRAINT "MonthlyBalance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyBalance" ADD CONSTRAINT "MonthlyBalance_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE CASCADE ON UPDATE CASCADE;
