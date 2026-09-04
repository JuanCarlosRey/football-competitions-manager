import type { CreateCompetitionDTO, UpdateCompetitionDTO } from '../schemas/competition.schema.js';
import * as competitionRepository from '../repositories/competition.repository.js';

/**
 * Retrieve all competitions from the database.
 * 
 * @returns A promise that resolves to an array of competitions, including their associated organization and seasons.
 */
export async function getAll() {
    return competitionRepository.findAllCompetitions();
}

/**
 * Retrieve a competition by its ID from the database.
 * 
 * @param id The ID of the competition to retrieve.
 * @returns A promise that resolves to the competition, including its associated organization and seasons.
 */
export async function getById(id: number) {
    return competitionRepository.findCompetitionById(id);
}

/**
 * Create a new competition in the database.
 * 
 * @param data The data for the new competition.
 * @returns A promise that resolves to the created competition.
 */
export async function create(data: CreateCompetitionDTO) {
    return competitionRepository.createCompetition(data);
}

/**
 * Update a competition in the database.
 * 
 * @param id The ID of the competition to update.
 * @param data The updated data for the competition.
 * @returns A promise that resolves to the updated competition.
 */
export async function update(id: number, data: UpdateCompetitionDTO) {
    return competitionRepository.updateCompetition(id, data);
}

/**
 * Delete a competition from the database.
 * 
 * @param id The ID of the competition to delete.
 * @returns A promise that resolves to the deleted competition.
 */
export async function deleteCompetition(id: number) {
    return competitionRepository.deleteCompetitionById(id);
}