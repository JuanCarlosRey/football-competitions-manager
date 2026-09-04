import type { Match, Prisma } from '@prisma/client';
import * as matchRepository from '../repositories/match.repository.js';

/**
 * Retrieve all matches from the database.
 * 
 * @returns A promise that resolves to an array of matches, including their associated season, stadium, home team, and away team.
 */
export async function getAll(): Promise<Match[]> {
    return matchRepository.findAllMatches();
}

/**
 * Retrieve a match by its ID from the database.
 * 
 * @param id The ID of the match to retrieve.
 * @returns A promise that resolves to the match, including its associated season, stadium, home team, and away team.
 */
export async function getById(id: number): Promise<Match | null> {
    return matchRepository.findMatchById(id);
}

/**
 * Create a new match in the database.
 * 
 * @param data The data for the new match.
 * @returns A promise that resolves to the created match.
 */
export async function create(data: Prisma.MatchUncheckedCreateInput): Promise<Match> {
    return matchRepository.createMatch(data);
}

/**
 * Update a match in the database.
 * 
 * @param id The ID of the match to update.
 * @param data The updated data for the match.
 * @returns A promise that resolves to the updated match.
 */
export async function update(id: number, data: Prisma.MatchUncheckedUpdateInput): Promise<Match> {
    return matchRepository.updateMatch(id, data);
}

/**
 * Delete a match from the database.
 * 
 * @param id The ID of the match to delete.
 * @returns A promise that resolves to the deleted match.
 */
export async function deleteMatch(id: number): Promise<Match> {
    return matchRepository.deleteMatchById(id);
}