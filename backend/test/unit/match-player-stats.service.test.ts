import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import type { Match, MatchPlayerStats, MatchLineup } from '@prisma/client';
import type {
    CreateMatchPlayerStatsDTO,
    UpdateMatchPlayerStatsDTO,
} from '../../src/schemas/match-player-stats.schema.js';

const mockPrisma = {
    match: {
        findUnique: jest.fn(),
    },
    matchLineup: {
        findUnique: jest.fn(),
    },
    matchPlayerStats: {
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
    addPlayerStats,
    updatePlayerStats,
    removePlayerStats,
} = await import('../../src/services/match-player-stats.service.js');

describe('Match Player Stats Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const expectedInclude = {
        match: true,
        player: true,
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

    const mockLineupEntry: MatchLineup = {
        id: 100,
        matchId: 1,
        teamId: 10,
        playerId: 7,
        starter: true,
        shirtNumber: 7,
        position: 'Forward',
    };

    const mockStatsItem: MatchPlayerStats = {
        id: 1,
        matchId: 1,
        playerId: 7,
        goals: 2,
        goalsConceded: 0,
        assists: 1,
        yellowCards: 0,
        redCards: 0,
        rating: 9.2,
    };

    const mockStatsWithRelations = {
        ...mockStatsItem,
        match: mockMatch,
        player: { id: 7, firstName: 'Vinicius', lastName: 'Jr' },
    };

    describe('getStatsByMatch', () => {
        it('should return all player stats for a specific match including relations', async () => {
            mockPrisma.matchPlayerStats.findMany.mockResolvedValue([
                mockStatsWithRelations,
            ] as never);
            const result = await getStatsByMatch(1);
            expect(mockPrisma.matchPlayerStats.findMany).toHaveBeenCalledWith({
                where: { matchId: 1 },
                include: expectedInclude,
            });
            expect(result).toEqual([mockStatsWithRelations]);
        });

        it('should return an empty array if no player stats exist for the match', async () => {
            mockPrisma.matchPlayerStats.findMany.mockResolvedValue([] as never);
            const result = await getStatsByMatch(999);
            expect(mockPrisma.matchPlayerStats.findMany).toHaveBeenCalledWith({
                where: { matchId: 999 },
                include: expectedInclude,
            });
            expect(result).toEqual([]);
        });
    });

    describe('addPlayerStats', () => {
        const createDTO: CreateMatchPlayerStatsDTO = {
            playerId: 7,
            goals: 2,
            goalsConceded: 0,
            assists: 1,
            yellowCards: 0,
            redCards: 0,
            rating: 9.2,
        };

        it('should create match player stats entry successfully and return the created record', async () => {
            mockPrisma.match.findUnique.mockResolvedValue(mockMatch as never);
            mockPrisma.matchLineup.findUnique.mockResolvedValue(mockLineupEntry as never);
            mockPrisma.matchPlayerStats.findUnique.mockResolvedValue(null as never);
            mockPrisma.matchPlayerStats.create.mockResolvedValue(mockStatsWithRelations as never);
            const result = await addPlayerStats(1, createDTO);
            expect(mockPrisma.match.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(mockPrisma.matchLineup.findUnique).toHaveBeenCalledWith({
                where: { matchId_playerId: { matchId: 1, playerId: 7 } },
            });
            expect(mockPrisma.matchPlayerStats.findUnique).toHaveBeenCalledWith({
                where: { matchId_playerId: { matchId: 1, playerId: 7 } },
                include: expectedInclude,
            });
            expect(mockPrisma.matchPlayerStats.create).toHaveBeenCalledWith({
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
            await expect(addPlayerStats(999, createDTO)).rejects.toThrow(
                'Match with ID 999 does not exist'
            );
            expect(mockPrisma.matchPlayerStats.create).not.toHaveBeenCalled();
        });

        it('should throw an error if the player is not in the match lineup', async () => {
            mockPrisma.match.findUnique.mockResolvedValue(mockMatch as never);
            mockPrisma.matchLineup.findUnique.mockResolvedValue(null as never);
            const invalidPlayerDTO: CreateMatchPlayerStatsDTO = {
                ...createDTO,
                playerId: 99,
            };
            await expect(addPlayerStats(1, invalidPlayerDTO)).rejects.toThrow(
                'Player with ID 99 is not part of the lineup for match 1'
            );
            expect(mockPrisma.matchPlayerStats.create).not.toHaveBeenCalled();
        });

        it('should throw an error if stats for the player are already registered for the match', async () => {
            mockPrisma.match.findUnique.mockResolvedValue(mockMatch as never);
            mockPrisma.matchLineup.findUnique.mockResolvedValue(mockLineupEntry as never);
            mockPrisma.matchPlayerStats.findUnique.mockResolvedValue(mockStatsWithRelations as never);
            await expect(addPlayerStats(1, createDTO)).rejects.toThrow(
                'Stats for player with ID 7 are already registered for match 1'
            );
            expect(mockPrisma.matchPlayerStats.create).not.toHaveBeenCalled();
        });
    });

    describe('updatePlayerStats', () => {
        const updateDTO: UpdateMatchPlayerStatsDTO = {
            goals: 3,
            rating: 9.8,
        };

        it('should update player stats entry successfully when it belongs to the specified match', async () => {
            const updatedStats = {
                ...mockStatsWithRelations,
                goals: 3,
                rating: 9.8,
            };
            mockPrisma.matchPlayerStats.findUnique.mockResolvedValue(mockStatsItem as never);
            mockPrisma.matchPlayerStats.update.mockResolvedValue(updatedStats as never);
            const result = await updatePlayerStats(1, 1, updateDTO);
            expect(mockPrisma.matchPlayerStats.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: expectedInclude,
            });
            expect(mockPrisma.matchPlayerStats.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: updateDTO,
                include: expectedInclude,
            });
            expect(result).toEqual(updatedStats);
        });

        it('should throw an error if the stats entry is not found', async () => {
            mockPrisma.matchPlayerStats.findUnique.mockResolvedValue(null as never);
            await expect(updatePlayerStats(1, 999, updateDTO)).rejects.toThrow(
                'Stats entry with ID 999 was not found for match 1'
            );
            expect(mockPrisma.matchPlayerStats.update).not.toHaveBeenCalled();
        });

        it('should throw an error if the stats entry belongs to a different match', async () => {
            const mismatchStats: MatchPlayerStats = {
                ...mockStatsItem,
                matchId: 2,
            };
            mockPrisma.matchPlayerStats.findUnique.mockResolvedValue(mismatchStats as never);
            await expect(updatePlayerStats(1, 1, updateDTO)).rejects.toThrow(
                'Stats entry with ID 1 was not found for match 1'
            );
            expect(mockPrisma.matchPlayerStats.update).not.toHaveBeenCalled();
        });
    });

    describe('removePlayerStats', () => {
        it('should remove player stats entry successfully when it belongs to the specified match', async () => {
            mockPrisma.matchPlayerStats.findUnique.mockResolvedValue(mockStatsItem as never);
            mockPrisma.matchPlayerStats.delete.mockResolvedValue(mockStatsItem as never);
            const result = await removePlayerStats(1, 1);
            expect(mockPrisma.matchPlayerStats.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: expectedInclude,
            });
            expect(mockPrisma.matchPlayerStats.delete).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(result).toEqual(mockStatsItem);
        });

        it('should throw an error if the stats entry to delete is not found', async () => {
            mockPrisma.matchPlayerStats.findUnique.mockResolvedValue(null as never);
            await expect(removePlayerStats(1, 999)).rejects.toThrow(
                'Stats entry with ID 999 was not found for match 1'
            );
            expect(mockPrisma.matchPlayerStats.delete).not.toHaveBeenCalled();
        });

        it('should throw an error if the stats entry to delete belongs to a different match', async () => {
            const mismatchStats: MatchPlayerStats = {
                ...mockStatsItem,
                matchId: 2,
            };
            mockPrisma.matchPlayerStats.findUnique.mockResolvedValue(mismatchStats as never);
            await expect(removePlayerStats(1, 1)).rejects.toThrow(
                'Stats entry with ID 1 was not found for match 1'
            );
            expect(mockPrisma.matchPlayerStats.delete).not.toHaveBeenCalled();
        });
    });
});