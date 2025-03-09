/*
  Warnings:

  - You are about to drop the column `leaderboardId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Friend` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Leaderboard` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Loan` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LoginActivity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MoneyRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Request` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RequestFriend` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SentRequest` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `blog` table. If the table is not empty, all the data it contains will be lost.

*/
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
ALTER TABLE "User" DROP CONSTRAINT "User_leaderboardId_fkey";

-- DropForeignKey
ALTER TABLE "blog" DROP CONSTRAINT "blog_contentId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "leaderboardId";

-- DropTable
DROP TABLE "Friend";

-- DropTable
DROP TABLE "Leaderboard";

-- DropTable
DROP TABLE "Loan";

-- DropTable
DROP TABLE "LoginActivity";

-- DropTable
DROP TABLE "MoneyRequest";

-- DropTable
DROP TABLE "Request";

-- DropTable
DROP TABLE "RequestFriend";

-- DropTable
DROP TABLE "SentRequest";

-- DropTable
DROP TABLE "blog";
