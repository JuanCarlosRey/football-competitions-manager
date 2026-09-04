import { type Season, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';

const includeRelations = {
    competition: true,
    matches: true,
};

const includeCompetition = {
    competition: true,
};

/**
 * Find all seasons from the database, including their associated competition and matches.
 * 
 * @returns A promise that resolves to an array of seasons, including their associated competition and matches.
 */
export async function findAllSeasons(): Promise<Season[]> {
    return prisma.season.findMany({
        include: includeRelations,
    });
}

/**
 * Find a season by its ID from the database, including its associated competition and matches.
 * 
 * @param id The ID of the season to retrieve.
 * @returns A promise that resolves to the season or null if not found.
 */
export async function findSeasonById(id: number): Promise<Season | null> {
    return prisma.season.findUnique({
        where: { id },
        include: includeRelations,
    });
}

/**
 * Insert a new season into the database, including its associated competition.
 * 
 * @param data The data for the new season.
 * @returns A promise that resolves to the created season.
 */
export async function createSeason(data: Prisma.SeasonCreateInput): Promise<Season> {
    return prisma.season.create({
        data,
        include: includeCompetition,
    });
}

/**
 * Update an existing season in the database, including its associated competition.
 * 
 * @param id The ID of the season to update.
 * @param data The updated data for the season.
 * @returns A promise that resolves to the updated season.
 */
export async function updateSeason(id: number, data: Prisma.SeasonUpdateInput): Promise<Season> {
    return prisma.season.update({
        where: { id },
        data,
        include: includeCompetition,
    });
}

/**
 * Delete a season from the database by its ID.
 * 
 * @param id The ID of the season to delete.
 * @returns A promise that resolves to the deleted season.
 */
export async function deleteSeasonById(id: number): Promise<Season> {
    return prisma.season.delete({
        where: { id },
    });
}