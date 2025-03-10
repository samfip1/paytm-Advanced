/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `Donation` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Donation_donationId_key";

-- DropIndex
DROP INDEX "Donation_senderId_key";

-- DropIndex
DROP INDEX "Donation_senderUsername_key";

-- CreateIndex
CREATE UNIQUE INDEX "Donation_id_key" ON "Donation"("id");
