import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import type { Season, Prisma } from '@prisma/client';

const mockPrisma = {
    season: {
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
    deleteSeason,
} = await import('../../src/services/season.service.js');

describe('Season Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockStartDate = new Date('2025-09-01T00:00:00.000Z');
    const mockEndDate = new Date('2026-06-01T00:00:00.000Z');

    const mockSeason = {
        id: 1,
        startDate: mockStartDate,
        endDate: mockEndDate,
        competitionId: 10,
    } as Season;

    const mockSeasonWithRelations = {
        ...mockSeason,
        competition: { id: 10, name: 'Champions League', organizationId: 1 },
        matches: [],
    };

    describe('getAll', () => {
        it('should return all seasons including competition and matches relations', async () => {
            mockPrisma.season.findMany.mockResolvedValue([
                mockSeasonWithRelations,
            ] as never);
            const result = await getAll();
            expect(mockPrisma.season.findMany).toHaveBeenCalledWith({
                include: {
                    competition: true,
                    matches: true,
                },
            });
            expect(result).toEqual([mockSeasonWithRelations]);
        });

        it('should return an empty array if no seasons exist', async () => {
            mockPrisma.season.findMany.mockResolvedValue([] as never);
            const result = await getAll();
            expect(result).toEqual([]);
        });
    });

    describe('getById', () => {
        it('should return a season by id including competition and matches', async () => {
            mockPrisma.season.findUnique.mockResolvedValue(
                mockSeasonWithRelations as never
            );
            const result = await getById(1);
            expect(mockPrisma.season.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: {
                    competition: true,
                    matches: true,
                },
            });
            expect(result).toEqual(mockSeasonWithRelations);
        });

        it('should return null if season does not exist', async () => {
            mockPrisma.season.findUnique.mockResolvedValue(null as never);
            const result = await getById(999);
            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        it('should create a season with competition relationship', async () => {
            const createData: Prisma.SeasonCreateInput = {
                startDate: mockStartDate,
                endDate: mockEndDate,
                competition: {
                    connect: { id: 10 },
                },
            };
            mockPrisma.season.create.mockResolvedValue({
                ...mockSeason,
                competition: { id: 10, name: 'Champions League', organizationId: 1 },
            } as never);
            const result = await create(createData);
            expect(mockPrisma.season.create).toHaveBeenCalledWith({
                data: createData,
                include: {
                    competition: true,
                },
            });
            expect(result).toEqual({
                ...mockSeason,
                competition: { id: 10, name: 'Champions League', organizationId: 1 },
            });
        });
    });

    describe('update', () => {
        it('should update a season and include competition relation', async () => {
            const newEndDate = new Date('2026-07-01T00:00:00.000Z');
            const updateData: Prisma.SeasonUpdateInput = {
                endDate: newEndDate,
            };
            const updatedSeason = {
                ...mockSeason,
                endDate: newEndDate,
                competition: { id: 10, name: 'Champions League', organizationId: 1 },
            };
            mockPrisma.season.update.mockResolvedValue(updatedSeason as never);
            const result = await update(1, updateData);
            expect(mockPrisma.season.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: updateData,
                include: {
                    competition: true,
                },
            });
            expect(result).toEqual(updatedSeason);
        });
    });

    describe('deleteSeason', () => {
        it('should delete a season by id', async () => {
            mockPrisma.season.delete.mockResolvedValue(mockSeason as never);
            const result = await deleteSeason(1);
            expect(mockPrisma.season.delete).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(result).toEqual(mockSeason);
        });
    });
});