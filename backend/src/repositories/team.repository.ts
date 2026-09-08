import { type Match, type Team, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';

const includeRelations = {
    stadium: true,
    homeMatches: true,
    awayMatches: true,
    players: {
        include: {
            player: true,
        },
    },
} satisfies Prisma.TeamInclude;

export type TeamWithRelations = Prisma.TeamGetPayload<{
    include: typeof includeRelations;
}>;

/**
 * Find all teams from the database, including their stadium, players, and matches.
 * 
 * @returns A promise that resolves to an array of teams with relations.
 */
export async function findAllTeams(): Promise<TeamWithRelations[]> {
    return prisma.team.findMany({
        include: includeRelations,
    });
}

/**
 * Find a team by its ID from the database, including its stadium, players, and matches.
 * 
 * @param id The ID of the team to retrieve.
 * @returns A promise that resolves to the team or null if not found.
 */
export async function findTeamById(id: number): Promise<TeamWithRelations | null> {
    return prisma.team.findUnique({
        where: { id },
        include: includeRelations,
    });
}

/**
 * Find all matches associated with a specific team (both home and away).
 * 
 * @param teamId The ID of the team.
 * @returns A promise that resolves to an array of matches.
 */
export async function findMatchesByTeamId(teamId: number): Promise<Match[]> {
    return prisma.match.findMany({
        where: {
            OR: [
                { homeTeamId: teamId },
                { awayTeamId: teamId },
            ],
        },
        include: {
            homeTeam: true,
            awayTeam: true,
            stadium: true,
        },
    });
}

/**
 * Insert a new team into the database.
 * 
 * @param data The data for the new team.
 * @returns A promise that resolves to the created team with relations.
 */
export async function createTeam(data: Prisma.TeamCreateInput): Promise<TeamWithRelations> {
    return prisma.team.create({
        data,
        include: includeRelations,
    });
}

/**
 * Update an existing team in the database.
 * 
 * @param id The ID of the team to update.
 * @param data The updated data for the team.
 * @returns A promise that resolves to the updated team with relations.
 */
export async function updateTeam(id: number, data: Prisma.TeamUpdateInput): Promise<TeamWithRelations> {
    return prisma.team.update({
        where: { id },
        data,
        include: includeRelations,
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