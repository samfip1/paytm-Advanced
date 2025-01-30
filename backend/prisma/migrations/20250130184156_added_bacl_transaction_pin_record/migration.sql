/*
  Warnings:

  - You are about to drop the column `transaction_Pass` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[leaderboardId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "User_transaction_Pass_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "transaction_Pass";

-- CreateTable
CREATE TABLE "Transaction_Pass" (
    "id" SERIAL NOT NULL,
    "transaction_Pin" INTEGER NOT NULL,

    CONSTRAINT "Transaction_Pass_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_Pass_id_key" ON "Transaction_Pass"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_Pass_transaction_Pin_key" ON "Transaction_Pass"("transaction_Pin");

-- CreateIndex
CREATE UNIQUE INDEX "User_leaderboardId_key" ON "User"("leaderboardId");

-- AddForeignKey
ALTER TABLE "Transaction_Pass" ADD CONSTRAINT "Transaction_Pass_transaction_Pin_fkey" FOREIGN KEY ("transaction_Pin") REFERENCES "User"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;
