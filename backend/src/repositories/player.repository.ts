import { type Player, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';

/**
 * Find all players from the database.
 * 
 * @returns A promise that resolves to an array of players.
 */
export async function findAllPlayers(): Promise<Player[]> {
    return prisma.player.findMany();
}

/**
 * Find a player by their ID from the database.
 * 
 * @param id The ID of the player to retrieve.
 * @returns A promise that resolves to the player or null if not found.
 */
export async function findPlayerById(id: number): Promise<Player | null> {
    return prisma.player.findUnique({
        where: { id },
    });
}

/**
 * Insert a new player into the database.
 * 
 * @param data The data for the new player.
 * @returns A promise that resolves to the created player.
 */
export async function createPlayer(data: Prisma.PlayerCreateInput): Promise<Player> {
    return prisma.player.create({
        data,
    });
}

/**
 * Update an existing player in the database.
 * 
 * @param id The ID of the player to update.
 * @param data The updated data for the player.
 * @returns A promise that resolves to the updated player.
 */
export async function updatePlayer(id: number, data: Prisma.PlayerUpdateInput): Promise<Player> {
    return prisma.player.update({
        where: { id },
        data,
    });
}

/**
 * Delete a player from the database by their ID.
 * 
 * @param id The ID of the player to delete.
 * @returns A promise that resolves to the deleted player.
 */
export async function deletePlayerById(id: number): Promise<Player> {
    return prisma.player.delete({
        where: { id },
    });
}