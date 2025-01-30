/*
  Warnings:

  - You are about to drop the `Transactionpin` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[transaction_Pass]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `transaction_Pass` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Transactionpin" DROP CONSTRAINT "Transactionpin_transaction_pin_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "transaction_Pass" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Transactionpin";

-- CreateIndex
CREATE UNIQUE INDEX "User_transaction_Pass_key" ON "User"("transaction_Pass");
