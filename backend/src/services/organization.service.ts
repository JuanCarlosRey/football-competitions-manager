import { type Organization, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';

/**
 * Retrieve all organizations from the database, including their associated competitions.
 * 
 * @returns A promise that resolves to an array of organizations, including their associated competitions.
 */
export async function getAll(): Promise<Organization[]> {
    return prisma.organization.findMany({
        include: { competitions: true },
    });
}

/**
 * Retrieve an organization by its ID from the database, including its associated competitions.
 * 
 * @param id The ID of the organization to retrieve.
 * @returns A promise that resolves to the organization, including its associated competitions.
 */
export async function getById(id: number): Promise<Organization | null> {
    return prisma.organization.findUnique({
        where: { id },
        include: { competitions: true },
    });
}

/**
 * Create a new organization in the database.
 * 
 * @param data The data for the new organization.
 * @returns A promise that resolves to the created organization.
 */
export async function create(data: Prisma.OrganizationCreateInput): Promise<Organization> {
    return prisma.organization.create({ data });
}

/**
 * Update an organization in the database.
 * 
 * @param id The ID of the organization to update.
 * @param data The updated data for the organization.
 * @returns A promise that resolves to the updated organization.
 */
export async function update(id: number, data: Prisma.OrganizationUpdateInput): Promise<Organization> {
    return prisma.organization.update({
        where: { id },
        data,
    });
}

/**
 * Delete an organization from the database.
 * 
 * @param id The ID of the organization to delete.
 * @returns A promise that resolves to the deleted organization.
 */
export async function deleteOrganization(id: number): Promise<Organization> {
    return prisma.organization.delete({
        where: { id },
    });
}