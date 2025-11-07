-- CreateEnum
CREATE TYPE "public"."TransactionType" AS ENUM ('released', 'pending');

-- AlterTable
ALTER TABLE "public"."applications" ADD COLUMN     "rejectionReason" TEXT;

-- AlterTable
ALTER TABLE "public"."senior" ADD COLUMN     "contact_relationship" TEXT,
ADD COLUMN     "low_income" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "contact_no" DROP NOT NULL,
ALTER COLUMN "emergency_no" DROP NOT NULL;

-- CreateTable
CREATE TABLE "public"."transaction" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "benefits" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "type" "public"."TransactionType" NOT NULL,
    "category" TEXT NOT NULL,
    "seniorName" TEXT,
    "barangay" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."government_fund" (
    "id" SERIAL NOT NULL,
    "currentBalance" DOUBLE PRECISION NOT NULL DEFAULT 500000,
    "lastUpdatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "government_fund_pkey" PRIMARY KEY ("id")
);
