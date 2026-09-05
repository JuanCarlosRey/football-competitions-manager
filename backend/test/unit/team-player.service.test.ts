import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import type { TeamPlayer } from '@prisma/client';
import type { CreateTeamPlayerDTO, UpdateTeamPlayerDTO } from '../../src/schemas/team-player.schema.js';

const mockPrisma = {
    teamPlayer: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
};

jest.unstable_mockModule('../../src/config/prisma.js', () => ({
    prisma: mockPrisma,
}));

const {
    getPlayersByTeam,
    addPlayerToTeam,
    updatePlayerDates,
    removePlayerFromTeam,
    getPlayerCareer,
} = await import('../../src/services/team-player.service.js');

describe('TeamPlayer Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockStartDate = new Date('2023-01-01');
    const mockEndDate = new Date('2024-01-01');

    const mockTeamPlayer: TeamPlayer = {
        id: 1,
        teamId: 10,
        playerId: 100,
        startDate: mockStartDate,
        endDate: null,
    };

    const mockTeamPlayerWithRelations = {
        ...mockTeamPlayer,
        team: { id: 10, name: 'Real Madrid' },
        player: { id: 100, firstName: 'Luka', lastName: 'Modric' },
    };

    describe('getPlayersByTeam', () => {
        it('should return all players assigned to a team', async () => {
            mockPrisma.teamPlayer.findMany.mockResolvedValue([
                mockTeamPlayerWithRelations,
            ] as never);
            const result = await getPlayersByTeam(10);
            expect(mockPrisma.teamPlayer.findMany).toHaveBeenCalledWith({
                where: { teamId: 10 },
                include: { team: true, player: true },
            });
            expect(result).toEqual([mockTeamPlayerWithRelations]);
        });

        it('should return an empty array if team has no players', async () => {
            mockPrisma.teamPlayer.findMany.mockResolvedValue([] as never);
            const result = await getPlayersByTeam(10);
            expect(result).toEqual([]);
        });
    });

    describe('addPlayerToTeam', () => {
        it('should add a player to a team when there is no active relation', async () => {
            const createData: CreateTeamPlayerDTO = {
                playerId: 100,
                startDate: mockStartDate,
                endDate: mockEndDate,
            };
            mockPrisma.teamPlayer.findFirst.mockResolvedValue(null as never);
            mockPrisma.teamPlayer.create.mockResolvedValue(mockTeamPlayerWithRelations as never);
            const result = await addPlayerToTeam(10, createData);
            expect(mockPrisma.teamPlayer.findFirst).toHaveBeenCalledWith({
                where: { teamId: 10, playerId: 100, endDate: null },
                include: { team: true, player: true },
            });
            expect(mockPrisma.teamPlayer.create).toHaveBeenCalledWith({
                data: {
                    teamId: 10,
                    playerId: 100,
                    startDate: mockStartDate,
                    endDate: mockEndDate,
                },
                include: { team: true, player: true },
            });
            expect(result).toEqual(mockTeamPlayerWithRelations);
        });

        it('should throw an error if the player is already active in the team', async () => {
            const createData: CreateTeamPlayerDTO = {
                playerId: 100,
                startDate: mockStartDate,
            };
            mockPrisma.teamPlayer.findFirst.mockResolvedValue(mockTeamPlayerWithRelations as never);
            await expect(addPlayerToTeam(10, createData)).rejects.toThrow(
                'The player is already active in this team'
            );
            expect(mockPrisma.teamPlayer.create).not.toHaveBeenCalled();
        });
    });

    describe('updatePlayerDates', () => {
        it('should update contract dates for an active team-player relation', async () => {
            const updateData: UpdateTeamPlayerDTO = {
                endDate: mockEndDate,
            };
            const updatedRecord = {
                ...mockTeamPlayerWithRelations,
                endDate: mockEndDate,
            };
            mockPrisma.teamPlayer.findFirst.mockResolvedValue(mockTeamPlayerWithRelations as never);
            mockPrisma.teamPlayer.update.mockResolvedValue(updatedRecord as never);
            const result = await updatePlayerDates(10, 100, updateData);
            expect(mockPrisma.teamPlayer.findFirst).toHaveBeenCalledWith({
                where: { teamId: 10, playerId: 100, endDate: null },
                include: { team: true, player: true },
            });
            expect(mockPrisma.teamPlayer.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: updateData,
                include: { team: true, player: true },
            });
            expect(result).toEqual(updatedRecord);
        });

        it('should throw an error if no active relation is found when updating', async () => {
            const updateData: UpdateTeamPlayerDTO = {
                endDate: mockEndDate,
            };
            mockPrisma.teamPlayer.findFirst.mockResolvedValue(null as never);
            await expect(updatePlayerDates(10, 100, updateData)).rejects.toThrow(
                'No active relation found between this team and player'
            );
            expect(mockPrisma.teamPlayer.update).not.toHaveBeenCalled();
        });
    });

    describe('removePlayerFromTeam', () => {
        it('should remove an active player assignment from a team', async () => {
            mockPrisma.teamPlayer.findFirst.mockResolvedValue(mockTeamPlayerWithRelations as never);
            mockPrisma.teamPlayer.delete.mockResolvedValue(mockTeamPlayerWithRelations as never);
            const result = await removePlayerFromTeam(10, 100);
            expect(mockPrisma.teamPlayer.findFirst).toHaveBeenCalledWith({
                where: { teamId: 10, playerId: 100, endDate: null },
                include: { team: true, player: true },
            });
            expect(mockPrisma.teamPlayer.delete).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(result).toEqual(mockTeamPlayerWithRelations);
        });

        it('should throw an error if no active relation is found when removing', async () => {
            mockPrisma.teamPlayer.findFirst.mockResolvedValue(null as never);
            await expect(removePlayerFromTeam(10, 100)).rejects.toThrow(
                'No active relation found to remove'
            );
            expect(mockPrisma.teamPlayer.delete).not.toHaveBeenCalled();
        });
    });

    describe('getPlayerCareer', () => {
        it('should return formatted career history for a player', async () => {
            const mockCareerHistory = [
                {
                    id: 2,
                    teamId: 20,
                    playerId: 100,
                    startDate: new Date('2024-01-02'),
                    endDate: null,
                    team: { id: 20, name: 'Manchester City' },
                },
                {
                    id: 1,
                    teamId: 10,
                    playerId: 100,
                    startDate: new Date('2020-01-01'),
                    endDate: new Date('2024-01-01'),
                    team: { id: 10, name: 'Real Madrid' },
                },
            ];
            mockPrisma.teamPlayer.findMany.mockResolvedValue(mockCareerHistory as never);
            const result = await getPlayerCareer(100);
            expect(mockPrisma.teamPlayer.findMany).toHaveBeenCalledWith({
                where: { playerId: 100 },
                include: { team: true },
                orderBy: { startDate: 'desc' },
            });
            expect(result).toEqual([
                {
                    team: 'Manchester City',
                    startDate: new Date('2024-01-02'),
                    endDate: null,
                },
                {
                    team: 'Real Madrid',
                    startDate: new Date('2020-01-01'),
                    endDate: new Date('2024-01-01'),
                },
            ]);
        });

        it('should return an empty array if player has no career history', async () => {
            mockPrisma.teamPlayer.findMany.mockResolvedValue([] as never);
            const result = await getPlayerCareer(100);
            expect(result).toEqual([]);
        });
    });
});