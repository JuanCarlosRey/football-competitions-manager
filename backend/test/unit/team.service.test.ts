import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import type { Team, Match, Prisma } from '@prisma/client';

const mockPrisma = {
    team: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    match: {
        findMany: jest.fn(),
    },
};

jest.unstable_mockModule('../../src/config/prisma.js', () => ({
    prisma: mockPrisma,
}));

const {
    getAll,
    getById,
    getTeamMatches,
    create,
    update,
    deleteTeam,
} = await import('../../src/services/team.service.js');

describe('Team Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const expectedIncludeRelations = {
        stadium: true,
        homeMatches: true,
        awayMatches: true,
        players: {
            include: {
                player: true,
            },
        },
    };

    const mockTeam: Team = {
        id: 1,
        name: 'Real Madrid',
        abbreviation: 'RMA',
        crest: 'https://example.com/crests/rma.png',
        president: 'Florentino Pérez',
        stadiumId: 1,
    };

    const mockTeamWithRelations = {
        ...mockTeam,
        stadium: {
            id: 1,
            name: 'Santiago Bernabéu',
            capacity: 81044,
            address: 'Av. de Concha Espina 1',
        },
        players: [],
        homeMatches: [],
        awayMatches: [],
    };

    describe('getAll', () => {
        it('should return all teams including stadium, players, and matches relations', async () => {
            mockPrisma.team.findMany.mockResolvedValue([
                mockTeamWithRelations,
            ] as never);
            const result = await getAll();
            expect(mockPrisma.team.findMany).toHaveBeenCalledWith({
                include: expectedIncludeRelations,
            });
            expect(result).toEqual([mockTeamWithRelations]);
        });

        it('should return an empty array if no teams exist', async () => {
            mockPrisma.team.findMany.mockResolvedValue([] as never);
            const result = await getAll();
            expect(result).toEqual([]);
        });
    });

    describe('getById', () => {
        it('should return a team by id including all relations', async () => {
            mockPrisma.team.findUnique.mockResolvedValue(
                mockTeamWithRelations as never
            );
            const result = await getById(1);
            expect(mockPrisma.team.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: expectedIncludeRelations,
            });
            expect(result).toEqual(mockTeamWithRelations);
        });

        it('should return null if team does not exist', async () => {
            mockPrisma.team.findUnique.mockResolvedValue(null as never);
            const result = await getById(999);
            expect(result).toBeNull();
        });
    });

    describe('getTeamMatches', () => {
        it('should return all matches for a team if team exists', async () => {
            const mockMatches: Partial<Match>[] = [
                { id: 1, homeTeamId: 1, awayTeamId: 2 },
            ];

            mockPrisma.team.findUnique.mockResolvedValue(mockTeamWithRelations as never);
            mockPrisma.match.findMany.mockResolvedValue(mockMatches as never);

            const result = await getTeamMatches(1);

            expect(mockPrisma.team.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: expectedIncludeRelations,
            });
            expect(mockPrisma.match.findMany).toHaveBeenCalledWith({
                where: {
                    OR: [
                        { homeTeamId: 1 },
                        { awayTeamId: 1 },
                    ],
                },
                include: {
                    homeTeam: true,
                    awayTeam: true,
                    stadium: true,
                },
            });
            expect(result).toEqual(mockMatches);
        });

        it('should return null if the team does not exist', async () => {
            mockPrisma.team.findUnique.mockResolvedValue(null as never);

            const result = await getTeamMatches(999);

            expect(result).toBeNull();
            expect(mockPrisma.match.findMany).not.toHaveBeenCalled();
        });
    });

    describe('create', () => {
        it('should create a team with stadiumId', async () => {
            const createData: Prisma.TeamCreateInput = {
                name: 'Real Madrid',
                abbreviation: 'RMA',
                crest: 'https://example.com/crests/rma.png',
                president: 'Florentino Pérez',
                stadium: { connect: { id: 1 } },
            };
            mockPrisma.team.create.mockResolvedValue(mockTeamWithRelations as never);
            const result = await create(createData);
            expect(mockPrisma.team.create).toHaveBeenCalledWith({
                data: createData,
                include: expectedIncludeRelations,
            });
            expect(result).toEqual(mockTeamWithRelations);
        });
    });

    describe('update', () => {
        it('should update a team', async () => {
            const updateData: Prisma.TeamUpdateInput = {
                president: 'New President',
            };
            const updatedTeam = {
                ...mockTeamWithRelations,
                president: 'New President',
            };
            mockPrisma.team.update.mockResolvedValue(updatedTeam as never);
            const result = await update(1, updateData);
            expect(mockPrisma.team.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: updateData,
                include: expectedIncludeRelations,
            });
            expect(result).toEqual(updatedTeam);
        });
    });

    describe('deleteTeam', () => {
        it('should delete a team by id', async () => {
            mockPrisma.team.delete.mockResolvedValue(mockTeam as never);
            const result = await deleteTeam(1);
            expect(mockPrisma.team.delete).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(result).toEqual(mockTeam);
        });
    });
});