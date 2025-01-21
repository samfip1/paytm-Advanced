-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "senderId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "senderUsername" TEXT NOT NULL,
    "receiverUsername" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "TransactionAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_id_key" ON "Transaction"("id");
