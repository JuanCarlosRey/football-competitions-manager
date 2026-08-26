/*
  Warnings:

  - You are about to drop the column `organization` on the `Competition` table. All the data in the column will be lost.
  - You are about to drop the column `awayScore` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `homeScore` on the `Match` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Season` table. All the data in the column will be lost.
  - You are about to drop the column `shortName` on the `Team` table. All the data in the column will be lost.
  - Added the required column `organizationId` to the `Competition` table without a default value. This is not possible if the table is not empty.
  - Added the required column `dateTime` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stadiumId` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `Match` table without a default value. This is not possible if the table is not empty.
  - Added the required column `endDate` to the `Season` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Season` table without a default value. This is not possible if the table is not empty.
  - Added the required column `abbreviation` to the `Team` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('SCHEDULED', 'LIVE', 'FINISHED');

-- AlterTable
ALTER TABLE "Competition" DROP COLUMN "organization",
ADD COLUMN     "organizationId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Match" DROP COLUMN "awayScore",
DROP COLUMN "date",
DROP COLUMN "homeScore",
ADD COLUMN     "dateTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "stadiumId" INTEGER NOT NULL,
ADD COLUMN     "status" "MatchStatus" NOT NULL;

-- AlterTable
ALTER TABLE "Season" DROP COLUMN "name",
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Team" DROP COLUMN "shortName",
ADD COLUMN     "abbreviation" TEXT NOT NULL,
ADD COLUMN     "crest" TEXT,
ADD COLUMN     "president" TEXT;

-- CreateTable
CREATE TABLE "Organization" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Stadium" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "Stadium_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Competition" ADD CONSTRAINT "Competition_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_stadiumId_fkey" FOREIGN KEY ("stadiumId") REFERENCES "Stadium"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
