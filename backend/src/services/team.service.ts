import { type Team, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';

export async function getAll(): Promise<Team[]> {
    return prisma.team.findMany({
        include: {
            homeMatches: true,
            awayMatches: true,
        },
    });
}

export async function getById(id: number): Promise<Team | null> {
    return prisma.team.findUnique({
        where: { id },
        include: {
            homeMatches: true,
            awayMatches: true,
        },
    });
}

export async function create(data: Prisma.TeamCreateInput): Promise<Team> {
    return prisma.team.create({
        data,
    });
}

export async function update(id: number, data: Prisma.TeamUpdateInput): Promise<Team> {
    return prisma.team.update({
        where: { id },
        data,
    });
}

export async function remove(id: number): Promise<Team> {
    return prisma.team.delete({
        where: { id },
    });
}