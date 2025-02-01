-- DropForeignKey
ALTER TABLE "Donation" DROP CONSTRAINT "Donation_senderId_fkey";

-- DropForeignKey
ALTER TABLE "Fraud_People" DROP CONSTRAINT "Fraud_People_fraud_people_userid_fkey";

-- DropForeignKey
ALTER TABLE "Loan" DROP CONSTRAINT "Loan_userId_fkey";

-- DropForeignKey
ALTER TABLE "LoginActivity" DROP CONSTRAINT "LoginActivity_userId_fkey";

-- DropForeignKey
ALTER TABLE "MoneyRequest" DROP CONSTRAINT "MoneyRequest_moneyRequestId_fkey";

-- DropForeignKey
ALTER TABLE "Request" DROP CONSTRAINT "Request_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "RequestFriend" DROP CONSTRAINT "RequestFriend_userId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction_Pass" DROP CONSTRAINT "Transaction_Pass_userId_fkey";

-- DropForeignKey
ALTER TABLE "blog" DROP CONSTRAINT "blog_contentId_fkey";

-- AlterTable
ALTER TABLE "Admin" ALTER COLUMN "adminId" SET DATA TYPE BIGINT,
ALTER COLUMN "phone" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "Donation" ALTER COLUMN "donationId" SET DATA TYPE BIGINT,
ALTER COLUMN "senderId" SET DATA TYPE BIGINT,
ALTER COLUMN "DonatedMoney" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "Fraud_People" ALTER COLUMN "fraud_people_userid" SET DATA TYPE BIGINT,
ALTER COLUMN "Total_Money" SET DATA TYPE BIGINT,
ALTER COLUMN "phone" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "Loan" ALTER COLUMN "userId" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "LoginActivity" ALTER COLUMN "userId" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "MoneyRequest" ALTER COLUMN "moneyRequestId" SET DATA TYPE BIGINT,
ALTER COLUMN "reciverId" SET DATA TYPE BIGINT,
ALTER COLUMN "senderId" SET DATA TYPE BIGINT,
ALTER COLUMN "money" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "Request" ALTER COLUMN "request_money" SET DATA TYPE BIGINT,
ALTER COLUMN "requestid" SET DATA TYPE BIGINT,
ALTER COLUMN "receiverId" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "RequestFriend" ALTER COLUMN "userId" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "senderId" SET DATA TYPE BIGINT,
ALTER COLUMN "receiverId" SET DATA TYPE BIGINT,
ALTER COLUMN "amount" SET DATA TYPE BIGINT,
ALTER COLUMN "transactionid" SET DATA TYPE BIGINT,
ALTER COLUMN "trasanctionId" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "Transaction_Pass" ALTER COLUMN "transaction_Pin" SET DATA TYPE BIGINT,
ALTER COLUMN "userId" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "Money" SET DATA TYPE BIGINT,
ALTER COLUMN "phone" SET DATA TYPE BIGINT,
ALTER COLUMN "userid" SET DATA TYPE BIGINT,
ALTER COLUMN "referralId" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "blog" ALTER COLUMN "contentId" SET DATA TYPE BIGINT;

-- AddForeignKey
ALTER TABLE "Transaction_Pass" ADD CONSTRAINT "Transaction_Pass_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestFriend" ADD CONSTRAINT "RequestFriend_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userid") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoneyRequest" ADD CONSTRAINT "MoneyRequest_moneyRequestId_fkey" FOREIGN KEY ("moneyRequestId") REFERENCES "User"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog" ADD CONSTRAINT "blog_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "User"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoginActivity" ADD CONSTRAINT "LoginActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fraud_People" ADD CONSTRAINT "Fraud_People_fraud_people_userid_fkey" FOREIGN KEY ("fraud_people_userid") REFERENCES "User"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;
