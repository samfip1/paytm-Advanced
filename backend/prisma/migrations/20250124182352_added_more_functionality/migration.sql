/*
  Warnings:

  - A unique constraint covering the columns `[transactionid]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `trasanctionId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "transactionid" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "trasanctionId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "leaderboardId" INTEGER;

-- CreateTable
CREATE TABLE "leaderboard" (
    "id" SERIAL NOT NULL,
    "rank" INTEGER,
    "totalTransactionMoney" INTEGER NOT NULL,

    CONSTRAINT "leaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_transactionid_key" ON "Transaction"("transactionid");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_leaderboardId_fkey" FOREIGN KEY ("leaderboardId") REFERENCES "leaderboard"("id") ON DELETE SET NULL ON UPDATE CASCADE;
