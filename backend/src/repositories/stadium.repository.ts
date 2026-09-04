import { type Stadium, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';

const includeRelations = {
    matches: true,
};

/**
 * Find all stadiums from the database, including their associated matches.
 * 
 * @returns A promise that resolves to an array of stadiums, including their associated matches.
 */
export async function findAllStadiums(): Promise<Stadium[]> {
    return prisma.stadium.findMany({
        include: includeRelations,
    });
}

/**
 * Find a stadium by its ID from the database, including its associated matches.
 * 
 * @param id The ID of the stadium to retrieve.
 * @returns A promise that resolves to the stadium or null if not found.
 */
export async function findStadiumById(id: number): Promise<Stadium | null> {
    return prisma.stadium.findUnique({
        where: { id },
        include: includeRelations,
    });
}

/**
 * Insert a new stadium into the database.
 * 
 * @param data The data for the new stadium.
 * @returns A promise that resolves to the created stadium.
 */
export async function createStadium(data: Prisma.StadiumCreateInput): Promise<Stadium> {
    return prisma.stadium.create({
        data,
    });
}

/**
 * Update an existing stadium in the database.
 * 
 * @param id The ID of the stadium to update.
 * @param data The updated data for the stadium.
 * @returns A promise that resolves to the updated stadium.
 */
export async function updateStadium(id: number, data: Prisma.StadiumUpdateInput): Promise<Stadium> {
    return prisma.stadium.update({
        where: { id },
        data,
    });
}

/**
 * Delete a stadium from the database by its ID.
 * 
 * @param id The ID of the stadium to delete.
 * @returns A promise that resolves to the deleted stadium.
 */
export async function deleteStadiumById(id: number): Promise<Stadium> {
    return prisma.stadium.delete({
        where: { id },
    });
}