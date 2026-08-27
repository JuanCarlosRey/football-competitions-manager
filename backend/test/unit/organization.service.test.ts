import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import type { Organization, Prisma } from '@prisma/client';

const mockPrisma = {
  organization: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

jest.unstable_mockModule('../../src/config/prisma.js', () => ({
  prisma: mockPrisma,
}));

const {
  getAll,
  getById,
  create,
  update,
  deleteOrganization,
} = await import('../../src/services/organization.service.js');

describe('Organization Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    const mockOrganization = {
        id: 1,
        name: 'Test Org',
        createdAt: new Date(),
        updatedAt: new Date(),
    } as Organization;
    const mockOrganizationWithCompetitions = {
        ...mockOrganization,
        competitions: [],
    };

    describe('getAll', () => {
        it('should return all organizations with their competitions', async () => {
            mockPrisma.organization.findMany.mockResolvedValue([
                mockOrganizationWithCompetitions,
            ] as never);
            const result = await getAll();
            expect(mockPrisma.organization.findMany).toHaveBeenCalledWith({
                include: { competitions: true },
            });
            expect(result).toEqual([mockOrganizationWithCompetitions]);
        });

        it('should return an empty array if there are no organizations', async () => {
            mockPrisma.organization.findMany.mockResolvedValue([] as never);
            const result = await getAll();
            expect(result).toEqual([]);
        });
    });

    describe('getById', () => {
        it('should return an organization by id', async () => {
            mockPrisma.organization.findUnique.mockResolvedValue(
                mockOrganizationWithCompetitions as never
            );
            const result = await getById(1);
            expect(mockPrisma.organization.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: { competitions: true },
            });
            expect(result).toEqual(mockOrganizationWithCompetitions);
        });

        it('should return null if organization does not exist', async () => {
            mockPrisma.organization.findUnique.mockResolvedValue(null as never);
            const result = await getById(999);
            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        it('should create an organization', async () => {
            const createData = {
                name: 'Nueva Org',
            } as Prisma.OrganizationCreateInput;
            mockPrisma.organization.create.mockResolvedValue({
                ...mockOrganization,
                name: 'Nueva Org',
            } as never);
            const result = await create(createData);
            expect(mockPrisma.organization.create).toHaveBeenCalledWith({
                data: createData,
            });
            expect(result.name).toBe('Nueva Org');
        });
    });

    describe('update', () => {
        it('should update an organization', async () => {
            const updateData = {
                name: 'Org Actualizada',
            } as Prisma.OrganizationUpdateInput;
            mockPrisma.organization.update.mockResolvedValue({
                ...mockOrganization,
                name: 'Org Actualizada',
            } as never);
            const result = await update(1, updateData);
            expect(mockPrisma.organization.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: updateData,
            });
            expect(result.name).toBe('Org Actualizada');
        });
    });

    describe('deleteOrganization', () => {
        it('should delete an organization', async () => {
            mockPrisma.organization.delete.mockResolvedValue(mockOrganization as never);
            const result = await deleteOrganization(1);
            expect(mockPrisma.organization.delete).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(result).toEqual(mockOrganization);
        });
    });
});