import { type MatchTeamStats, type Match, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';

const includeRelations = {
    match: true,
    team: true,
};

/**
 * Find a specific match team stats record by its ID.
 * 
 * @param id The ID of the match team stats record.
 * @returns A promise that resolves to the MatchTeamStats record or null if not found.
 */
export async function findStatsById(id: number): Promise<MatchTeamStats | null> {
    return prisma.matchTeamStats.findUnique({
        where: { id },
        include: includeRelations,
    });
}

/**
 * Find all team stats entries for a specific match.
 * 
 * @param matchId The ID of the match.
 * @returns A promise that resolves to an array of MatchTeamStats records including relations.
 */
export async function findStatsByMatchId(matchId: number): Promise<MatchTeamStats[]> {
    return prisma.matchTeamStats.findMany({
        where: { matchId },
        include: includeRelations,
    });
}

/**
 * Find a specific team stats entry by match ID and team ID.
 * 
 * @param matchId The ID of the match.
 * @param teamId The ID of the team.
 * @returns A promise that resolves to the MatchTeamStats record or null if not found.
 */
export async function findStatsByMatchAndTeam(
    matchId: number,
    teamId: number
): Promise<MatchTeamStats | null> {
    return prisma.matchTeamStats.findUnique({
        where: {
            matchId_teamId: { matchId, teamId },
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
 * Create a new match team stats record.
 * 
 * @param data The match team stats data to insert.
 * @returns A promise that resolves to the created MatchTeamStats record including relations.
 */
export async function createMatchTeamStats(
    data: Prisma.MatchTeamStatsUncheckedCreateInput
): Promise<MatchTeamStats> {
    return prisma.matchTeamStats.create({
        data,
        include: includeRelations,
    });
}

/**
 * Update a match team stats record by its primary ID.
 * 
 * @param id The ID of the match team stats record to update.
 * @param data The updated match team stats data.
 * @returns A promise that resolves to the updated MatchTeamStats record including relations.
 */
export async function updateMatchTeamStats(
    id: number,
    data: Prisma.MatchTeamStatsUncheckedUpdateInput
): Promise<MatchTeamStats> {
    return prisma.matchTeamStats.update({
        where: { id },
        data,
        include: includeRelations,
    });
}

/**
 * Delete a match team stats record by its primary ID.
 * 
 * @param id The ID of the match team stats record to delete.
 * @returns A promise that resolves to the deleted MatchTeamStats record.
 */
export async function deleteMatchTeamStatsById(id: number): Promise<MatchTeamStats> {
    return prisma.matchTeamStats.delete({
        where: { id },
    });
}