import { type Match, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';

const includeRelations = {
    season: true,
    stadium: true,
    homeTeam: true,
    awayTeam: true,
};

/**
 * Find all matches from the database with their relations.
 * 
 * @returns A promise that resolves to an array of matches, including their associated season, stadium, home team, and away team.
 */
export async function findAllMatches(): Promise<Match[]> {
    return prisma.match.findMany({
        include: includeRelations,
    });
}

/**
 * Find a match by its ID from the database with its relations.
 * 
 * @param id The ID of the match to retrieve.
 * @returns A promise that resolves to the match or null if not found.
 */
export async function findMatchById(id: number): Promise<Match | null> {
    return prisma.match.findUnique({
        where: { id },
        include: includeRelations,
    });
}

/**
 * Insert a new match into the database.
 * 
 * @param data The data for the new match.
 * @returns A promise that resolves to the created match.
 */
export async function createMatch(data: Prisma.MatchUncheckedCreateInput): Promise<Match> {
    return prisma.match.create({
        data,
        include: includeRelations,
    });
}

/**
 * Update an existing match in the database.
 * 
 * @param id The ID of the match to update.
 * @param data The updated data for the match.
 * @returns A promise that resolves to the updated match.
 */
export async function updateMatch(id: number, data: Prisma.MatchUncheckedUpdateInput): Promise<Match> {
    return prisma.match.update({
        where: { id },
        data,
        include: includeRelations,
    });
}

/**
 * Delete a match from the database by its ID.
 * 
 * @param id The ID of the match to delete.
 * @returns A promise that resolves to the deleted match.
 */
export async function deleteMatchById(id: number): Promise<Match> {
    return prisma.match.delete({
        where: { id },
    });
}