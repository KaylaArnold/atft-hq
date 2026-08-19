/*
  Warnings:

  - You are about to drop the column `assignmentId` on the `AccountabilityCycle` table. All the data in the column will be lost.
  - You are about to drop the column `peerCoachId` on the `AccountabilityCycle` table. All the data in the column will be lost.
  - You are about to drop the column `accountabilityAssignmentId` on the `CoachingDocument` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "AccountabilityCycle" DROP CONSTRAINT "AccountabilityCycle_assignmentId_fkey";

-- DropForeignKey
ALTER TABLE "AccountabilityCycle" DROP CONSTRAINT "AccountabilityCycle_peerCoachId_fkey";

-- DropForeignKey
ALTER TABLE "CoachingDocument" DROP CONSTRAINT "CoachingDocument_accountabilityAssignmentId_fkey";

-- DropIndex
DROP INDEX "AccountabilityCycle_assignmentId_idx";

-- DropIndex
DROP INDEX "AccountabilityCycle_peerCoachId_idx";

-- AlterTable
ALTER TABLE "AccountabilityCycle" DROP COLUMN "assignmentId",
DROP COLUMN "peerCoachId";

-- AlterTable
ALTER TABLE "CoachingDocument" DROP COLUMN "accountabilityAssignmentId";
