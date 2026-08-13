-- CreateEnum
CREATE TYPE "BalanceMarker" AS ENUM ('GREEN', 'YELLOW', 'RED');

-- AlterTable
ALTER TABLE "MonthlyBalance" ADD COLUMN     "marker" "BalanceMarker";
