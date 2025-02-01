/*
  Warnings:

  - You are about to drop the column `leaderboardId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_leaderboardId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "leaderboardId";

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_id_fkey" FOREIGN KEY ("id") REFERENCES "Leaderboard"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
