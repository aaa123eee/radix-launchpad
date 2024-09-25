/*
  Warnings:

  - You are about to drop the `RadixComponent` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "RadixComponent";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Component" (
    "address" TEXT NOT NULL PRIMARY KEY,
    "tokenAddress" TEXT NOT NULL,
    CONSTRAINT "Component_tokenAddress_fkey" FOREIGN KEY ("tokenAddress") REFERENCES "Token" ("address") ON DELETE RESTRICT ON UPDATE CASCADE
);
