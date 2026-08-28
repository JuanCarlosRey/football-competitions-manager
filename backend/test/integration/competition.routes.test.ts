import { jest, describe, beforeEach, it, expect, afterAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import type { Competition } from '@prisma/client';

const mockCompetitionService = {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deleteCompetition: jest.fn(),
};

jest.unstable_mockModule('../../src/services/competition.service.js', () => ({
    ...mockCompetitionService,
}));

const { default: competitionRouter } = await import(
    '../../src/routes/competition.routes.js'
);

const app = express();
app.use(express.json());
app.use('/competitions', competitionRouter);

const mockCompetition: Competition = {
    id: 1,
    name: 'Champions League',
    organizationId: 10,
} as Competition;

const mockCompetitionWithRelations = {
    ...mockCompetition,
    organization: { id: 10, name: 'UEFA' },
    seasons: [],
};

const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

describe('Competition Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        consoleErrorSpy.mockClear();
    });

    afterAll(() => {
        consoleErrorSpy.mockRestore();
    });

    describe('GET /competitions', () => {
        it('should return all competitions including their relations', async () => {
            mockCompetitionService.getAll.mockResolvedValue([
                mockCompetitionWithRelations,
            ] as never);
            const res = await request(app).get('/competitions');
            expect(res.status).toBe(200);
            expect(res.body).toEqual([mockCompetitionWithRelations]);
            expect(mockCompetitionService.getAll).toHaveBeenCalledTimes(1);
        });

        it('should return 500 if the service fails', async () => {
            mockCompetitionService.getAll.mockRejectedValue(new Error('DB error') as never);
            const res = await request(app).get('/competitions');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error obtaining competitions' });
        });
    });

    describe('GET /competitions/:id', () => {
        it('should return the competition if it exists', async () => {
            mockCompetitionService.getById.mockResolvedValue(
                mockCompetitionWithRelations as never
            );
            const res = await request(app).get('/competitions/1');
            expect(res.status).toBe(200);
            expect(res.body.id).toBe(1);
            expect(res.body.name).toBe('Champions League');
            expect(mockCompetitionService.getById).toHaveBeenCalledWith(1);
        });

        it('should return 400 if the id is not a number', async () => {
            const res = await request(app).get('/competitions/abc');
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Invalid competition ID' });
            expect(mockCompetitionService.getById).not.toHaveBeenCalled();
        });

        it('should return 404 if the competition does not exist', async () => {
            mockCompetitionService.getById.mockResolvedValue(null as never);
            const res = await request(app).get('/competitions/999');
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'Competition not found' });
        });

        it('should return 500 if the service fails', async () => {
            mockCompetitionService.getById.mockRejectedValue(new Error('DB error') as never);
            const res = await request(app).get('/competitions/1');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error obtaining competition' });
        });
    });

    describe('POST /competitions', () => {
        it('should return 201 and the created competition', async () => {
            const input = { name: 'Europa League', organizationId: 10 };
            const created = { ...mockCompetition, id: 2, name: 'Europa League' };
            mockCompetitionService.create.mockResolvedValue(created as never);
            const res = await request(app)
                .post('/competitions')
                .send(input);
            expect(res.status).toBe(201);
            expect(res.body.name).toBe('Europa League');
            expect(mockCompetitionService.create).toHaveBeenCalledWith(input);
        });

        it('should return 400 if validation fails due to missing fields', async () => {
            const res = await request(app)
                .post('/competitions')
                .send({ name: 'Europa League' }); // Falta organizationId
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'The "organizationId" field is required' });
            expect(mockCompetitionService.create).not.toHaveBeenCalled();
        });

        it('should return 400 if organizationId does not exist (P2003)', async () => {
            const prismaError = { code: 'P2003' };
            mockCompetitionService.create.mockRejectedValue(prismaError as never);
            const res = await request(app)
                .post('/competitions')
                .send({ name: 'Europa League', organizationId: 999 });
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'The specified organizationId does not exist' });
        });

        it('should return 500 if the service fails', async () => {
            mockCompetitionService.create.mockRejectedValue(new Error('DB error') as never);
            const res = await request(app)
                .post('/competitions')
                .send({ name: 'Europa League', organizationId: 10 });
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error creating competition' });
        });
    });

    describe('PUT /competitions/:id', () => {
        it('should return 200 and the updated competition', async () => {
            const input = { name: 'UEFA Champions League' };
            const updated = { ...mockCompetition, name: 'UEFA Champions League' };
            mockCompetitionService.update.mockResolvedValue(updated as never);
            const res = await request(app)
                .put('/competitions/1')
                .send(input);
            expect(res.status).toBe(200);
            expect(res.body.name).toBe('UEFA Champions League');
            expect(mockCompetitionService.update).toHaveBeenCalledWith(1, input);
        });

        it('should return 400 if the id is invalid', async () => {
            const res = await request(app)
                .put('/competitions/abc')
                .send({ name: 'Test' });
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Invalid competition ID' });
        });

        it('should return 404 if the competition does not exist (P2025)', async () => {
            const prismaError = { code: 'P2025' };
            mockCompetitionService.update.mockRejectedValue(prismaError as never);
            const res = await request(app)
                .put('/competitions/999')
                .send({ name: 'Non Existent' });
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'Competition not found' });
        });

        it('should return 400 if the updated organizationId does not exist (P2003)', async () => {
            const prismaError = { code: 'P2003' };
            mockCompetitionService.update.mockRejectedValue(prismaError as never);
            const res = await request(app)
                .put('/competitions/1')
                .send({ organizationId: 999 });
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'The specified organizationId does not exist' });
        });

        it('should return 500 if the service fails', async () => {
            mockCompetitionService.update.mockRejectedValue(new Error('DB error') as never);
            const res = await request(app)
                .put('/competitions/1')
                .send({ name: 'Test' });
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error updating competition' });
        });
    });

    describe('DELETE /competitions/:id', () => {
        it('should return 204 when deleting successfully', async () => {
            mockCompetitionService.deleteCompetition.mockResolvedValue(
                mockCompetition as never
            );
            const res = await request(app).delete('/competitions/1');
            expect(res.status).toBe(204);
            expect(res.body).toEqual({});
            expect(mockCompetitionService.deleteCompetition).toHaveBeenCalledWith(1);
        });

        it('should return 400 if the id is invalid', async () => {
            const res = await request(app).delete('/competitions/abc');
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Invalid competition ID' });
        });

        it('should return 404 if the competition does not exist (P2025)', async () => {
            const prismaError = { code: 'P2025' };
            mockCompetitionService.deleteCompetition.mockRejectedValue(prismaError as never);
            const res = await request(app).delete('/competitions/999');
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'Competition not found' });
        });

        it('should return 500 if the service fails', async () => {
            mockCompetitionService.deleteCompetition.mockRejectedValue(
                new Error('DB error') as never
            );
            const res = await request(app).delete('/competitions/1');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error deleting competition' });
        });
    });
});