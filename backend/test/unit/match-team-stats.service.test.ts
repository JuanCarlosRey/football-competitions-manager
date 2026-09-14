import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import type { Match, MatchTeamStats } from '@prisma/client';
import type { CreateMatchTeamStatsDTO } from '../../src/schemas/match-team-stats.schema.js';

const mockPrisma = {
    match: {
        findUnique: jest.fn(),
    },
    matchTeamStats: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
};

jest.unstable_mockModule('../../src/config/prisma.js', () => ({
    prisma: mockPrisma,
}));

const {
    getStatsByMatch,
    addTeamStats,
    updateTeamStats,
    removeTeamStats,
} = await import('../../src/services/match-team-stats.service.js');

describe('Match Team Stats Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const expectedInclude = {
        match: true,
        team: true,
    };

    const mockMatch: Match = {
        id: 1,
        dateTime: new Date('2026-09-01T20:00:00.000Z'),
        status: 'SCHEDULED',
        seasonId: 1,
        stadiumId: 1,
        homeTeamId: 10,
        awayTeamId: 20,
    };

    const mockStatsItem: MatchTeamStats = {
        id: 1,
        matchId: 1,
        teamId: 10,
        possession: 55,
        shots: 12,
        shotsOnTarget: 5,
        fouls: 10,
        offsides: 2,
        corners: 6,
        freeKicks: 12,
        passes: 500,
        completedPasses: 430,
        crosses: 15,
        interceptions: 8,
        tackles: 14,
        saves: 3,
        yellowCards: 2,
        redCards: 0,
    };

    const mockStatsWithRelations = {
        ...mockStatsItem,
        match: mockMatch,
        team: { id: 10, name: 'Real Madrid' },
    };

    describe('getStatsByMatch', () => {
        it('should return all team stats for a specific match including relations', async () => {
            mockPrisma.matchTeamStats.findMany.mockResolvedValue([
                mockStatsWithRelations,
            ] as never);
            const result = await getStatsByMatch(1);
            expect(mockPrisma.matchTeamStats.findMany).toHaveBeenCalledWith({
                where: { matchId: 1 },
                include: expectedInclude,
            });
            expect(result).toEqual([mockStatsWithRelations]);
        });

        it('should return an empty array if no team stats exist for the match', async () => {
            mockPrisma.matchTeamStats.findMany.mockResolvedValue([] as never);
            const result = await getStatsByMatch(999);
            expect(mockPrisma.matchTeamStats.findMany).toHaveBeenCalledWith({
                where: { matchId: 999 },
                include: expectedInclude,
            });
            expect(result).toEqual([]);
        });
    });

    describe('addTeamStats', () => {
        const createDTO: CreateMatchTeamStatsDTO = {
            teamId: 10,
            possession: 55,
            shots: 12,
            shotsOnTarget: 5,
            fouls: 10,
            offsides: 2,
            corners: 6,
            freeKicks: 12,
            passes: 500,
            completedPasses: 430,
            crosses: 15,
            interceptions: 8,
            tackles: 14,
            saves: 3,
            yellowCards: 2,
            redCards: 0,
        };

        it('should create match team stats entry successfully and return the created record', async () => {
            mockPrisma.match.findUnique.mockResolvedValue(mockMatch as never);
            mockPrisma.matchTeamStats.findUnique.mockResolvedValue(null as never);
            mockPrisma.matchTeamStats.create.mockResolvedValue(mockStatsWithRelations as never);
            const result = await addTeamStats(1, createDTO);
            expect(mockPrisma.match.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(mockPrisma.matchTeamStats.findUnique).toHaveBeenCalledWith({
                where: { matchId_teamId: { matchId: 1, teamId: 10 } },
                include: expectedInclude,
            });
            expect(mockPrisma.matchTeamStats.create).toHaveBeenCalledWith({
                data: {
                    matchId: 1,
                    ...createDTO,
                },
                include: expectedInclude,
            });
            expect(result).toEqual(mockStatsWithRelations);
        });

        it('should throw an error if the match does not exist', async () => {
            mockPrisma.match.findUnique.mockResolvedValue(null as never);
            await expect(addTeamStats(999, createDTO)).rejects.toThrow(
                'Match with ID 999 does not exist'
            );
            expect(mockPrisma.matchTeamStats.create).not.toHaveBeenCalled();
        });

        it('should throw an error if the team does not play in the match', async () => {
            mockPrisma.match.findUnique.mockResolvedValue(mockMatch as never);
            const invalidTeamDTO: CreateMatchTeamStatsDTO = {
                ...createDTO,
                teamId: 99,
            };
            await expect(addTeamStats(1, invalidTeamDTO)).rejects.toThrow(
                'Team with ID 99 does not play in match 1'
            );
            expect(mockPrisma.matchTeamStats.create).not.toHaveBeenCalled();
        });

        it('should throw an error if stats for the team are already registered for the match', async () => {
            mockPrisma.match.findUnique.mockResolvedValue(mockMatch as never);
            mockPrisma.matchTeamStats.findUnique.mockResolvedValue(mockStatsWithRelations as never);
            await expect(addTeamStats(1, createDTO)).rejects.toThrow(
                'Stats for team with ID 10 are already registered for match 1'
            );
            expect(mockPrisma.matchTeamStats.create).not.toHaveBeenCalled();
        });
    });

    describe('updateTeamStats', () => {
        const updateDTO: Partial<CreateMatchTeamStatsDTO> = {
            possession: 60,
            shots: 15,
        };

        it('should update team stats entry successfully when it belongs to the specified match', async () => {
            const updatedStats = {
                ...mockStatsWithRelations,
                possession: 60,
                shots: 15,
            };
            mockPrisma.matchTeamStats.findUnique.mockResolvedValue(mockStatsItem as never);
            mockPrisma.matchTeamStats.update.mockResolvedValue(updatedStats as never);
            const result = await updateTeamStats(1, 1, updateDTO);
            expect(mockPrisma.matchTeamStats.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: expectedInclude,
            });
            expect(mockPrisma.matchTeamStats.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: updateDTO,
                include: expectedInclude,
            });
            expect(result).toEqual(updatedStats);
        });

        it('should throw an error if the stats entry is not found', async () => {
            mockPrisma.matchTeamStats.findUnique.mockResolvedValue(null as never);
            await expect(updateTeamStats(1, 999, updateDTO)).rejects.toThrow(
                'Stats entry with ID 999 was not found for match 1'
            );
            expect(mockPrisma.matchTeamStats.update).not.toHaveBeenCalled();
        });

        it('should throw an error if the stats entry belongs to a different match', async () => {
            const mismatchStats: MatchTeamStats = {
                ...mockStatsItem,
                matchId: 2,
            };
            mockPrisma.matchTeamStats.findUnique.mockResolvedValue(mismatchStats as never);
            await expect(updateTeamStats(1, 1, updateDTO)).rejects.toThrow(
                'Stats entry with ID 1 was not found for match 1'
            );
            expect(mockPrisma.matchTeamStats.update).not.toHaveBeenCalled();
        });
    });

    describe('removeTeamStats', () => {
        it('should remove team stats entry successfully when it belongs to the specified match', async () => {
            mockPrisma.matchTeamStats.findUnique.mockResolvedValue(mockStatsItem as never);
            mockPrisma.matchTeamStats.delete.mockResolvedValue(mockStatsItem as never);
            const result = await removeTeamStats(1, 1);
            expect(mockPrisma.matchTeamStats.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: expectedInclude,
            });
            expect(mockPrisma.matchTeamStats.delete).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(result).toEqual(mockStatsItem);
        });

        it('should throw an error if the stats entry to delete is not found', async () => {
            mockPrisma.matchTeamStats.findUnique.mockResolvedValue(null as never);
            await expect(removeTeamStats(1, 999)).rejects.toThrow(
                'Stats entry with ID 999 was not found for match 1'
            );
            expect(mockPrisma.matchTeamStats.delete).not.toHaveBeenCalled();
        });

        it('should throw an error if the stats entry to delete belongs to a different match', async () => {
            const mismatchStats: MatchTeamStats = {
                ...mockStatsItem,
                matchId: 2,
            };
            mockPrisma.matchTeamStats.findUnique.mockResolvedValue(mismatchStats as never);
            await expect(removeTeamStats(1, 1)).rejects.toThrow(
                'Stats entry with ID 1 was not found for match 1'
            );
            expect(mockPrisma.matchTeamStats.delete).not.toHaveBeenCalled();
        });
    });
});