-- CreateEnum
CREATE TYPE "CalendarItemType" AS ENUM ('MEETING', 'CLASS', 'CONTENT', 'DEADLINE', 'CORPORATE', 'OPERATIONS', 'OTHER');

-- CreateEnum
CREATE TYPE "CalendarItemStatus" AS ENUM ('SCHEDULED', 'COMPLETE', 'CANCELLED');

-- CreateTable
CREATE TABLE "CalendarItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "type" "CalendarItemType" NOT NULL DEFAULT 'OPERATIONS',
    "status" "CalendarItemStatus" NOT NULL DEFAULT 'SCHEDULED',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "allDay" BOOLEAN NOT NULL DEFAULT false,
    "location" TEXT,
    "meetingUrl" TEXT,
    "ownerId" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CalendarItem_startsAt_idx" ON "CalendarItem"("startsAt");

-- CreateIndex
CREATE INDEX "CalendarItem_ownerId_idx" ON "CalendarItem"("ownerId");

-- CreateIndex
CREATE INDEX "CalendarItem_type_idx" ON "CalendarItem"("type");

-- CreateIndex
CREATE INDEX "CalendarItem_status_idx" ON "CalendarItem"("status");

-- AddForeignKey
ALTER TABLE "CalendarItem" ADD CONSTRAINT "CalendarItem_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarItem" ADD CONSTRAINT "CalendarItem_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
