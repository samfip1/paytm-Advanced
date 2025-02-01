-- DropForeignKey
ALTER TABLE "Donation" DROP CONSTRAINT "Donation_senderId_fkey";

-- DropForeignKey
ALTER TABLE "Fraud_People" DROP CONSTRAINT "Fraud_People_fraud_people_userid_fkey";

-- DropForeignKey
ALTER TABLE "Friend" DROP CONSTRAINT "Friend_friendId_fkey";

-- DropForeignKey
ALTER TABLE "Friend" DROP CONSTRAINT "Friend_userId_fkey";

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
ALTER TABLE "SentRequest" DROP CONSTRAINT "SentRequest_userId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction_Pass" DROP CONSTRAINT "Transaction_Pass_userId_fkey";

-- DropForeignKey
ALTER TABLE "blog" DROP CONSTRAINT "blog_contentId_fkey";

-- AlterTable
ALTER TABLE "Admin" ALTER COLUMN "adminId" DROP DEFAULT,
ALTER COLUMN "adminId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Donation" ALTER COLUMN "donationId" SET DATA TYPE TEXT,
ALTER COLUMN "senderId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Fraud_People" ALTER COLUMN "fraud_people_userid" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Friend" ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "friendId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Loan" ALTER COLUMN "loanId" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "LoginActivity" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "MoneyRequest" ALTER COLUMN "moneyRequestId" SET DATA TYPE TEXT,
ALTER COLUMN "reciverId" SET DATA TYPE TEXT,
ALTER COLUMN "senderId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Request" ALTER COLUMN "requestid" SET DATA TYPE TEXT,
ALTER COLUMN "receiverId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "RequestFriend" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "SentRequest" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "senderId" SET DATA TYPE TEXT,
ALTER COLUMN "receiverId" SET DATA TYPE TEXT,
ALTER COLUMN "transactionid" DROP DEFAULT,
ALTER COLUMN "transactionid" SET DATA TYPE TEXT,
ALTER COLUMN "trasanctionId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Transaction_Pass" ALTER COLUMN "userId" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "userid" DROP DEFAULT,
ALTER COLUMN "userid" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "blog" ALTER COLUMN "contentId" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "Transaction_Pass" ADD CONSTRAINT "Transaction_Pass_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "blog" ADD CONSTRAINT "blog_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "User"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Request" ADD CONSTRAINT "Request_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LoginActivity" ADD CONSTRAINT "LoginActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fraud_People" ADD CONSTRAINT "Fraud_People_fraud_people_userid_fkey" FOREIGN KEY ("fraud_people_userid") REFERENCES "User"("userid") ON DELETE RESTRICT ON UPDATE CASCADE;
