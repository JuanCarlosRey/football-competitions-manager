import { prisma } from '../config/prisma.js';
import type { CreateCompetitionDTO, UpdateCompetitionDTO } from '../schemas/competition.schema.js';

/**
 * Retrieve all competitions from the database.
 * 
 * @returns A promise that resolves to an array of competitions, including their associated organization and seasons.
 */
export async function getAll() {
    return prisma.competition.findMany({
        include: {
            organization: true,
            seasons: true,
        },
    });
}

/**
 * Retrieve a competition by its ID from the database.
 * 
 * @param id The ID of the competition to retrieve.
 * @returns A promise that resolves to the competition, including its associated organization and seasons.
 */
export async function getById(id: number) {
    return prisma.competition.findUnique({
        where: { id },
        include: {
            organization: true,
            seasons: true,
        },
    });
}

/**
 * Create a new competition in the database.
 * 
 * @param data The data for the new competition.
 * @returns A promise that resolves to the created competition.
 */
export async function create(data: CreateCompetitionDTO) {
    return prisma.competition.create({
        data: {
            name: data.name,
            organizationId: data.organizationId,
        },
    });
}

/**
 * Update a competition in the database.
 * 
 * @param id The ID of the competition to update.
 * @param data The updated data for the competition.
 * @returns A promise that resolves to the updated competition.
 */
export async function update(id: number, data: UpdateCompetitionDTO) {
    return prisma.competition.update({
        where: { id },
        data: {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.organizationId !== undefined && { organizationId: data.organizationId }),
        },
    });
}

/**
 * Delete a competition from the database.
 * 
 * @param id The ID of the competition to delete.
 * @returns A promise that resolves to the deleted competition.
 */
export async function deleteCompetition(id: number) {
    return prisma.competition.delete({
        where: { id },
    });
}