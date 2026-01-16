-- AlterEnum
ALTER TYPE "RequestEventType" ADD VALUE 'PAYMENT_RECORDED';

-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "amountPaidCents" INTEGER,
ADD COLUMN     "amountPaidCurrency" TEXT,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paymentReference" TEXT;
