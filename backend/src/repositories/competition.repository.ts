import { prisma } from '../config/prisma.js';
import type { CreateCompetitionDTO, UpdateCompetitionDTO } from '../schemas/competition.schema.js';

/**
 * Finds all competitions.
 * 
 * @returns A list of all competitions.
 */
export async function findAllCompetitions() {
    return prisma.competition.findMany({
        include: {
            organization: true,
            seasons: true,
        },
    });
}

/**
 * Finds a competition by its ID.
 * 
 * @param id The ID of the competition to find.
 * @returns The competition with the specified ID, or null if not found.
 */
export async function findCompetitionById(id: number) {
    return prisma.competition.findUnique({
        where: { id },
        include: {
            organization: true,
            seasons: true,
        },
    });
}

/**
 * Creates a new competition.
 * 
 * @param data The data for the competition to create.
 * @returns The created competition.
 */
export async function createCompetition(data: CreateCompetitionDTO) {
    return prisma.competition.create({
        data: {
            name: data.name,
            organizationId: data.organizationId,
        },
    });
}

/**
 * Updates a competition by its ID.
 * 
 * @param id The ID of the competition to update.
 * @param data The data for the competition to update.
 * @returns The updated competition.
 */
export async function updateCompetition(id: number, data: UpdateCompetitionDTO) {
    return prisma.competition.update({
        where: { id },
        data: {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.organizationId !== undefined && { organizationId: data.organizationId }),
        },
    });
}

/**
 * Deletes a competition by its ID.
 * 
 * @param id The ID of the competition to delete.
 * @returns The deleted competition.
 */
export async function deleteCompetitionById(id: number) {
    return prisma.competition.delete({
        where: { id },
    });
}