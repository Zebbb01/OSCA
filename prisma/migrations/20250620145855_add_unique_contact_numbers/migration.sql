/*
  Warnings:

  - A unique constraint covering the columns `[contact_no]` on the table `senior` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[emergency_no]` on the table `senior` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "senior_contact_no_key" ON "senior"("contact_no");

-- CreateIndex
CREATE UNIQUE INDEX "senior_emergency_no_key" ON "senior"("emergency_no");
