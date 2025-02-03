/*
  Warnings:

  - You are about to drop the column `transactionid` on the `Transaction` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Transaction_receiverId_key";

-- DropIndex
DROP INDEX "Transaction_receiverUsername_key";

-- DropIndex
DROP INDEX "Transaction_senderId_key";

-- DropIndex
DROP INDEX "Transaction_senderUsername_key";

-- DropIndex
DROP INDEX "Transaction_transactionid_key";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "transactionid",
ADD CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id");
