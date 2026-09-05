import type { Player, Prisma } from '@prisma/client';
import * as playerRepository from '../repositories/player.repository.js';
import * as teamPlayerService from './team-player.service.js';
import type { CreatePlayerDTO } from '../schemas/player.schema.js';

/**
 * Retrieve all players from the database.
 * 
 * @returns A promise that resolves to an array of players.
 */
export async function getAll() {
    const players = await playerRepository.findAllPlayers();
    return players.map((player) => {
        const activeContract = player.teams?.[0];
        return {
            ...player,
            currentTeam: activeContract?.team?.name ?? null,
            currentTeamId: activeContract?.team?.id ?? null,
        };
    });
}

/**
 * Retrieve a player by their ID from the database.
 * 
 * @param id The ID of the player to retrieve.
 * @returns A promise that resolves to the player or null if not found.
 */
export async function getById(id: number): Promise<Player | null> {
    return playerRepository.findPlayerById(id);
}

/**
 * Create a new player in the database and optionally assign them to a team if teamId is provided.
 * 
 * @param data The validated player creation data (including optional teamId).
 * @returns A promise that resolves to the created player.
 */
export async function create(data: CreatePlayerDTO): Promise<Player> {
    const { teamId, ...playerData } = data;
    const newPlayer = await playerRepository.createPlayer(playerData);
    if (teamId) {
        await teamPlayerService.addPlayerToTeam(teamId, {
            playerId: newPlayer.id,
            startDate: new Date(),
        });
    }
    return newPlayer;
}

/**
 * Update a player in the database.
 * 
 * @param id The ID of the player to update.
 * @param data The updated data for the player.
 * @returns A promise that resolves to the updated player.
 */
export async function update(id: number, data: Prisma.PlayerUpdateInput): Promise<Player> {
    return playerRepository.updatePlayer(id, data);
}

/**
 * Delete a player from the database.
 * 
 * @param id The ID of the player to delete.
 * @returns A promise that resolves to the deleted player.
 */
export async function deletePlayer(id: number): Promise<Player> {
    return playerRepository.deletePlayerById(id);
}