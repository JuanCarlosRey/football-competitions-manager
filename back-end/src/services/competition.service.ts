import { prisma } from '../config/prisma.js';

export async function getAll() {
    return prisma.competition.findMany();
}