import type { TeamPlayer } from '@prisma/client';
import * as teamPlayerRepository from '../repositories/team-player.repository.js';
import type { CreateTeamPlayerDTO, UpdateTeamPlayerDTO } from '../schemas/team-player.schema.js';

/**
 * Retrieve all players associated with a specific team.
 * 
 * @param teamId The ID of the team whose players are being retrieved.
 * @returns A promise that resolves to an array of TeamPlayer records.
 */
export async function getPlayersByTeam(teamId: number): Promise<TeamPlayer[]> {
  return teamPlayerRepository.findPlayersByTeamId(teamId);
}

/**
 * Add a player to a team. If the player has an existing active contract in any team,
 * its endDate is automatically set to one day prior to the new contract's startDate.
 * 
 * @param teamId The ID of the team.
 * @param data The data containing playerId, startDate, and optional endDate.
 * @returns A promise that resolves to the created TeamPlayer record.
 * @throws Error if the player is already active in the same team.
 */
export async function addPlayerToTeam(teamId: number, data: CreateTeamPlayerDTO): Promise<TeamPlayer> {
  const activeSameTeam = await teamPlayerRepository.findActiveTeamPlayer(teamId, data.playerId);
  if (activeSameTeam) {
    throw new Error('The player is already active in this team');
  }
  const currentActiveContract = await teamPlayerRepository.findActivePlayerContract(data.playerId);
  if (currentActiveContract) {
    const newStartDate = new Date(data.startDate);
    const dayBefore = new Date(newStartDate);
    dayBefore.setDate(dayBefore.getDate() - 1);
    await teamPlayerRepository.updateTeamPlayer(currentActiveContract.id, {
      endDate: dayBefore,
    });
  }
  return teamPlayerRepository.createTeamPlayer({
    teamId,
    playerId: data.playerId,
    startDate: data.startDate,
    endDate: data.endDate,
  });
}

/**
 * Update contract dates for an active team-player relation.
 * 
 * @param teamId The ID of the team.
 * @param playerId The ID of the player.
 * @param data The updated date information (startDate, endDate).
 * @returns A promise that resolves to the updated TeamPlayer record.
 * @throws Error if no active relation exists between the team and player.
 */
export async function updatePlayerDates(
  teamId: number,
  playerId: number,
  data: UpdateTeamPlayerDTO
): Promise<TeamPlayer> {
  const activeRelation = await teamPlayerRepository.findActiveTeamPlayer(teamId, playerId);
  if (!activeRelation) {
    throw new Error('No active relation found between this team and player');
  }
  return teamPlayerRepository.updateTeamPlayer(activeRelation.id, data);
}

/**
 * Remove an active player assignment from a team.
 * 
 * @param teamId The ID of the team.
 * @param playerId The ID of the player to remove.
 * @returns A promise that resolves to the deleted TeamPlayer record.
 * @throws Error if no active relation exists to remove.
 */
export async function removePlayerFromTeam(teamId: number, playerId: number): Promise<TeamPlayer> {
  const activeRelation = await teamPlayerRepository.findActiveTeamPlayer(teamId, playerId);
  if (!activeRelation) {
    throw new Error('No active relation found to remove');
  }
  return teamPlayerRepository.deleteTeamPlayerById(activeRelation.id);
}

export interface PlayerCareerDTO {
  team: string;
  startDate: Date;
  endDate: Date | null;
}

/**
 * Retrieve and format the career history of a player.
 * 
 * @param playerId The ID of the player whose career history is being retrieved.
 * @returns A promise that resolves to an array of formatted career entries.
 */
export async function getPlayerCareer(playerId: number): Promise<PlayerCareerDTO[]> {
  const history = await teamPlayerRepository.findCareerByPlayerId(playerId);
  return history.map((record) => ({
    team: record.team.name,
    startDate: record.startDate,
    endDate: record.endDate,
  }));
}