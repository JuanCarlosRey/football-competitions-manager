import type { MatchLineup } from '@prisma/client';
import * as matchLineupRepository from '../repositories/match-lineup.repository.js';
import type { CreateMatchLineupDTO, UpdateMatchLineupItemDTO } from '../schemas/match-lineup.schema.js';

/**
 * Retrieve the lineups for a specific match.
 * 
 * @param matchId The id of the match.
 * @returns A promise that resolves to an array of lineups.
 */
export async function getLineupsByMatch(matchId: number): Promise<MatchLineup[]> {
    return matchLineupRepository.findLineupsByMatchId(matchId);
}

/**
 * Create a new team lineup for a specific match.
 * 
 * @param matchId The id of the match.
 * @param data The data for the new lineup.
 * @returns A promise that resolves to an array of lineups.
 * @throws Error if the match does not exist, the team does not play in the match,
 *               a player is already registered, or a player is not an active team member on match date.
 */
export async function addTeamLineup(matchId: number, data: CreateMatchLineupDTO): Promise<MatchLineup[]> {
    const { teamId, players } = data;
    const match = await matchLineupRepository.findMatchById(matchId);
    if (!match) {
        throw new Error(`Match with ID ${matchId} does not exist`);
    }
    if (match.homeTeamId !== teamId && match.awayTeamId !== teamId) {
        throw new Error(`Team with ID ${teamId} does not play in match ${matchId}`);
    }
    const playerIds = players.map((p) => p.playerId);
    for (const playerId of playerIds) {
        const existingPlayer = await matchLineupRepository.findLineupByMatchAndPlayer(matchId, playerId);
        if (existingPlayer) {
            throw new Error(`Player with ID ${playerId} is already registered in the lineup for match ${matchId}`);
        }
    }
    const validContracts = await matchLineupRepository.findValidTeamPlayersForDate(teamId, playerIds, match.dateTime);
    const validPlayerIds = new Set(validContracts.map((c) => c.playerId));
    const invalidPlayerIds = playerIds.filter((id) => !validPlayerIds.has(id));
    if (invalidPlayerIds.length > 0) {
        throw new Error(
            `Players [${invalidPlayerIds.join(', ')}] were not active members of team ${teamId} on match date (${match.dateTime.toISOString()})`
        );
    }
    const lineupData = players.map((p) => ({
        matchId,
        teamId,
        playerId: p.playerId,
        starter: p.starter,
        shirtNumber: p.shirtNumber,
        position: p.position,
    }));
    await matchLineupRepository.createManyMatchLineups(lineupData);
    return matchLineupRepository.findLineupsByMatchId(matchId);
}

/**
 * Update an existing match lineup entry by its ID for a specific match.
 * 
 * @param matchId The ID of the match.
 * @param lineupId The ID of the lineup entry to update.
 * @param data The updated lineup information.
 * @returns A promise that resolves to the updated MatchLineup record.
 * @throws Error if the lineup entry is not found or does not belong to the given match.
 */
export async function updateLineupEntry(
    matchId: number,
    lineupId: number,
    data: UpdateMatchLineupItemDTO
): Promise<MatchLineup> {
    const existingLineup = await matchLineupRepository.findLineupById(lineupId);
    if (!existingLineup || existingLineup.matchId !== matchId) {
        throw new Error(`Lineup entry with ID ${lineupId} was not found for match ${matchId}`);
    }
    return matchLineupRepository.updateMatchLineup(lineupId, data);
}

/**
 * Remove an existing lineup entry from a match by its ID.
 * 
 * @param matchId The ID of the match.
 * @param lineupId The ID of the lineup entry to delete.
 * @returns A promise that resolves to the deleted MatchLineup record.
 * @throws Error if the lineup entry is not found or does not belong to the given match.
 */
export async function removeLineupEntry(matchId: number, lineupId: number): Promise<MatchLineup> {
    const existingLineup = await matchLineupRepository.findLineupById(lineupId);
    if (!existingLineup || existingLineup.matchId !== matchId) {
        throw new Error(`Lineup entry with ID ${lineupId} was not found for match ${matchId}`);
    }
    return matchLineupRepository.deleteMatchLineupById(lineupId);
}