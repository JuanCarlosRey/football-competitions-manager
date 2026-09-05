import { type TeamPlayer, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';

const includeRelations = {
    team: true,
    player: true,
};

/**
 * Find all player assignments associated with a specific team ID from the database.
 * 
 * @param teamId The ID of the team to retrieve players for.
 * @returns A promise that resolves to an array of TeamPlayer records including team and player relations.
 */
export async function findPlayersByTeamId(teamId: number): Promise<TeamPlayer[]> {
    return prisma.teamPlayer.findMany({
        where: { teamId },
        include: includeRelations,
    });
}

/**
 * Find an active team-player relation where endDate is null.
 * 
 * @param teamId The ID of the team.
 * @param playerId The ID of the player.
 * @returns A promise that resolves to the active TeamPlayer record or null if not found.
 */
export async function findActiveTeamPlayer(teamId: number, playerId: number): Promise<TeamPlayer | null> {
    return prisma.teamPlayer.findFirst({
        where: {
            teamId,
            playerId,
            endDate: null,
        },
        include: includeRelations,
    });
}

/**
 * Insert a new team-player assignment into the database.
 * 
 * @param data The data for creating the team-player relation.
 * @returns A promise that resolves to the created TeamPlayer record.
 */
export async function createTeamPlayer(data: Prisma.TeamPlayerUncheckedCreateInput): Promise<TeamPlayer> {
    return prisma.teamPlayer.create({
        data,
        include: includeRelations,
    });
}

/**
 * Update an existing team-player relation in the database by its ID.
 * 
 * @param id The ID of the TeamPlayer record to update.
 * @param data The updated data for the team-player relation.
 * @returns A promise that resolves to the updated TeamPlayer record.
 */
export async function updateTeamPlayer(id: number, data: Prisma.TeamPlayerUncheckedUpdateInput): Promise<TeamPlayer> {
    return prisma.teamPlayer.update({
        where: { id },
        data,
        include: includeRelations,
    });
}

/**
 * Delete a team-player relation from the database by its ID.
 * 
 * @param id The ID of the TeamPlayer record to delete.
 * @returns A promise that resolves to the deleted TeamPlayer record.
 */
export async function deleteTeamPlayerById(id: number): Promise<TeamPlayer> {
    return prisma.teamPlayer.delete({
        where: { id },
    });
}

export type TeamPlayerWithTeam = Prisma.TeamPlayerGetPayload<{
    include: { team: true };
}>;

/**
 * Find the full team history (career) for a specific player by player ID.
 * 
 * @param playerId The ID of the player to retrieve the career history for.
 * @returns A promise that resolves to an array of TeamPlayer records including team details.
 */
export async function findCareerByPlayerId(playerId: number): Promise<TeamPlayerWithTeam[]> {
    return prisma.teamPlayer.findMany({
        where: { playerId },
        include: {
            team: true,
        },
        orderBy: {
            startDate: 'desc',
        },
    });
}