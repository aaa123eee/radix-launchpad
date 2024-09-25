/*
  Warnings:

  - A unique constraint covering the columns `[tokenAddress]` on the table `Component` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Component_tokenAddress_key" ON "Component"("tokenAddress");
