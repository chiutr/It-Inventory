/*
  Warnings:

  - You are about to drop the `Itens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Itens";

-- CreateTable
CREATE TABLE "item" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "item_pkey" PRIMARY KEY ("id")
);
