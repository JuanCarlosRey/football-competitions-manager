import type { Player, Prisma } from '@prisma/client';
import * as playerRepository from '../repositories/player.repository.js';

/**
 * Retrieve all players from the database.
 * 
 * @returns A promise that resolves to an array of players.
 */
export async function getAll(): Promise<Player[]> {
    return playerRepository.findAllPlayers();
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
 * Create a new player in the database.
 * 
 * @param data The data for the new player.
 * @returns A promise that resolves to the created player.
 */
export async function create(data: Prisma.PlayerCreateInput): Promise<Player> {
    return playerRepository.createPlayer(data);
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