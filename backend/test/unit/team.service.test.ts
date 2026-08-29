import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import type { Team, Prisma } from '@prisma/client';

const mockPrisma = {
    team: {
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
    deleteTeam,
} = await import('../../src/services/team.service.js');

describe('Team Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockTeam: Team = {
        id: 1,
        name: 'Real Madrid',
        abbreviation: 'RMA',
        crest: 'https://example.com/crests/rma.png',
        president: 'Florentino Pérez',
    };

    const mockTeamWithRelations = {
        ...mockTeam,
        homeMatches: [],
        awayMatches: [],
    };

    describe('getAll', () => {
        it('should return all teams including homeMatches and awayMatches relations', async () => {
            mockPrisma.team.findMany.mockResolvedValue([
                mockTeamWithRelations,
            ] as never);
            const result = await getAll();
            expect(mockPrisma.team.findMany).toHaveBeenCalledWith({
                include: {
                    homeMatches: true,
                    awayMatches: true,
                },
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
        it('should return a team by id including homeMatches and awayMatches', async () => {
            mockPrisma.team.findUnique.mockResolvedValue(
                mockTeamWithRelations as never
            );
            const result = await getById(1);
            expect(mockPrisma.team.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: {
                    homeMatches: true,
                    awayMatches: true,
                },
            });
            expect(result).toEqual(mockTeamWithRelations);
        });
        it('should return null if team does not exist', async () => {
            mockPrisma.team.findUnique.mockResolvedValue(null as never);
            const result = await getById(999);
            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        it('should create a team', async () => {
            const createData: Prisma.TeamCreateInput = {
                name: 'Real Madrid',
                abbreviation: 'RMA',
                crest: 'https://example.com/crests/rma.png',
                president: 'Florentino Pérez',
            };
            mockPrisma.team.create.mockResolvedValue(mockTeam as never);
            const result = await create(createData);
            expect(mockPrisma.team.create).toHaveBeenCalledWith({
                data: createData,
            });
            expect(result).toEqual(mockTeam);
        });
    });

    describe('update', () => {
        it('should update a team', async () => {
            const updateData: Prisma.TeamUpdateInput = {
                president: 'New President',
            };
            const updatedTeam = {
                ...mockTeam,
                president: 'New President',
            };
            mockPrisma.team.update.mockResolvedValue(updatedTeam as never);
            const result = await update(1, updateData);
            expect(mockPrisma.team.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: updateData,
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