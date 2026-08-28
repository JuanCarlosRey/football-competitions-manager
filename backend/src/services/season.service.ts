import { type Season, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';

export async function getAll(): Promise<Season[]> {
    return prisma.season.findMany({
        include: {
            competition: true,
            matches: true,
        },
    });
}

export async function getById(id: number): Promise<Season | null> {
    return prisma.season.findUnique({
        where: { id },
        include: {
            competition: true,
            matches: true,
        },
    });
}

export async function create(data: Prisma.SeasonCreateInput): Promise<Season> {
    return prisma.season.create({
        data,
        include: {
            competition: true,
        },
    });
}

export async function update(id: number, data: Prisma.SeasonUpdateInput): Promise<Season> {
    return prisma.season.update({
        where: { id },
        data,
        include: {
            competition: true,
        },
    });
}

export async function deleteSeason(id: number): Promise<Season> {
    return prisma.season.delete({
        where: { id },
    });
}