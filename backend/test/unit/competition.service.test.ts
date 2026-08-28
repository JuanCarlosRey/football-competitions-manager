import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import type { Competition } from '@prisma/client';
import type { CreateCompetitionDTO, UpdateCompetitionDTO } from '../../src/schemas/competition.schema.js';

const mockPrisma = {
    competition: {
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
    deleteCompetition,
} = await import('../../src/services/competition.service.js');

describe('Competition Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockCompetition = {
        id: 1,
        name: 'Champions League',
        organizationId: 10,
    } as Competition;

    const mockCompetitionWithRelations = {
        ...mockCompetition,
        organization: { id: 10, name: 'UEFA' },
        seasons: [],
    };

    describe('getAll', () => {
        it('should return all competitions including their organization', async () => {
            mockPrisma.competition.findMany.mockResolvedValue([
                mockCompetitionWithRelations,
            ] as never);
            const result = await getAll();
            expect(mockPrisma.competition.findMany).toHaveBeenCalledWith({
                include: { 
                    organization: true,
                    seasons: true
                },
            });
            expect(result).toEqual([mockCompetitionWithRelations]);
        });

        it('should return an empty array if no competitions exist', async () => {
            mockPrisma.competition.findMany.mockResolvedValue([] as never);
            const result = await getAll();
            expect(result).toEqual([]);
        });
    });

    describe('getById', () => {
        it('should return a competition by id including organization and seasons', async () => {
            mockPrisma.competition.findUnique.mockResolvedValue(
                mockCompetitionWithRelations as never
            );
            const result = await getById(1);
            expect(mockPrisma.competition.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: {
                    organization: true,
                    seasons: true,
                },
            });
            expect(result).toEqual(mockCompetitionWithRelations);
        });

        it('should return null if competition does not exist', async () => {
            mockPrisma.competition.findUnique.mockResolvedValue(null as never);
            const result = await getById(999);
            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        it('should create a competition', async () => {
            const createData: CreateCompetitionDTO = {
                name: 'Champions League',
                organizationId: 10,
            };
            mockPrisma.competition.create.mockResolvedValue(mockCompetition as never);
            const result = await create(createData);
            expect(mockPrisma.competition.create).toHaveBeenCalledWith({
                data: {
                    name: createData.name,
                    organizationId: createData.organizationId,
                },
            });
            expect(result).toEqual(mockCompetition);
        });
    });

    describe('update', () => {
        it('should update a competition name and organizationId', async () => {
            const updateData: UpdateCompetitionDTO = {
                name: 'Super League',
                organizationId: 20,
            };
            const updatedCompetition = {
                ...mockCompetition,
                name: 'Super League',
                organizationId: 20,
            };
            mockPrisma.competition.update.mockResolvedValue(updatedCompetition as never);
            const result = await update(1, updateData);
            expect(mockPrisma.competition.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: {
                    name: 'Super League',
                    organizationId: 20,
                },
            });
            expect(result).toEqual(updatedCompetition);
        });

        it('should partially update only provided fields', async () => {
            const updateData: UpdateCompetitionDTO = {
                name: 'Only Name Update',
            };
            mockPrisma.competition.update.mockResolvedValue({
                ...mockCompetition,
                name: 'Only Name Update',
            } as never);
            await update(1, updateData);
            expect(mockPrisma.competition.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: {
                    name: 'Only Name Update',
                },
            });
        });
    });

    describe('deleteCompetition', () => {
        it('should delete a competition by id', async () => {
            mockPrisma.competition.delete.mockResolvedValue(mockCompetition as never);
            const result = await deleteCompetition(1);
            expect(mockPrisma.competition.delete).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(result).toEqual(mockCompetition);
        });
    });
});