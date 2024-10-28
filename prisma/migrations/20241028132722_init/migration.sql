-- CreateTable
CREATE TABLE "Itens" (
    "name" TEXT NOT NULL,
    "mark" TEXT NOT NULL,
    "category" TEXT,
    "amount" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Itens_name_key" ON "Itens"("name");
