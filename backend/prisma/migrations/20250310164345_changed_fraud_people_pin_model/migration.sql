-- DropForeignKey
ALTER TABLE "Fraud_People" DROP CONSTRAINT "Fraud_People_fraud_people_userid_fkey";

-- AddForeignKey
ALTER TABLE "Fraud_People" ADD CONSTRAINT "Fraud_People_fraud_people_userid_fkey" FOREIGN KEY ("fraud_people_userid") REFERENCES "User"("userid") ON DELETE CASCADE ON UPDATE CASCADE;
