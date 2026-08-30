import { type Stadium, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';

export async function getAll(): Promise<Stadium[]> {
    return prisma.stadium.findMany({
        include: {
            matches: true,
        },
    });
}

export async function getById(id: number): Promise<Stadium | null> {
    return prisma.stadium.findUnique({
        where: { id },
        include: {
            matches: true,
        },
    });
}

export async function create(data: Prisma.StadiumCreateInput): Promise<Stadium> {
    return prisma.stadium.create({
        data,
    });
}

export async function update(id: number, data: Prisma.StadiumUpdateInput): Promise<Stadium> {
    return prisma.stadium.update({
        where: { id },
        data,
    });
}

export async function deleteStadium(id: number): Promise<Stadium> {
    return prisma.stadium.delete({
        where: { id },
    });
}