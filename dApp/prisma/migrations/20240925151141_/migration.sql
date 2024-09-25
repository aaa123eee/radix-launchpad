-- CreateTable
CREATE TABLE "Post" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Token" (
    "address" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "iconUrl" TEXT NOT NULL,
    "supply" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Order" (
    "address" TEXT NOT NULL PRIMARY KEY,
    "tokenAddress" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isBuy" BOOLEAN NOT NULL,
    "price" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    CONSTRAINT "Order_tokenAddress_fkey" FOREIGN KEY ("tokenAddress") REFERENCES "Token" ("address") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RadixComponent" (
    "address" TEXT NOT NULL PRIMARY KEY,
    "tokenAddress" TEXT NOT NULL,
    CONSTRAINT "RadixComponent_tokenAddress_fkey" FOREIGN KEY ("tokenAddress") REFERENCES "Token" ("address") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Post_name_idx" ON "Post"("name");
