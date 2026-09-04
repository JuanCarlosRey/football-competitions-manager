import type { Season, Prisma } from '@prisma/client';
import * as seasonRepository from '../repositories/season.repository.js';

/**
 * Retrieve all seasons from the database, including their associated competition and matches.
 * 
 * @returns A promise that resolves to an array of seasons, including their associated competition and matches.
 */
export async function getAll(): Promise<Season[]> {
    return seasonRepository.findAllSeasons();
}

/**
 * Retrieve a season by its ID from the database, including its associated competition and matches.
 * 
 * @param id The ID of the season to retrieve.
 * @returns A promise that resolves to the season, including its associated competition and matches.
 */
export async function getById(id: number): Promise<Season | null> {
    return seasonRepository.findSeasonById(id);
}

/**
 * Create a new season in the database.
 * 
 * @param data The data for the new season.
 * @returns A promise that resolves to the created season.
 */
export async function create(data: Prisma.SeasonCreateInput): Promise<Season> {
    return seasonRepository.createSeason(data);
}

/**
 * Update a season in the database.
 * 
 * @param id The ID of the season to update.
 * @param data The updated data for the season.
 * @returns A promise that resolves to the updated season.
 */
export async function update(id: number, data: Prisma.SeasonUpdateInput): Promise<Season> {
    return seasonRepository.updateSeason(id, data);
}

/**
 * Delete a season from the database.
 * 
 * @param id The ID of the season to delete.
 * @returns A promise that resolves to the deleted season.
 */
export async function deleteSeason(id: number): Promise<Season> {
    return seasonRepository.deleteSeasonById(id);
}