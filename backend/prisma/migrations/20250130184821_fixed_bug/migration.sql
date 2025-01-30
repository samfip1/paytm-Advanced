/*
  Warnings:

  - Added the required column `userId` to the `Transaction_Pass` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Transaction_Pass" DROP CONSTRAINT "Transaction_Pass_transaction_Pin_fkey";

-- AlterTable
ALTER TABLE "Transaction_Pass" ADD COLUMN     "userId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Transaction_Pass" ADD CONSTRAINT "Transaction_Pass_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;
