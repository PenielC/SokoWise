-- CreateEnum
CREATE TYPE "Country" AS ENUM ('ZIMBABWE', 'KENYA', 'SOUTH_AFRICA', 'NIGERIA', 'GHANA', 'UGANDA', 'TANZANIA', 'ZAMBIA', 'MOZAMBIQUE', 'BOTSWANA');

-- AlterTable
ALTER TABLE "Seller" ADD COLUMN     "country" "Country" NOT NULL DEFAULT 'ZIMBABWE';

-- CreateIndex
CREATE INDEX "Seller_country_city_idx" ON "Seller"("country", "city");
