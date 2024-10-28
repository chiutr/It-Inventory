/*
  Warnings:

  - You are about to drop the column `quantity` on the `item` table. All the data in the column will be lost.
  - Added the required column `amount` to the `item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mark` to the `item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "item" DROP COLUMN "quantity",
ADD COLUMN     "amount" INTEGER NOT NULL,
ADD COLUMN     "mark" TEXT NOT NULL;
