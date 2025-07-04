/*
  Warnings:

  - Added the required column `order` to the `remarks` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order` to the `senior_category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `order` to the `status` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "remarks" ADD COLUMN     "order" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "senior_category" ADD COLUMN     "order" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "status" ADD COLUMN     "order" INTEGER NOT NULL;
