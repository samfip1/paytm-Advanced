-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "totalsignin" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "totalTransactionDone" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalnumberofSignin" INTEGER NOT NULL DEFAULT 0;
