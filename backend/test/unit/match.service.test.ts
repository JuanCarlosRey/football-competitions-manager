import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import type { Match, MatchStatus, Prisma } from '@prisma/client';

const mockPrisma = {
    match: {
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
    deleteMatch,
} = await import('../../src/services/match.service.js');

describe('Match Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const expectedInclude = {
        season: true,
        stadium: true,
        homeTeam: true,
        awayTeam: true,
    };

    const mockMatch: Match = {
        id: 1,
        dateTime: new Date('2026-09-01T20:00:00Z'),
        status: 'SCHEDULED' as MatchStatus,
        seasonId: 1,
        stadiumId: 1,
        homeTeamId: 1,
        awayTeamId: 2,
    };

    const mockMatchWithRelations = {
        ...mockMatch,
        season: { id: 1, year: '2026' },
        stadium: { id: 1, name: 'Santiago Bernabéu' },
        homeTeam: { id: 1, name: 'Real Madrid' },
        awayTeam: { id: 2, name: 'FC Barcelona' },
    };

    describe('getAll', () => {
        it('should return all matches including relations', async () => {
            mockPrisma.match.findMany.mockResolvedValue([
                mockMatchWithRelations,
            ] as never);
            const result = await getAll();
            expect(mockPrisma.match.findMany).toHaveBeenCalledWith({
                include: expectedInclude,
            });
            expect(result).toEqual([mockMatchWithRelations]);
        });

        it('should return an empty array if no matches exist', async () => {
            mockPrisma.match.findMany.mockResolvedValue([] as never);
            const result = await getAll();
            expect(result).toEqual([]);
        });
    });

    describe('getById', () => {
        it('should return a match by id including relations', async () => {
            mockPrisma.match.findUnique.mockResolvedValue(
                mockMatchWithRelations as never
            );
            const result = await getById(1);
            expect(mockPrisma.match.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: expectedInclude,
            });
            expect(result).toEqual(mockMatchWithRelations);
        });

        it('should return null if match does not exist', async () => {
            mockPrisma.match.findUnique.mockResolvedValue(null as never);
            const result = await getById(999);
            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        it('should create a match and return it with relations', async () => {
            const createData: Prisma.MatchUncheckedCreateInput = {
                dateTime: new Date('2026-09-01T20:00:00Z'),
                status: 'SCHEDULED',
                seasonId: 1,
                stadiumId: 1,
                homeTeamId: 1,
                awayTeamId: 2,
            };
            mockPrisma.match.create.mockResolvedValue(mockMatchWithRelations as never);
            const result = await create(createData);
            expect(mockPrisma.match.create).toHaveBeenCalledWith({
                data: createData,
                include: expectedInclude,
            });
            expect(result).toEqual(mockMatchWithRelations);
        });
    });

    describe('update', () => {
        it('should update a match and return it with relations', async () => {
            const updateData: Prisma.MatchUncheckedUpdateInput = {
                status: 'LIVE',
            };
            const updatedMatch = {
                ...mockMatchWithRelations,
                status: 'LIVE' as MatchStatus,
            };
            mockPrisma.match.update.mockResolvedValue(updatedMatch as never);
            const result = await update(1, updateData);
            expect(mockPrisma.match.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: updateData,
                include: expectedInclude,
            });
            expect(result).toEqual(updatedMatch);
        });
    });

    describe('deleteMatch', () => {
        it('should delete a match by id', async () => {
            mockPrisma.match.delete.mockResolvedValue(mockMatch as never);
            const result = await deleteMatch(1);
            expect(mockPrisma.match.delete).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(result).toEqual(mockMatch);
        });
    });
});