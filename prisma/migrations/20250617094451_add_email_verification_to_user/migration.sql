/*
  Warnings:

  - A unique constraint covering the columns `[verificationToken]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "emailVerified" TIMESTAMP(3),
ADD COLUMN     "tokenExpires" TIMESTAMP(3),
ADD COLUMN     "verificationToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_verificationToken_key" ON "user"("verificationToken");
