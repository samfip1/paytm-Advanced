/*
  Warnings:

  - Made the column `leaderboardId` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_leaderboardId_fkey";

-- AlterTable
ALTER TABLE "Admin" ADD CONSTRAINT "Admin_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "Comment" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "CreditScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "referralId" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalRequests" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "leaderboardId" SET NOT NULL;

-- CreateTable
CREATE TABLE "Friend" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "friendId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Friend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SentRequest" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,
    "username" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "SentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestFriend" (
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "username" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "MoneyRequest" (
    "id" SERIAL NOT NULL,
    "moneyRequestId" INTEGER NOT NULL,
    "reciverId" INTEGER NOT NULL,
    "senderId" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "money" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',

    CONSTRAINT "MoneyRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Donation" (
    "id" SERIAL NOT NULL,
    "donationId" INTEGER NOT NULL,
    "senderId" INTEGER NOT NULL,
    "senderUsername" TEXT NOT NULL,
    "DonatedMoney" INTEGER NOT NULL,
    "message" TEXT,
    "donatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "blog" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "HeadingOfContent" TEXT NOT NULL,
    "contentId" INTEGER NOT NULL,
    "numberOflike" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Request" (
    "id" SERIAL NOT NULL,
    "requester_username" TEXT NOT NULL,
    "requesting_username" TEXT NOT NULL,
    "request_money" INTEGER NOT NULL,
    "requestid" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "RequestCreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receiverId" INTEGER NOT NULL,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Loan" (
    "id" SERIAL NOT NULL,
    "loanId" DECIMAL(65,30) NOT NULL,
    "loanMoney" DECIMAL(65,30) NOT NULL,
    "time" INTEGER NOT NULL,
    "interest" DECIMAL(65,30) NOT NULL,
    "repaymentDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Loan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginActivity" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "browser" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fraud_People" (
    "id" SERIAL NOT NULL,
    "fraud_people_userid" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "Total_Money" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "phone" INTEGER NOT NULL,
    "totalnumberofSignin" INTEGER NOT NULL,
    "totalTransactionDone" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "RequestFriend_userId_key" ON "RequestFriend"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RequestFriend_username_key" ON "RequestFriend"("username");

-- CreateIndex
CREATE UNIQUE INDEX "MoneyRequest_moneyRequestId_key" ON "MoneyRequest"("moneyRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "Donation_senderId_key" ON "Donation"("senderId");

-- CreateIndex
CREATE UNIQUE INDEX "blog_id_key" ON "blog"("id");

-- CreateIndex
CREATE UNIQUE INDEX "blog_contentId_key" ON "blog"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "Request_requester_username_key" ON "Request"("requester_username");

-- CreateIndex
CREATE UNIQUE INDEX "Request_requesting_username_key" ON "Request"("requesting_username");

-- CreateIndex
CREATE UNIQUE INDEX "Request_requestid_key" ON "Request"("requestid");

-- CreateIndex
CREATE UNIQUE INDEX "Loan_loanId_key" ON "Loan"("loanId");

-- CreateIndex
CREATE UNIQUE INDEX "Fraud_People_id_key" ON "Fraud_People"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Fraud_People_fraud_people_userid_key" ON "Fraud_People"("fraud_people_userid");

-- CreateIndex
CREATE UNIQUE INDEX "Fraud_People_username_key" ON "Fraud_People"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Fraud_People_email_key" ON "Fraud_People"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Fraud_People_phone_key" ON "Fraud_People"("phone");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_leaderboardId_fkey" FOREIGN KEY ("leaderboardId") REFERENCES "leaderboard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friend" ADD CONSTRAINT "Friend_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friend" ADD CONSTRAINT "Friend_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentRequest" ADD CONSTRAINT "SentRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestFriend" ADD CONSTRAINT "RequestFriend_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoneyRequest" ADD CONSTRAINT "MoneyRequest_moneyRequestId_fkey" FOREIGN KEY ("moneyRequestId") REFERENCES "User"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog" ADD CONSTRAINT "blog_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "User"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoginActivity" ADD CONSTRAINT "LoginActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fraud_People" ADD CONSTRAINT "Fraud_People_fraud_people_userid_fkey" FOREIGN KEY ("fraud_people_userid") REFERENCES "User"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;
