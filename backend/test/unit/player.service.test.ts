import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import type { Player, PreferredFoot } from '@prisma/client';
import { Prisma } from '@prisma/client';
import type { CreatePlayerDTO, UpdatePlayerDTO } from '../../src/schemas/player.schema.js';

const mockPrisma = {
    player: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
    },
};

const mockTeamPlayerService = {
    addPlayerToTeam: jest.fn(),
};

jest.unstable_mockModule('../../src/config/prisma.js', () => ({
    prisma: mockPrisma,
}));

jest.unstable_mockModule('../../src/services/team-player.service.js', () => mockTeamPlayerService);

const {
    getAll,
    getById,
    create,
    update,
    deletePlayer,
} = await import('../../src/services/player.service.js');

describe('Player Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockPlayer: Player = {
        id: 1,
        firstName: 'Lamine',
        lastName: 'Yamal',
        birthDate: new Date('2007-07-13'),
        position: 'RW',
        nationality: 'Spain',
        overall: 89,
        height: 1.80,
        weight: 68.0,
        preferredFoot: 'LEFT' as PreferredFoot,
        marketValue: new Prisma.Decimal(150000000),
        annualSalary: new Prisma.Decimal(15000000),
    };

    const mockPlayerWithTeam = {
        ...mockPlayer,
        teams: [
            {
                team: {
                    id: 5,
                    name: 'FC Barcelona',
                },
            },
        ],
    };

    describe('getAll', () => {
        it('should return all players with mapped current team info', async () => {
            mockPrisma.player.findMany.mockResolvedValue([mockPlayerWithTeam] as never);
            const result = await getAll();
            expect(mockPrisma.player.findMany).toHaveBeenCalledWith({
                include: {
                    teams: {
                        where: { endDate: null },
                        include: { team: true },
                    },
                },
            });
            expect(result).toEqual([
                {
                    ...mockPlayerWithTeam,
                    currentTeam: 'FC Barcelona',
                    currentTeamId: 5,
                },
            ]);
        });

        it('should return null for currentTeam when player has no active team', async () => {
            const playerWithoutTeam = { ...mockPlayer, teams: [] };
            mockPrisma.player.findMany.mockResolvedValue([playerWithoutTeam] as never);
            const result = await getAll();
            expect(result).toEqual([
                {
                    ...playerWithoutTeam,
                    currentTeam: null,
                    currentTeamId: null,
                },
            ]);
        });

        it('should return an empty array if no players exist', async () => {
            mockPrisma.player.findMany.mockResolvedValue([] as never);
            const result = await getAll();
            expect(result).toEqual([]);
        });
    });

    describe('getById', () => {
        it('should return a player by id', async () => {
            mockPrisma.player.findUnique.mockResolvedValue(mockPlayer as never);
            const result = await getById(1);
            expect(mockPrisma.player.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(result).toEqual(mockPlayer);
        });

        it('should return null if player does not exist', async () => {
            mockPrisma.player.findUnique.mockResolvedValue(null as never);
            const result = await getById(999);
            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        it('should create a player without team assignment if teamId is not provided', async () => {
            const createData: CreatePlayerDTO = {
                firstName: 'Lamine',
                lastName: 'Yamal',
                birthDate: new Date('2007-07-13'),
                position: 'RW',
                nationality: 'Spain',
                overall: 89,
                height: 1.80,
                weight: 68.0,
                preferredFoot: 'LEFT',
                marketValue: 150000000,
                annualSalary: 15000000,
            };
            mockPrisma.player.create.mockResolvedValue(mockPlayer as never);
            const result = await create(createData);
            expect(mockPrisma.player.create).toHaveBeenCalledWith({
                data: createData,
            });
            expect(mockTeamPlayerService.addPlayerToTeam).not.toHaveBeenCalled();
            expect(result).toEqual(mockPlayer);
        });

        it('should create a player and assign them to a team if teamId is provided', async () => {
            const createDataWithTeam: CreatePlayerDTO = {
                firstName: 'Kylian',
                lastName: 'Mbappé',
                birthDate: new Date('1998-12-20'),
                position: 'ST',
                nationality: 'France',
                overall: 91,
                height: 1.78,
                weight: 75.0,
                preferredFoot: 'RIGHT',
                marketValue: 180000000,
                annualSalary: 30000000,
                teamId: 7,
            };
            const { teamId, ...expectedPlayerData } = createDataWithTeam;
            mockPrisma.player.create.mockResolvedValue(mockPlayer as never);
            mockTeamPlayerService.addPlayerToTeam.mockResolvedValue({} as never);
            const result = await create(createDataWithTeam);
            expect(mockPrisma.player.create).toHaveBeenCalledWith({
                data: expectedPlayerData,
            });
            expect(mockTeamPlayerService.addPlayerToTeam).toHaveBeenCalledWith(teamId, {
                playerId: mockPlayer.id,
                startDate: expect.any(Date),
            });
            expect(result).toEqual(mockPlayer);
        });
    });

    describe('update', () => {
        it('should update player details', async () => {
            const updateData: UpdatePlayerDTO = {
                overall: 91,
                marketValue: 180000000,
            };
            const updatedPlayer = {
                ...mockPlayer,
                overall: 91,
                marketValue: new Prisma.Decimal(180000000),
            };
            mockPrisma.player.update.mockResolvedValue(updatedPlayer as never);
            const result = await update(1, updateData as unknown as Parameters<typeof update>[1]);
            expect(mockPrisma.player.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: updateData,
            });
            expect(result).toEqual(updatedPlayer);
        });

        it('should partially update only provided fields', async () => {
            const updateData: UpdatePlayerDTO = {
                position: 'LW',
            };
            mockPrisma.player.update.mockResolvedValue({
                ...mockPlayer,
                position: 'LW',
            } as never);
            await update(1, updateData as unknown as Parameters<typeof update>[1]);
            expect(mockPrisma.player.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: {
                    position: 'LW',
                },
            });
        });
    });

    describe('deletePlayer', () => {
        it('should delete a player by id', async () => {
            mockPrisma.player.delete.mockResolvedValue(mockPlayer as never);
            const result = await deletePlayer(1);
            expect(mockPrisma.player.delete).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(result).toEqual(mockPlayer);
        });
    });
});