import type { MatchTeamStats } from '@prisma/client';
import * as matchTeamStatsRepository from '../repositories/match-team-stats.repository.js';
import type { CreateMatchTeamStatsDTO } from '../schemas/match-team-stats.schema.js';

/**
 * Retrieve the stats for a specific match.
 * 
 * @param matchId The ID of the match.
 * @returns A promise that resolves to an array of MatchTeamStats records.
 */
export async function getStatsByMatch(matchId: number): Promise<MatchTeamStats[]> {
    return matchTeamStatsRepository.findStatsByMatchId(matchId);
}

/**
 * Create new team stats for a specific match.
 * 
 * @param matchId The ID of the match.
 * @param data The data for the new team stats.
 * @returns A promise that resolves to the created MatchTeamStats record.
 * @throws Error if the match does not exist, the team does not play in the match,
 *               or stats for the team already exist in the match.
 */
export async function addTeamStats(
    matchId: number,
    data: CreateMatchTeamStatsDTO
): Promise<MatchTeamStats> {
    const { teamId } = data;
    const match = await matchTeamStatsRepository.findMatchById(matchId);
    if (!match) {
        throw new Error(`Match with ID ${matchId} does not exist`);
    }
    if (match.homeTeamId !== teamId && match.awayTeamId !== teamId) {
        throw new Error(`Team with ID ${teamId} does not play in match ${matchId}`);
    }
    const existingStats = await matchTeamStatsRepository.findStatsByMatchAndTeam(matchId, teamId);
    if (existingStats) {
        throw new Error(`Stats for team with ID ${teamId} are already registered for match ${matchId}`);
    }
    const statsData = {
        matchId,
        ...data,
    };
    return matchTeamStatsRepository.createMatchTeamStats(statsData);
}

/**
 * Update existing team stats by ID for a specific match.
 * 
 * @param matchId The ID of the match.
 * @param statId The ID of the stats record to update.
 * @param data The updated team stats data.
 * @returns A promise that resolves to the updated MatchTeamStats record.
 * @throws Error if the stats record is not found or does not belong to the given match.
 */
export async function updateTeamStats(
    matchId: number,
    statId: number,
    data: Partial<CreateMatchTeamStatsDTO>
): Promise<MatchTeamStats> {
    const existingStats = await matchTeamStatsRepository.findStatsById(statId);
    if (!existingStats || existingStats.matchId !== matchId) {
        throw new Error(`Stats entry with ID ${statId} was not found for match ${matchId}`);
    }
    return matchTeamStatsRepository.updateMatchTeamStats(statId, data);
}

/**
 * Remove an existing team stats record from a match by its ID.
 * 
 * @param matchId The ID of the match.
 * @param statId The ID of the stats record to delete.
 * @returns A promise that resolves to the deleted MatchTeamStats record.
 * @throws Error if the stats record is not found or does not belong to the given match.
 */
export async function removeTeamStats(matchId: number, statId: number): Promise<MatchTeamStats> {
    const existingStats = await matchTeamStatsRepository.findStatsById(statId);
    if (!existingStats || existingStats.matchId !== matchId) {
        throw new Error(`Stats entry with ID ${statId} was not found for match ${matchId}`);
    }
    return matchTeamStatsRepository.deleteMatchTeamStatsById(statId);
}