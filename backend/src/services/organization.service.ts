import { PrismaClient, type Organization, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export async function getAll(): Promise<Organization[]> {
    return prisma.organization.findMany({
        include: { competitions: true },
    });
}

export async function getById(id: number): Promise<Organization | null> {
    return prisma.organization.findUnique({
        where: { id },
        include: { competitions: true },
    });
}

export async function create(data: Prisma.OrganizationCreateInput): Promise<Organization> {
    return prisma.organization.create({ data });
}

export async function update(id: number, data: Prisma.OrganizationUpdateInput): Promise<Organization> {
    return prisma.organization.update({
        where: { id },
        data,
    });
}

export async function deleteOrganization(id: number): Promise<Organization> {
    return prisma.organization.delete({
        where: { id },
    });
}