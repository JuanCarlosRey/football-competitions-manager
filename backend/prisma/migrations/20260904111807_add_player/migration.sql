-- CreateEnum
CREATE TYPE "PreferredFoot" AS ENUM ('LEFT', 'RIGHT', 'BOTH');

-- CreateTable
CREATE TABLE "Player" (
    "id" SERIAL NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "position" TEXT NOT NULL,
    "nationality" TEXT NOT NULL,
    "overall" INTEGER NOT NULL,
    "height" DOUBLE PRECISION NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "preferredFoot" "PreferredFoot" NOT NULL,
    "marketValue" DECIMAL(12,2),
    "annualSalary" DECIMAL(12,2),

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);
