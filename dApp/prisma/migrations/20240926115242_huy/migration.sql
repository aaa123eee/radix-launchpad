-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Order" (
    "address" TEXT NOT NULL PRIMARY KEY,
    "tokenAddress" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isBuy" BOOLEAN NOT NULL,
    "price" INTEGER NOT NULL,
    "amount" TEXT NOT NULL,
    CONSTRAINT "Order_tokenAddress_fkey" FOREIGN KEY ("tokenAddress") REFERENCES "Token" ("address") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Order" ("address", "amount", "createdAt", "isBuy", "price", "tokenAddress") SELECT "address", "amount", "createdAt", "isBuy", "price", "tokenAddress" FROM "Order";
DROP TABLE "Order";
ALTER TABLE "new_Order" RENAME TO "Order";
CREATE TABLE "new_Token" (
    "address" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "iconUrl" TEXT NOT NULL,
    "supply" TEXT NOT NULL
);
INSERT INTO "new_Token" ("address", "createdAt", "iconUrl", "name", "supply", "symbol") SELECT "address", "createdAt", "iconUrl", "name", "supply", "symbol" FROM "Token";
DROP TABLE "Token";
ALTER TABLE "new_Token" RENAME TO "Token";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
