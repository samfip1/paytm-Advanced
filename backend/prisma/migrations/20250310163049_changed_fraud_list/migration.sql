-- DropIndex
DROP INDEX "Fraud_People_Total_Money_key";

-- DropIndex
DROP INDEX "Fraud_People_email_key";

-- DropIndex
DROP INDEX "Fraud_People_phone_key";

-- DropIndex
DROP INDEX "Fraud_People_username_key";

-- AlterTable
ALTER TABLE "Fraud_People" ADD CONSTRAINT "Fraud_People_pkey" PRIMARY KEY ("id");

-- DropIndex
DROP INDEX "Fraud_People_id_key";
