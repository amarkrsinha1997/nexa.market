-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paymentAttemptedAt" TIMESTAMP(3),
ADD COLUMN     "paymentFailureReason" TEXT,
ADD COLUMN     "paymentRecipientAddress" TEXT;
