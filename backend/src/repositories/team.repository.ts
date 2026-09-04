import { type Team, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';

const includeRelations = {
    homeMatches: true,
    awayMatches: true,
};

/**
 * Find all teams from the database, including their associated matches.
 * 
 * @returns A promise that resolves to an array of teams, including their associated matches.
 */
export async function findAllTeams(): Promise<Team[]> {
    return prisma.team.findMany({
        include: includeRelations,
    });
}

/**
 * Find a team by its ID from the database, including its associated matches.
 * 
 * @param id The ID of the team to retrieve.
 * @returns A promise that resolves to the team or null if not found.
 */
export async function findTeamById(id: number): Promise<Team | null> {
    return prisma.team.findUnique({
        where: { id },
        include: includeRelations,
    });
}

/**
 * Insert a new team into the database.
 * 
 * @param data The data for the new team.
 * @returns A promise that resolves to the created team.
 */
export async function createTeam(data: Prisma.TeamCreateInput): Promise<Team> {
    return prisma.team.create({
        data,
    });
}

/**
 * Update an existing team in the database.
 * 
 * @param id The ID of the team to update.
 * @param data The updated data for the team.
 * @returns A promise that resolves to the updated team.
 */
export async function updateTeam(id: number, data: Prisma.TeamUpdateInput): Promise<Team> {
    return prisma.team.update({
        where: { id },
        data,
    });
}

/**
 * Delete a team from the database by its ID.
 * 
 * @param id The ID of the team to delete.
 * @returns A promise that resolves to the deleted team.
 */
export async function deleteTeamById(id: number): Promise<Team> {
    return prisma.team.delete({
        where: { id },
    });
}