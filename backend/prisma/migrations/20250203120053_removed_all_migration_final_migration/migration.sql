-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "Money" BIGINT NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "phone" BIGINT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userid" TEXT NOT NULL,
    "totalTransactionDone" INTEGER NOT NULL DEFAULT 0,
    "totalnumberofSignin" INTEGER NOT NULL DEFAULT 0,
    "leaderboardId" INTEGER NOT NULL,
    "referralId" BIGINT NOT NULL DEFAULT 0,
    "totalRequests" INTEGER NOT NULL DEFAULT 0,
    "CreditScore" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction_Pass" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "transaction_Pin" BIGINT NOT NULL,

    CONSTRAINT "Transaction_Pass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "HeadingOfContent" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "numberOflike" INTEGER NOT NULL,
    "CreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Leaderboard" (
    "id" SERIAL NOT NULL,
    "rank" INTEGER NOT NULL,
    "totalTransactionMoney" INTEGER NOT NULL,

    CONSTRAINT "Leaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Friend" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "friendId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Friend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SentRequest" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "username" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "SentRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RequestFriend" (
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "username" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "MoneyRequest" (
    "id" SERIAL NOT NULL,
    "moneyRequestId" TEXT NOT NULL,
    "reciverId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "money" BIGINT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',

    CONSTRAINT "MoneyRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Donation" (
    "id" SERIAL NOT NULL,
    "donationId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "senderUsername" TEXT NOT NULL,
    "DonatedMoney" BIGINT NOT NULL,
    "message" TEXT,
    "donatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "trasanctionId" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "senderUsername" TEXT NOT NULL,
    "receiverUsername" TEXT NOT NULL,
    "amount" BIGINT NOT NULL,
    "TransactionAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "transactionid" TEXT NOT NULL,
    "Comment" TEXT
);

-- CreateTable
CREATE TABLE "Request" (
    "id" SERIAL NOT NULL,
    "requester_username" TEXT NOT NULL,
    "requesting_username" TEXT NOT NULL,
    "request_money" BIGINT NOT NULL,
    "requestid" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "RequestCreatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "receiverId" TEXT NOT NULL,

    CONSTRAINT "Request_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Loan" (
    "id" SERIAL NOT NULL,
    "loanId" TEXT NOT NULL,
    "loanMoney" DECIMAL(65,30) NOT NULL,
    "time" INTEGER NOT NULL,
    "interest" DECIMAL(65,30) NOT NULL,
    "repaymentDate" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "userId" TEXT NOT NULL,

    CONSTRAINT "Loan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LoginActivity" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "device" TEXT NOT NULL,
    "browser" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoginActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "phone" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "totalsignin" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fraud_People" (
    "id" SERIAL NOT NULL,
    "fraud_people_userid" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "Total_Money" BIGINT NOT NULL,
    "username" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "phone" BIGINT NOT NULL,
    "totalnumberofSignin" INTEGER NOT NULL,
    "totalTransactionDone" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_userid_key" ON "User"("userid");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_Pass_id_key" ON "Transaction_Pass"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_Pass_userId_key" ON "Transaction_Pass"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "blog_id_key" ON "blog"("id");

-- CreateIndex
CREATE UNIQUE INDEX "blog_username_key" ON "blog"("username");

-- CreateIndex
CREATE UNIQUE INDEX "blog_contentId_key" ON "blog"("contentId");

-- CreateIndex
CREATE UNIQUE INDEX "Leaderboard_id_key" ON "Leaderboard"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Leaderboard_rank_key" ON "Leaderboard"("rank");

-- CreateIndex
CREATE UNIQUE INDEX "Friend_userId_key" ON "Friend"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Friend_friendId_key" ON "Friend"("friendId");

-- CreateIndex
CREATE UNIQUE INDEX "SentRequest_userId_key" ON "SentRequest"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RequestFriend_userId_key" ON "RequestFriend"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RequestFriend_username_key" ON "RequestFriend"("username");

-- CreateIndex
CREATE UNIQUE INDEX "MoneyRequest_moneyRequestId_key" ON "MoneyRequest"("moneyRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "MoneyRequest_reciverId_key" ON "MoneyRequest"("reciverId");

-- CreateIndex
CREATE UNIQUE INDEX "MoneyRequest_senderId_key" ON "MoneyRequest"("senderId");

-- CreateIndex
CREATE UNIQUE INDEX "Donation_donationId_key" ON "Donation"("donationId");

-- CreateIndex
CREATE UNIQUE INDEX "Donation_senderId_key" ON "Donation"("senderId");

-- CreateIndex
CREATE UNIQUE INDEX "Donation_senderUsername_key" ON "Donation"("senderUsername");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_id_key" ON "Transaction"("id");

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
CREATE UNIQUE INDEX "Transaction_transactionid_key" ON "Transaction"("transactionid");

-- CreateIndex
CREATE UNIQUE INDEX "Request_requester_username_key" ON "Request"("requester_username");

-- CreateIndex
CREATE UNIQUE INDEX "Request_requesting_username_key" ON "Request"("requesting_username");

-- CreateIndex
CREATE UNIQUE INDEX "Request_requestid_key" ON "Request"("requestid");

-- CreateIndex
CREATE UNIQUE INDEX "Request_receiverId_key" ON "Request"("receiverId");

-- CreateIndex
CREATE UNIQUE INDEX "Loan_loanId_key" ON "Loan"("loanId");

-- CreateIndex
CREATE UNIQUE INDEX "Loan_userId_key" ON "Loan"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "LoginActivity_userId_key" ON "LoginActivity"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_id_key" ON "Admin"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_adminId_key" ON "Admin"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_phone_key" ON "Admin"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Fraud_People_id_key" ON "Fraud_People"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Fraud_People_fraud_people_userid_key" ON "Fraud_People"("fraud_people_userid");

-- CreateIndex
CREATE UNIQUE INDEX "Fraud_People_Total_Money_key" ON "Fraud_People"("Total_Money");

-- CreateIndex
CREATE UNIQUE INDEX "Fraud_People_username_key" ON "Fraud_People"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Fraud_People_email_key" ON "Fraud_People"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Fraud_People_phone_key" ON "Fraud_People"("phone");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_leaderboardId_fkey" FOREIGN KEY ("leaderboardId") REFERENCES "Leaderboard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction_Pass" ADD CONSTRAINT "Transaction_Pass_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog" ADD CONSTRAINT "blog_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "User"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friend" ADD CONSTRAINT "Friend_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friend" ADD CONSTRAINT "Friend_friendId_fkey" FOREIGN KEY ("friendId") REFERENCES "User"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentRequest" ADD CONSTRAINT "SentRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestFriend" ADD CONSTRAINT "RequestFriend_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoneyRequest" ADD CONSTRAINT "MoneyRequest_moneyRequestId_fkey" FOREIGN KEY ("moneyRequestId") REFERENCES "User"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoginActivity" ADD CONSTRAINT "LoginActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fraud_People" ADD CONSTRAINT "Fraud_People_fraud_people_userid_fkey" FOREIGN KEY ("fraud_people_userid") REFERENCES "User"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;
