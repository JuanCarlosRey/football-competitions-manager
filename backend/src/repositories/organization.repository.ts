import { type Organization, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';

const includeRelations = {
    competitions: true,
};

/**
 * Find all organizations from the database, including their associated competitions.
 * 
 * @returns A promise that resolves to an array of organizations, including their associated competitions.
 */
export async function findAllOrganizations(): Promise<Organization[]> {
    return prisma.organization.findMany({
        include: includeRelations,
    });
}

/**
 * Find an organization by its ID from the database, including its associated competitions.
 * 
 * @param id The ID of the organization to retrieve.
 * @returns A promise that resolves to the organization or null if not found.
 */
export async function findOrganizationById(id: number): Promise<Organization | null> {
    return prisma.organization.findUnique({
        where: { id },
        include: includeRelations,
    });
}

/**
 * Insert a new organization into the database.
 * 
 * @param data The data for the new organization.
 * @returns A promise that resolves to the created organization.
 */
export async function createOrganization(data: Prisma.OrganizationCreateInput): Promise<Organization> {
    return prisma.organization.create({ data });
}

/**
 * Update an existing organization in the database.
 * 
 * @param id The ID of the organization to update.
 * @param data The updated data for the organization.
 * @returns A promise that resolves to the updated organization.
 */
export async function updateOrganization(id: number, data: Prisma.OrganizationUpdateInput): Promise<Organization> {
    return prisma.organization.update({
        where: { id },
        data,
    });
}

/**
 * Delete an organization from the database by its ID.
 * 
 * @param id The ID of the organization to delete.
 * @returns A promise that resolves to the deleted organization.
 */
export async function deleteOrganizationById(id: number): Promise<Organization> {
    return prisma.organization.delete({
        where: { id },
    });
}