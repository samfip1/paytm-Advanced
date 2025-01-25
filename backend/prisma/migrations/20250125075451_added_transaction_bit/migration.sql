/*
  Warnings:

  - A unique constraint covering the columns `[userid]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "Transactionpin" (
    "id" SERIAL NOT NULL,
    "transaction_pin" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Transactionpin_id_key" ON "Transactionpin"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Transactionpin_transaction_pin_key" ON "Transactionpin"("transaction_pin");

-- CreateIndex
CREATE UNIQUE INDEX "User_userid_key" ON "User"("userid");

-- AddForeignKey
ALTER TABLE "Transactionpin" ADD CONSTRAINT "Transactionpin_transaction_pin_fkey" FOREIGN KEY ("transaction_pin") REFERENCES "User"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;
