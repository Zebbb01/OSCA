-- CreateTable
CREATE TABLE "public"."fund_history" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "from" TEXT NOT NULL,
    "description" TEXT,
    "receiptPath" TEXT,
    "receiptUrl" TEXT,
    "previousBalance" DOUBLE PRECISION NOT NULL,
    "newBalance" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fund_history_pkey" PRIMARY KEY ("id")
);
