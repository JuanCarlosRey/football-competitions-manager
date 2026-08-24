import { prisma } from '../config/prisma.js';

export async function getAll() {
    return prisma.competition.findMany();
}

export async function getById(id: number) {
    return prisma.competition.findUnique({
        where: { id },
    });
}

export async function create(data: { name: string; organization?: string }) {
    return prisma.competition.create({
        data,
    });
}

export async function update(
    id: number,
    data: { name?: string; organization?: string }
) {
    return prisma.competition.update({
        where: { id },
        data,
    });
}

export async function deleteCompetition(id: number) {
    return prisma.competition.delete({
        where: { id },
    });
}