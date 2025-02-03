/*
  Warnings:

  - A unique constraint covering the columns `[adminId]` on the table `Admin` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[donationId]` on the table `Donation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[senderUsername]` on the table `Donation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[Total_Money]` on the table `Fraud_People` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Friend` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[friendId]` on the table `Friend` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Loan` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `LoginActivity` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[reciverId]` on the table `MoneyRequest` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[senderId]` on the table `MoneyRequest` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[receiverId]` on the table `Request` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `SentRequest` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[trasanctionId]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[senderId]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[receiverId]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[senderUsername]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[receiverUsername]` on the table `Transaction` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[userId]` on the table `Transaction_Pass` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[username]` on the table `blog` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Admin_adminId_key" ON "Admin"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "Donation_donationId_key" ON "Donation"("donationId");

-- CreateIndex
CREATE UNIQUE INDEX "Donation_senderUsername_key" ON "Donation"("senderUsername");

-- CreateIndex
CREATE UNIQUE INDEX "Fraud_People_Total_Money_key" ON "Fraud_People"("Total_Money");

-- CreateIndex
CREATE UNIQUE INDEX "Friend_userId_key" ON "Friend"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Friend_friendId_key" ON "Friend"("friendId");

-- CreateIndex
CREATE UNIQUE INDEX "Loan_userId_key" ON "Loan"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LoginActivity_userId_key" ON "LoginActivity"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "MoneyRequest_reciverId_key" ON "MoneyRequest"("reciverId");

-- CreateIndex
CREATE UNIQUE INDEX "MoneyRequest_senderId_key" ON "MoneyRequest"("senderId");

-- CreateIndex
CREATE UNIQUE INDEX "Request_receiverId_key" ON "Request"("receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "SentRequest_userId_key" ON "SentRequest"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_trasanctionId_key" ON "Transaction"("trasanctionId");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_senderId_key" ON "Transaction"("senderId");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_receiverId_key" ON "Transaction"("receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_senderUsername_key" ON "Transaction"("senderUsername");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_receiverUsername_key" ON "Transaction"("receiverUsername");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_Pass_userId_key" ON "Transaction_Pass"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "blog_username_key" ON "blog"("username");
