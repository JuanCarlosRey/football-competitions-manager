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

describe('Organization Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        consoleErrorSpy.mockClear();
    });

    afterAll(() => {
        consoleErrorSpy.mockRestore();
    });

    describe('GET /organizations', () => {
        it('should return all organizations including their competitions', async () => {
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

        it('should return 500 if the service fails', async () => {
            mockOrganizationService.getAll.mockRejectedValue(new Error('DB error') as never);
            const res = await request(app).get('/organizations');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error obtaining organizations' });
        });
    });

    describe('GET /organizations/:id', () => {
        it('should return the organization if it exists', async () => {
            mockOrganizationService.getById.mockResolvedValue(
                mockOrganizationWithCompetitions as never
            );
            const res = await request(app).get('/organizations/1');
            expect(res.status).toBe(200);
            expect(res.body.id).toBe(1);
            expect(res.body.name).toBe('LaLiga');
            expect(mockOrganizationService.getById).toHaveBeenCalledWith(1);
        });

        it('should return 400 if the id is not a number', async () => {
            const res = await request(app).get('/organizations/abc');
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Invalid organization ID' });
            expect(mockOrganizationService.getById).not.toHaveBeenCalled();
        });

        it('should return 404 if the organization does not exist', async () => {
            mockOrganizationService.getById.mockResolvedValue(null as never);
            const res = await request(app).get('/organizations/999');
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'Organization not found' });
        });

        it('should return 500 if the service fails', async () => {
            mockOrganizationService.getById.mockRejectedValue(new Error('DB error') as never);
            const res = await request(app).get('/organizations/1');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error obtaining organization' });
        });
    });

    describe('POST /organizations', () => {
        it('should return 201 and the created organization', async () => {
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

        it('should return 400 if the data is invalid (Zod)', async () => {
            const res = await request(app)
                .post('/organizations')
                .send({});
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
            expect(mockOrganizationService.create).not.toHaveBeenCalled();
        });

        it('should return 500 if the service fails', async () => {
            mockOrganizationService.create.mockRejectedValue(new Error('DB error') as never);
            const res = await request(app)
                .post('/organizations')
                .send({ name: 'Serie A' });
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error creating organization' });
        });
    });

    describe('PUT /organizations/:id', () => {
        it('should return 200 and the updated organization', async () => {
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

        it('should return 400 if the id is not valid', async () => {
            const res = await request(app)
                .put('/organizations/abc')
                .send({ name: 'Test' });
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Invalid organization ID' });
        });

        it('should return 404 if the organization does not exist (P2025)', async () => {
            const prismaError = { code: 'P2025' };
            mockOrganizationService.update.mockRejectedValue(prismaError as never);
            const res = await request(app)
                .put('/organizations/999')
                .send({ name: 'No existe' });
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'Organization not found' });
        });

        it('should return 500 if the service fails', async () => {
            mockOrganizationService.update.mockRejectedValue(new Error('DB error') as never);
            const res = await request(app)
                .put('/organizations/1')
                .send({ name: 'Test' });
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error updating organization' });
        });
    });

    describe('DELETE /organizations/:id', () => {
        it('should return 204 when deleting successfully', async () => {
            mockOrganizationService.deleteOrganization.mockResolvedValue(
                mockOrganization as never
            );
            const res = await request(app).delete('/organizations/1');
            expect(res.status).toBe(204);
            expect(res.body).toEqual({});
            expect(mockOrganizationService.deleteOrganization).toHaveBeenCalledWith(1);
        });

        it('should return 400 if the id is not valid', async () => {
            const res = await request(app).delete('/organizations/abc');
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Invalid organization ID' });
        });

        it('should return 404 if the organization does not exist (P2025)', async () => {
            const prismaError = { code: 'P2025' };
            mockOrganizationService.deleteOrganization.mockRejectedValue(prismaError as never);
            const res = await request(app).delete('/organizations/999');
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'Organization not found' });
        });

        it('should return 500 if the service fails', async () => {
            mockOrganizationService.deleteOrganization.mockRejectedValue(
                new Error('DB error') as never
            );
            const res = await request(app).delete('/organizations/1');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error deleting organization' });
        });
    });
});