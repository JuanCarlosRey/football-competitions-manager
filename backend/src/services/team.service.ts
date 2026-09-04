import type { Team, Prisma } from '@prisma/client';
import * as teamRepository from '../repositories/team.repository.js';

/**
 * Retrieve all teams from the database, including their associated matches.
 * 
 * @returns A promise that resolves to an array of teams, including their associated matches.
 */
export async function getAll(): Promise<Team[]> {
    return teamRepository.findAllTeams();
}

/**
 * Retrieve a team by its ID from the database, including its associated matches.
 * 
 * @param id The ID of the team to retrieve.
 * @returns A promise that resolves to the team, including its associated matches.
 */
export async function getById(id: number): Promise<Team | null> {
    return teamRepository.findTeamById(id);
}

/**
 * Create a new team in the database.
 * 
 * @param data The data for the new team.
 * @returns A promise that resolves to the created team.
 */
export async function create(data: Prisma.TeamCreateInput): Promise<Team> {
    return teamRepository.createTeam(data);
}

/**
 * Update a team in the database.
 * 
 * @param id The ID of the team to update.
 * @param data The updated data for the team.
 * @returns A promise that resolves to the updated team.
 */
export async function update(id: number, data: Prisma.TeamUpdateInput): Promise<Team> {
    return teamRepository.updateTeam(id, data);
}

/**
 * Delete a team from the database.
 * 
 * @param id The ID of the team to delete.
 * @returns A promise that resolves to the deleted team.
 */
export async function deleteTeam(id: number): Promise<Team> {
    return teamRepository.deleteTeamById(id);
}