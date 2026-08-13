-- CreateEnum
CREATE TYPE "AccessSource" AS ENUM ('STRIPE', 'MANUAL');

-- CreateEnum
CREATE TYPE "EntitlementStatus" AS ENUM ('ACTIVE', 'USED', 'REVOKED');

-- CreateTable
CREATE TABLE "RegistrationEntitlement" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "program" TEXT NOT NULL,
    "source" "AccessSource" NOT NULL,
    "status" "EntitlementStatus" NOT NULL DEFAULT 'ACTIVE',
    "stripeCustomerId" TEXT,
    "stripePaymentId" TEXT,
    "stripeSubscriptionId" TEXT,
    "registeredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RegistrationEntitlement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RegistrationEntitlement_email_idx" ON "RegistrationEntitlement"("email");
