-- DropForeignKey
ALTER TABLE "Donation" DROP CONSTRAINT "Donation_senderId_fkey";

-- AlterTable
ALTER TABLE "Donation" ALTER COLUMN "senderId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("userid") ON DELETE SET NULL ON UPDATE CASCADE;
