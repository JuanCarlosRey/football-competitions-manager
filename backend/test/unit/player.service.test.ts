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

jest.unstable_mockModule('../../src/config/prisma.js', () => ({
    prisma: mockPrisma,
}));

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

    describe('getAll', () => {
        it('should return all players', async () => {
            mockPrisma.player.findMany.mockResolvedValue([mockPlayer] as never);
            const result = await getAll();
            expect(mockPrisma.player.findMany).toHaveBeenCalledWith();
            expect(result).toEqual([mockPlayer]);
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
        it('should create a player', async () => {
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
            const result = await create(createData as unknown as Parameters<typeof create>[0]);
            expect(mockPrisma.player.create).toHaveBeenCalledWith({
                data: createData,
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