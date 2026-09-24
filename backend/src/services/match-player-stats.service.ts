import type { MatchPlayerStats } from '@prisma/client';
import * as matchPlayerStatsRepository from '../repositories/match-player-stats.repository.js';
import type {
    CreateMatchPlayerStatsDTO,
    UpdateMatchPlayerStatsDTO,
} from '../schemas/match-player-stats.schema.js';

/**
 * Retrieve the stats for all players in a specific match.
 * 
 * @param matchId The ID of the match.
 * @returns A promise that resolves to an array of MatchPlayerStats records.
 */
export async function getStatsByMatch(matchId: number): Promise<MatchPlayerStats[]> {
    return matchPlayerStatsRepository.findStatsByMatchId(matchId);
}

/**
 * Create new player stats for a specific match.
 * 
 * @param matchId The ID of the match.
 * @param data The data for the new player stats.
 * @returns A promise that resolves to the created MatchPlayerStats record.
 * @throws Error if the match does not exist, the player is not in the match lineup,
 *               or stats for the player are already registered in the match.
 */
export async function addPlayerStats(
    matchId: number,
    data: CreateMatchPlayerStatsDTO
): Promise<MatchPlayerStats> {
    const { playerId } = data;
    const match = await matchPlayerStatsRepository.findMatchById(matchId);
    if (!match) {
        throw new Error(`Match with ID ${matchId} does not exist`);
    }
    const isInLineup = await matchPlayerStatsRepository.isPlayerInMatchLineup(
        matchId,
        playerId
    );
    if (!isInLineup) {
        throw new Error(
            `Player with ID ${playerId} is not part of the lineup for match ${matchId}`
        );
    }
    const existingStats = await matchPlayerStatsRepository.findStatsByMatchAndPlayer(
        matchId,
        playerId
    );
    if (existingStats) {
        throw new Error(
            `Stats for player with ID ${playerId} are already registered for match ${matchId}`
        );
    }
    const statsData = {
        matchId,
        ...data,
    };
    return matchPlayerStatsRepository.createMatchPlayerStats(statsData);
}

/**
 * Update existing player stats by ID for a specific match.
 * 
 * @param matchId The ID of the match.
 * @param statId The ID of the stats record to update.
 * @param data The updated player stats data.
 * @returns A promise that resolves to the updated MatchPlayerStats record.
 * @throws Error if the stats record is not found or does not belong to the given match.
 */
export async function updatePlayerStats(
    matchId: number,
    statId: number,
    data: UpdateMatchPlayerStatsDTO
): Promise<MatchPlayerStats> {
    const existingStats = await matchPlayerStatsRepository.findStatsById(statId);
    if (!existingStats || existingStats.matchId !== matchId) {
        throw new Error(
            `Stats entry with ID ${statId} was not found for match ${matchId}`
        );
    }
    return matchPlayerStatsRepository.updateMatchPlayerStats(statId, data);
}

/**
 * Remove an existing player stats record from a match by its ID.
 * 
 * @param matchId The ID of the match.
 * @param statId The ID of the stats record to delete.
 * @returns A promise that resolves to the deleted MatchPlayerStats record.
 * @throws Error if the stats record is not found or does not belong to the given match.
 */
export async function removePlayerStats(
    matchId: number,
    statId: number
): Promise<MatchPlayerStats> {
    const existingStats = await matchPlayerStatsRepository.findStatsById(statId);
    if (!existingStats || existingStats.matchId !== matchId) {
        throw new Error(
            `Stats entry with ID ${statId} was not found for match ${matchId}`
        );
    }
    return matchPlayerStatsRepository.deleteMatchPlayerStatsById(statId);
}