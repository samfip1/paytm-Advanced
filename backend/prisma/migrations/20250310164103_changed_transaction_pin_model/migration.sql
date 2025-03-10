-- DropForeignKey
ALTER TABLE "Transaction_Pass" DROP CONSTRAINT "Transaction_Pass_userId_fkey";

-- AddForeignKey
ALTER TABLE "Transaction_Pass" ADD CONSTRAINT "Transaction_Pass_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userid") ON DELETE CASCADE ON UPDATE CASCADE;
