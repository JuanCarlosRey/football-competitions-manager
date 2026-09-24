-- AlterTable
ALTER TABLE "MatchTeamStats" ALTER COLUMN "possession" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "MatchPlayerStats" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "playerId" INTEGER NOT NULL,
    "goals" INTEGER NOT NULL DEFAULT 0,
    "goalsConceded" INTEGER NOT NULL DEFAULT 0,
    "assists" INTEGER NOT NULL DEFAULT 0,
    "yellowCards" INTEGER NOT NULL DEFAULT 0,
    "redCards" INTEGER NOT NULL DEFAULT 0,
    "rating" REAL,

    CONSTRAINT "MatchPlayerStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MatchPlayerStats_matchId_idx" ON "MatchPlayerStats"("matchId");

-- CreateIndex
CREATE INDEX "MatchPlayerStats_playerId_idx" ON "MatchPlayerStats"("playerId");

-- CreateIndex
CREATE UNIQUE INDEX "MatchPlayerStats_matchId_playerId_key" ON "MatchPlayerStats"("matchId", "playerId");

-- AddForeignKey
ALTER TABLE "MatchPlayerStats" ADD CONSTRAINT "MatchPlayerStats_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchPlayerStats" ADD CONSTRAINT "MatchPlayerStats_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
