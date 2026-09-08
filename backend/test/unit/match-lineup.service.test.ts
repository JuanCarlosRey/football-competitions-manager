import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import type { Match, MatchLineup, TeamPlayer } from '@prisma/client';
import type { CreateMatchLineupDTO, UpdateMatchLineupItemDTO } from '../../src/schemas/match-lineup.schema.js';

const mockPrisma = {
    match: {
        findUnique: jest.fn(),
    },
    matchLineup: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        createMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
    teamPlayer: {
        findMany: jest.fn(),
    },
};

jest.unstable_mockModule('../../src/config/prisma.js', () => ({
    prisma: mockPrisma,
}));

const {
    getLineupsByMatch,
    addTeamLineup,
    updateLineupEntry,
    removeLineupEntry,
} = await import('../../src/services/match-lineup.service.js');

describe('Match Lineup Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const expectedInclude = {
        match: true,
        team: true,
        player: true,
    };

    const mockMatchDate = new Date('2026-09-01T20:00:00.000Z');

    const mockMatch: Match = {
        id: 1,
        dateTime: mockMatchDate,
        status: 'SCHEDULED',
        seasonId: 1,
        stadiumId: 1,
        homeTeamId: 10,
        awayTeamId: 20,
    };

    const mockLineupItem: MatchLineup = {
        id: 1,
        matchId: 1,
        teamId: 10,
        playerId: 100,
        starter: true,
        shirtNumber: 10,
        position: 'MIDFIELDER',
    };

    const mockLineupWithRelations = {
        ...mockLineupItem,
        match: mockMatch,
        team: { id: 10, name: 'Real Madrid' },
        player: { id: 100, name: 'Luka Modric' },
    };

    describe('getLineupsByMatch', () => {
        it('should return all lineups for a specific match including relations', async () => {
            mockPrisma.matchLineup.findMany.mockResolvedValue([
                mockLineupWithRelations,
            ] as never);
            const result = await getLineupsByMatch(1);
            expect(mockPrisma.matchLineup.findMany).toHaveBeenCalledWith({
                where: { matchId: 1 },
                include: expectedInclude,
            });
            expect(result).toEqual([mockLineupWithRelations]);
        });

        it('should return an empty array if no lineups exist for the match', async () => {
            mockPrisma.matchLineup.findMany.mockResolvedValue([] as never);
            const result = await getLineupsByMatch(999);
            expect(mockPrisma.matchLineup.findMany).toHaveBeenCalledWith({
                where: { matchId: 999 },
                include: expectedInclude,
            });
            expect(result).toEqual([]);
        });
    });

    describe('addTeamLineup', () => {
        const createDTO: CreateMatchLineupDTO = {
            teamId: 10,
            players: [
                { playerId: 100, starter: true, shirtNumber: 10, position: 'MIDFIELDER' },
            ],
        };

        const mockContract: TeamPlayer = {
            id: 1,
            teamId: 10,
            playerId: 100,
            startDate: new Date('2025-01-01'),
            endDate: null,
        };

        it('should create team lineup entries successfully and return the updated match lineups', async () => {
            mockPrisma.match.findUnique.mockResolvedValue(mockMatch as never);
            mockPrisma.matchLineup.findUnique.mockResolvedValue(null as never);
            mockPrisma.teamPlayer.findMany.mockResolvedValue([mockContract] as never);
            mockPrisma.matchLineup.createMany.mockResolvedValue({ count: 1 } as never);
            mockPrisma.matchLineup.findMany.mockResolvedValue([mockLineupWithRelations] as never);
            const result = await addTeamLineup(1, createDTO);
            expect(mockPrisma.match.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(mockPrisma.matchLineup.findUnique).toHaveBeenCalledWith({
                where: { matchId_playerId: { matchId: 1, playerId: 100 } },
                include: expectedInclude,
            });
            expect(mockPrisma.teamPlayer.findMany).toHaveBeenCalledWith({
                where: {
                    teamId: 10,
                    playerId: { in: [100] },
                    startDate: { lte: mockMatchDate },
                    OR: [
                        { endDate: null },
                        { endDate: { gte: mockMatchDate } },
                    ],
                },
            });
            expect(mockPrisma.matchLineup.createMany).toHaveBeenCalledWith({
                data: [
                    {
                        matchId: 1,
                        teamId: 10,
                        playerId: 100,
                        starter: true,
                        shirtNumber: 10,
                        position: 'MIDFIELDER',
                    },
                ],
            });
            expect(result).toEqual([mockLineupWithRelations]);
        });

        it('should throw an error if the match does not exist', async () => {
            mockPrisma.match.findUnique.mockResolvedValue(null as never);
            await expect(addTeamLineup(999, createDTO)).rejects.toThrow(
                'Match with ID 999 does not exist'
            );
            expect(mockPrisma.matchLineup.createMany).not.toHaveBeenCalled();
        });

        it('should throw an error if the team does not belong to the match', async () => {
            mockPrisma.match.findUnique.mockResolvedValue(mockMatch as never);
            const invalidTeamDTO: CreateMatchLineupDTO = {
                ...createDTO,
                teamId: 99,
            };
            await expect(addTeamLineup(1, invalidTeamDTO)).rejects.toThrow(
                'Team with ID 99 does not play in match 1'
            );
            expect(mockPrisma.matchLineup.createMany).not.toHaveBeenCalled();
        });

        it('should throw an error if a player is already registered in the lineup', async () => {
            mockPrisma.match.findUnique.mockResolvedValue(mockMatch as never);
            mockPrisma.matchLineup.findUnique.mockResolvedValue(mockLineupWithRelations as never);
            await expect(addTeamLineup(1, createDTO)).rejects.toThrow(
                'Player with ID 100 is already registered in the lineup for match 1'
            );
            expect(mockPrisma.matchLineup.createMany).not.toHaveBeenCalled();
        });

        it('should throw an error if a player was not an active team member on match date', async () => {
            mockPrisma.match.findUnique.mockResolvedValue(mockMatch as never);
            mockPrisma.matchLineup.findUnique.mockResolvedValue(null as never);
            mockPrisma.teamPlayer.findMany.mockResolvedValue([] as never); // No valid contract found
            await expect(addTeamLineup(1, createDTO)).rejects.toThrow(
                `Players [100] were not active members of team 10 on match date (${mockMatchDate.toISOString()})`
            );
            expect(mockPrisma.matchLineup.createMany).not.toHaveBeenCalled();
        });
    });

    describe('updateLineupEntry', () => {
        const updateDTO: UpdateMatchLineupItemDTO = {
            starter: false,
            shirtNumber: 14,
        };

        it('should update a lineup entry successfully when it belongs to the specified match', async () => {
            const updatedLineup = {
                ...mockLineupWithRelations,
                starter: false,
                shirtNumber: 14,
            };
            mockPrisma.matchLineup.findUnique.mockResolvedValue(mockLineupItem as never);
            mockPrisma.matchLineup.update.mockResolvedValue(updatedLineup as never);
            const result = await updateLineupEntry(1, 1, updateDTO);
            expect(mockPrisma.matchLineup.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: expectedInclude,
            });
            expect(mockPrisma.matchLineup.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: updateDTO,
                include: expectedInclude,
            });
            expect(result).toEqual(updatedLineup);
        });

        it('should throw an error if the lineup entry is not found', async () => {
            mockPrisma.matchLineup.findUnique.mockResolvedValue(null as never);
            await expect(updateLineupEntry(1, 999, updateDTO)).rejects.toThrow(
                'Lineup entry with ID 999 was not found for match 1'
            );
            expect(mockPrisma.matchLineup.update).not.toHaveBeenCalled();
        });

        it('should throw an error if the lineup entry belongs to a different match', async () => {
            const mismatchLineup: MatchLineup = {
                ...mockLineupItem,
                matchId: 2,
            };
            mockPrisma.matchLineup.findUnique.mockResolvedValue(mismatchLineup as never);
            await expect(updateLineupEntry(1, 1, updateDTO)).rejects.toThrow(
                'Lineup entry with ID 1 was not found for match 1'
            );
            expect(mockPrisma.matchLineup.update).not.toHaveBeenCalled();
        });
    });

    describe('removeLineupEntry', () => {
        it('should remove a lineup entry successfully when it belongs to the specified match', async () => {
            mockPrisma.matchLineup.findUnique.mockResolvedValue(mockLineupItem as never);
            mockPrisma.matchLineup.delete.mockResolvedValue(mockLineupItem as never);
            const result = await removeLineupEntry(1, 1);
            expect(mockPrisma.matchLineup.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: expectedInclude,
            });
            expect(mockPrisma.matchLineup.delete).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(result).toEqual(mockLineupItem);
        });

        it('should throw an error if the lineup entry to delete is not found', async () => {
            mockPrisma.matchLineup.findUnique.mockResolvedValue(null as never);
            await expect(removeLineupEntry(1, 999)).rejects.toThrow(
                'Lineup entry with ID 999 was not found for match 1'
            );
            expect(mockPrisma.matchLineup.delete).not.toHaveBeenCalled();
        });

        it('should throw an error if the lineup entry to delete belongs to a different match', async () => {
            const mismatchLineup: MatchLineup = {
                ...mockLineupItem,
                matchId: 2,
            };
            mockPrisma.matchLineup.findUnique.mockResolvedValue(mismatchLineup as never);
            await expect(removeLineupEntry(1, 1)).rejects.toThrow(
                'Lineup entry with ID 1 was not found for match 1'
            );
            expect(mockPrisma.matchLineup.delete).not.toHaveBeenCalled();
        });
    });
});