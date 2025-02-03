/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `Leaderboard` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[rank]` on the table `Leaderboard` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Leaderboard_id_key" ON "Leaderboard"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Leaderboard_rank_key" ON "Leaderboard"("rank");

-- CreateIndex
CREATE UNIQUE INDEX "User_id_key" ON "User"("id");
