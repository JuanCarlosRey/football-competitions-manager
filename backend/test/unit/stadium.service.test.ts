import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import type { Stadium, Prisma } from '@prisma/client';

const mockPrisma = {
    stadium: {
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
    deleteStadium,
} = await import('../../src/services/stadium.service.js');

describe('Stadium Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockStadium: Stadium = {
        id: 1,
        name: 'Santiago Bernabéu',
        capacity: 81044,
        address: 'Av. de Concha Espina 1, Madrid',
    };

    const mockStadiumWithRelations = {
        ...mockStadium,
        matches: [],
    };

    describe('getAll', () => {
        it('should return all stadiums including matches relation', async () => {
            mockPrisma.stadium.findMany.mockResolvedValue([
                mockStadiumWithRelations,
            ] as never);
            const result = await getAll();
            expect(mockPrisma.stadium.findMany).toHaveBeenCalledWith({
                include: {
                    matches: true,
                },
            });
            expect(result).toEqual([mockStadiumWithRelations]);
        });

        it('should return an empty array if no stadiums exist', async () => {
            mockPrisma.stadium.findMany.mockResolvedValue([] as never);
            const result = await getAll();
            expect(result).toEqual([]);
        });
    });

    describe('getById', () => {
        it('should return a stadium by id including matches', async () => {
            mockPrisma.stadium.findUnique.mockResolvedValue(
                mockStadiumWithRelations as never
            );
            const result = await getById(1);
            expect(mockPrisma.stadium.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
                include: {
                    matches: true,
                },
            });
            expect(result).toEqual(mockStadiumWithRelations);
        });

        it('should return null if stadium does not exist', async () => {
            mockPrisma.stadium.findUnique.mockResolvedValue(null as never);
            const result = await getById(999);
            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        it('should create a stadium', async () => {
            const createData: Prisma.StadiumCreateInput = {
                name: 'Santiago Bernabéu',
                capacity: 81044,
                address: 'Av. de Concha Espina 1, Madrid',
            };
            mockPrisma.stadium.create.mockResolvedValue(mockStadium as never);
            const result = await create(createData);
            expect(mockPrisma.stadium.create).toHaveBeenCalledWith({
                data: createData,
            });
            expect(result).toEqual(mockStadium);
        });
    });

    describe('update', () => {
        it('should update a stadium', async () => {
            const updateData: Prisma.StadiumUpdateInput = {
                capacity: 85000,
            };
            const updatedStadium = {
                ...mockStadium,
                capacity: 85000,
            };
            mockPrisma.stadium.update.mockResolvedValue(updatedStadium as never);
            const result = await update(1, updateData);
            expect(mockPrisma.stadium.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: updateData,
            });
            expect(result).toEqual(updatedStadium);
        });
    });

    describe('deleteStadium', () => {
        it('should delete a stadium by id', async () => {
            mockPrisma.stadium.delete.mockResolvedValue(mockStadium as never);
            const result = await deleteStadium(1);
            expect(mockPrisma.stadium.delete).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(result).toEqual(mockStadium);
        });
    });
});