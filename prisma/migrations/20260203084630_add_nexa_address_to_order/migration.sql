/*
  Warnings:

  - A unique constraint covering the columns `[googleId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('ORDER_CREATED', 'VERIFICATION_PENDING', 'VERIFYING', 'ADMIN_APPROVED', 'REJECTED', 'RELEASE_PAYMENT');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "isOnboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "nexaWalletAddress" TEXT,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "picture" TEXT,
ADD COLUMN     "refreshToken" TEXT;

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amountINR" DOUBLE PRECISION NOT NULL,
    "nexaAmount" DOUBLE PRECISION NOT NULL,
    "nexaPrice" DOUBLE PRECISION NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'ORDER_CREATED',
    "paymentQrId" TEXT NOT NULL,
    "nexaAddress" TEXT,
    "transactionId" TEXT,
    "verifiedBy" TEXT,
    "checkedBy" TEXT,
    "lifecycle" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppConfig" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "AppConfig_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "Upi" (
    "id" TEXT NOT NULL,
    "vpa" TEXT NOT NULL,
    "merchantName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFallback" BOOLEAN NOT NULL DEFAULT false,
    "scheduleStart" TEXT,
    "scheduleEnd" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "lastUsedAt" TIMESTAMP(3),
    "usageCount" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "maxDailyLimit" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Upi_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AppConfig_key_key" ON "AppConfig"("key");

-- CreateIndex
CREATE UNIQUE INDEX "Upi_vpa_key" ON "Upi"("vpa");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
