import { type Match, Prisma } from '@prisma/client';
import { prisma } from '../config/prisma.js';

const includeRelations = {
    season: true,
    stadium: true,
    homeTeam: true,
    awayTeam: true,
};

export async function getAll(): Promise<Match[]> {
    return prisma.match.findMany({
        include: includeRelations,
    });
}

export async function getById(id: number): Promise<Match | null> {
    return prisma.match.findUnique({
        where: { id },
        include: includeRelations,
    });
}

export async function create(data: Prisma.MatchUncheckedCreateInput): Promise<Match> {
    return prisma.match.create({
        data,
        include: includeRelations,
    });
}

export async function update(id: number, data: Prisma.MatchUncheckedUpdateInput): Promise<Match> {
    return prisma.match.update({
        where: { id },
        data,
        include: includeRelations,
    });
}

export async function deleteMatch(id: number): Promise<Match> {
    return prisma.match.delete({
        where: { id },
    });
}