import { type MatchPlayerStats, type Match, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';

const includeRelations = {
    match: true,
    player: true,
};

/**
 * Find a specific match player stats record by its ID.
 * 
 * @param id The ID of the match player stats record.
 * @returns A promise that resolves to the MatchPlayerStats record or null if not found.
 */
export async function findStatsById(id: number): Promise<MatchPlayerStats | null> {
    return prisma.matchPlayerStats.findUnique({
        where: { id },
        include: includeRelations,
    });
}

/**
 * Find all player stats entries for a specific match.
 * 
 * @param matchId The ID of the match.
 * @returns A promise that resolves to an array of MatchPlayerStats records including relations.
 */
export async function findStatsByMatchId(matchId: number): Promise<MatchPlayerStats[]> {
    return prisma.matchPlayerStats.findMany({
        where: { matchId },
        include: includeRelations,
    });
}

/**
 * Find a specific player stats entry by match ID and player ID.
 * 
 * @param matchId The ID of the match.
 * @param playerId The ID of the player.
 * @returns A promise that resolves to the MatchPlayerStats record or null if not found.
 */
export async function findStatsByMatchAndPlayer(
    matchId: number,
    playerId: number
): Promise<MatchPlayerStats | null> {
    return prisma.matchPlayerStats.findUnique({
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
 * Check if a player belongs to the lineup of a specific match.
 * 
 * @param matchId The ID of the match.
 * @param playerId The ID of the player.
 * @returns A promise that resolves to true if the player is in the lineup, false otherwise.
 */
export async function isPlayerInMatchLineup(
    matchId: number,
    playerId: number
): Promise<boolean> {
    const lineupEntry = await prisma.matchLineup.findUnique({
        where: {
            matchId_playerId: { matchId, playerId },
        },
    });
    return lineupEntry !== null;
}

/**
 * Create a new match player stats record.
 * 
 * @param data The match player stats data to insert.
 * @returns A promise that resolves to the created MatchPlayerStats record including relations.
 */
export async function createMatchPlayerStats(
    data: Prisma.MatchPlayerStatsUncheckedCreateInput
): Promise<MatchPlayerStats> {
    return prisma.matchPlayerStats.create({
        data,
        include: includeRelations,
    });
}

/**
 * Update a match player stats record by its primary ID.
 * 
 * @param id The ID of the match player stats record to update.
 * @param data The updated match player stats data.
 * @returns A promise that resolves to the updated MatchPlayerStats record including relations.
 */
export async function updateMatchPlayerStats(
    id: number,
    data: Prisma.MatchPlayerStatsUncheckedUpdateInput
): Promise<MatchPlayerStats> {
    return prisma.matchPlayerStats.update({
        where: { id },
        data,
        include: includeRelations,
    });
}

/**
 * Delete a match player stats record by its primary ID.
 * 
 * @param id The ID of the match player stats record to delete.
 * @returns A promise that resolves to the deleted MatchPlayerStats record.
 */
export async function deleteMatchPlayerStatsById(id: number): Promise<MatchPlayerStats> {
    return prisma.matchPlayerStats.delete({
        where: { id },
    });
}