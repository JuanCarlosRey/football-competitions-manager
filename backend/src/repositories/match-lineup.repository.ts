import { type MatchLineup, type Match, type TeamPlayer, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';

const includeRelations = {
    match: true,
    team: true,
    player: true,
};

/**
 * Find a specific match lineup record by its ID.
 * 
 * @param id The ID of the match lineup record.
 * @returns A promise that resolves to the MatchLineup record or null if not found.
 */
export async function findLineupById(id: number): Promise<MatchLineup | null> {
    return prisma.matchLineup.findUnique({
        where: { id },
        include: includeRelations,
    });
}

/**
 * Find all lineup entries for a specific match.
 * 
 * @param matchId The ID of the match.
 * @returns A promise that resolves to an array of MatchLineup records including relations.
 */
export async function findLineupsByMatchId(matchId: number): Promise<MatchLineup[]> {
    return prisma.matchLineup.findMany({
        where: { matchId },
        include: includeRelations,
    });
}

/**
 * Find a specific lineup entry by match ID and player ID.
 * 
 * @param matchId The ID of the match.
 * @param playerId The ID of the player.
 * @returns A promise that resolves to the MatchLineup record or null if not found.
 */
export async function findLineupByMatchAndPlayer(matchId: number, playerId: number): Promise<MatchLineup | null> {
    return prisma.matchLineup.findUnique({
        where: {
            matchId_playerId: { matchId, playerId },
        },
        include: includeRelations,
    });
}

/**
 * Find match details by ID.
 * 
 * @param matchId The ID of the match.
 * @returns A promise that resolves to the Match record or null if not found.
 */
export async function findMatchById(matchId: number): Promise<Match | null> {
    return prisma.match.findUnique({
        where: { id: matchId },
    });
}

/**
 * Find active contract records for players on a specific date in a team.
 * 
 * @param teamId The ID of the team.
 * @param playerIds An array of player IDs to check.
 * @param date The date on which the players' contracts must be valid.
 * @returns A promise that resolves to an array of valid TeamPlayer records.
 */
export async function findValidTeamPlayersForDate(
    teamId: number,
    playerIds: number[],
    date: Date
): Promise<TeamPlayer[]> {
    return prisma.teamPlayer.findMany({
        where: {
            teamId,
            playerId: { in: playerIds },
            startDate: { lte: date },
            OR: [
                { endDate: null },
                { endDate: { gte: date } },
            ],
        },
    });
}

/**
 * Create multiple match lineup records in batch.
 * 
 * @param data An array of match lineup objects to insert.
 * @returns A promise that resolves to the Prisma BatchPayload object with the insertion count.
 */
export async function createManyMatchLineups(data: Prisma.MatchLineupUncheckedCreateInput[]): Promise<Prisma.BatchPayload> {
    return prisma.matchLineup.createMany({ data });
}

/**
 * Update a match lineup record by its primary ID.
 * 
 * @param id The ID of the match lineup record to update.
 * @param data The updated match lineup data.
 * @returns A promise that resolves to the updated MatchLineup record including relations.
 */
export async function updateMatchLineup(id: number, data: Prisma.MatchLineupUncheckedUpdateInput): Promise<MatchLineup> {
    return prisma.matchLineup.update({
        where: { id },
        data,
        include: includeRelations,
    });
}

/**
 * Delete a match lineup record by its primary ID.
 * 
 * @param id The ID of the match lineup record to delete.
 * @returns A promise that resolves to the deleted MatchLineup record.
 */
export async function deleteMatchLineupById(id: number): Promise<MatchLineup> {
    return prisma.matchLineup.delete({
        where: { id },
    });
}