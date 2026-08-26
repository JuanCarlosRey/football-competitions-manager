import { prisma } from '../config/prisma.js';

export async function getAll() {
    return prisma.competition.findMany({
        include: {
            organization: true,
        },
    });
}

export async function getById(id: number) {
    return prisma.competition.findUnique({
        where: { id },
        include: {
            organization: true,
        },
    });
}

export async function create(data: { name: string; organizationId: number }) {
    return prisma.competition.create({
        data: {
            name: data.name,
            organizationId: data.organizationId,
        },
    });
}

export async function update(
    id: number,
    data: { name?: string; organizationId?: number }
) {
    return prisma.competition.update({
        where: { id },
        data: {
            ...(data.name !== undefined && { name: data.name }),
            ...(data.organizationId !== undefined && { organizationId: data.organizationId }),
        },
    });
}

export async function deleteCompetition(id: number) {
    return prisma.competition.delete({
        where: { id },
    });
}