import { type Match, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';

const includeRelations = {
    season: true,
    stadium: true,
    homeTeam: true,
    awayTeam: true,
};

/**
 * Retrieve all matches from the database.
 * 
 * @returns A promise that resolves to an array of matches, including their associated season, stadium, home team, and away team.
 */
export async function getAll(): Promise<Match[]> {
    return prisma.match.findMany({
        include: includeRelations,
    });
}

/**
 * Retrieve a match by its ID from the database.
 * 
 * @param id The ID of the match to retrieve.
 * @returns A promise that resolves to the match, including its associated season, stadium, home team, and away team.
 */
export async function getById(id: number): Promise<Match | null> {
    return prisma.match.findUnique({
        where: { id },
        include: includeRelations,
    });
}

/**
 * Create a new match in the database.
 * 
 * @param data The data for the new match.
 * @returns A promise that resolves to the created match.
 */
export async function create(data: Prisma.MatchUncheckedCreateInput): Promise<Match> {
    return prisma.match.create({
        data,
        include: includeRelations,
    });
}

/**
 * Update a match in the database.
 * 
 * @param id The ID of the match to update.
 * @param data The updated data for the match.
 * @returns A promise that resolves to the updated match.
 */
export async function update(id: number, data: Prisma.MatchUncheckedUpdateInput): Promise<Match> {
    return prisma.match.update({
        where: { id },
        data,
        include: includeRelations,
    });
}

/**
 * Delete a match from the database.
 * 
 * @param id The ID of the match to delete.
 * @returns A promise that resolves to the deleted match.
 */
export async function deleteMatch(id: number): Promise<Match> {
    return prisma.match.delete({
        where: { id },
    });
}