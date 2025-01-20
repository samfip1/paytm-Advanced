-- AlterTable
ALTER TABLE "User" ADD COLUMN     "Money" INTEGER NOT NULL DEFAULT 0,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");

-- DropIndex
DROP INDEX "User_id_key";
