import { jest, describe, beforeEach, it, expect, afterAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import type { Organization } from '@prisma/client';

const mockOrganizationService = {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deleteOrganization: jest.fn(),
};

jest.unstable_mockModule('../../src/services/organization.service.js', () => ({
    ...mockOrganizationService,
}));

const { default: organizationRouter } = await import(
    '../../src/routes/organization.routes.js'
);

const app = express();
app.use(express.json());
app.use('/organizations', organizationRouter);

const mockOrganization: Organization = {
    id: 1,
    name: 'LaLiga',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
} as Organization;

const mockOrganizationWithCompetitions = {
    ...mockOrganization,
    competitions: [],
};

const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('Organization Routes (Integration)', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        consoleErrorSpy.mockClear();
    });

    afterAll(() => {
        consoleErrorSpy.mockRestore();
    });

    describe('GET /organizations', () => {
        it('debería devolver 200 y la lista de organizaciones', async () => {
            mockOrganizationService.getAll.mockResolvedValue([
                mockOrganizationWithCompetitions,
            ] as never);
            const res = await request(app).get('/organizations');
            expect(res.status).toBe(200);
            expect(res.body).toEqual([
                {
                    ...mockOrganizationWithCompetitions,
                    createdAt: new Date('2024-01-01').toISOString(),
                    updatedAt: new Date('2024-01-01').toISOString(),
                },
            ]);
            expect(mockOrganizationService.getAll).toHaveBeenCalledTimes(1);
        });

        it('debería devolver 500 si el servicio falla', async () => {
            mockOrganizationService.getAll.mockRejectedValue(new Error('DB error') as never);
            const res = await request(app).get('/organizations');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error obtaining organizations' });
        });
    });

    describe('GET /organizations/:id', () => {
        it('debería devolver 200 y la organización si existe', async () => {
            mockOrganizationService.getById.mockResolvedValue(
                mockOrganizationWithCompetitions as never
            );
            const res = await request(app).get('/organizations/1');
            expect(res.status).toBe(200);
            expect(res.body.id).toBe(1);
            expect(res.body.name).toBe('LaLiga');
            expect(mockOrganizationService.getById).toHaveBeenCalledWith(1);
        });

        it('debería devolver 400 si el id no es un número', async () => {
            const res = await request(app).get('/organizations/abc');
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Invalid organization ID' });
            expect(mockOrganizationService.getById).not.toHaveBeenCalled();
        });

        it('debería devolver 404 si la organización no existe', async () => {
            mockOrganizationService.getById.mockResolvedValue(null as never);
            const res = await request(app).get('/organizations/999');
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'Organization not found' });
        });

        it('debería devolver 500 si el servicio falla', async () => {
            mockOrganizationService.getById.mockRejectedValue(new Error('DB error') as never);
            const res = await request(app).get('/organizations/1');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error obtaining organization' });
        });
    });

    describe('POST /organizations', () => {
        it('debería devolver 201 y la organización creada', async () => {
            const input = { name: 'Premier League' };
            const created = { ...mockOrganization, id: 2, name: 'Premier League' };
            mockOrganizationService.create.mockResolvedValue(created as never);
            const res = await request(app)
                .post('/organizations')
                .send(input);
            expect(res.status).toBe(201);
            expect(res.body.name).toBe('Premier League');
            expect(mockOrganizationService.create).toHaveBeenCalledWith(input);
        });

        it('debería devolver 400 si los datos no son válidos (Zod)', async () => {
            const res = await request(app)
                .post('/organizations')
                .send({});
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
            expect(mockOrganizationService.create).not.toHaveBeenCalled();
        });

        it('debería devolver 500 si el servicio falla', async () => {
            mockOrganizationService.create.mockRejectedValue(new Error('DB error') as never);
            const res = await request(app)
                .post('/organizations')
                .send({ name: 'Serie A' });
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error creating organization' });
        });
    });

    describe('PUT /organizations/:id', () => {
        it('debería devolver 200 y la organización actualizada', async () => {
            const updated = { ...mockOrganization, name: 'LaLiga EA Sports' };
            mockOrganizationService.update.mockResolvedValue(updated as never);
            const res = await request(app)
                .put('/organizations/1')
                .send({ name: 'LaLiga EA Sports' });
            expect(res.status).toBe(200);
            expect(res.body.name).toBe('LaLiga EA Sports');
            expect(mockOrganizationService.update).toHaveBeenCalledWith(1, {
                name: 'LaLiga EA Sports',
            });
        });

        it('debería devolver 400 si el id no es válido', async () => {
            const res = await request(app)
                .put('/organizations/abc')
                .send({ name: 'Test' });
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Invalid organization ID' });
        });

        it('debería devolver 404 si la organización no existe (P2025)', async () => {
            const prismaError = { code: 'P2025' };
            mockOrganizationService.update.mockRejectedValue(prismaError as never);
            const res = await request(app)
                .put('/organizations/999')
                .send({ name: 'No existe' });
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'Organization not found' });
        });

        it('debería devolver 500 en otros errores', async () => {
            mockOrganizationService.update.mockRejectedValue(new Error('DB error') as never);
            const res = await request(app)
                .put('/organizations/1')
                .send({ name: 'Test' });
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error updating organization' });
        });
    });

    describe('DELETE /organizations/:id', () => {
        it('debería devolver 204 al eliminar correctamente', async () => {
            mockOrganizationService.deleteOrganization.mockResolvedValue(
                mockOrganization as never
            );
            const res = await request(app).delete('/organizations/1');
            expect(res.status).toBe(204);
            expect(res.body).toEqual({});
            expect(mockOrganizationService.deleteOrganization).toHaveBeenCalledWith(1);
        });

        it('debería devolver 400 si el id no es válido', async () => {
            const res = await request(app).delete('/organizations/abc');
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Invalid organization ID' });
        });

        it('debería devolver 404 si la organización no existe (P2025)', async () => {
            const prismaError = { code: 'P2025' };
            mockOrganizationService.deleteOrganization.mockRejectedValue(prismaError as never);
            const res = await request(app).delete('/organizations/999');
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'Organization not found' });
        });

        it('debería devolver 500 en otros errores', async () => {
            mockOrganizationService.deleteOrganization.mockRejectedValue(
                new Error('DB error') as never
            );
            const res = await request(app).delete('/organizations/1');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error deleting organization' });
        });
    });
});