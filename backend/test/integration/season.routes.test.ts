import { jest, describe, beforeEach, it, expect, afterAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import type { Season } from '@prisma/client';

const mockSeasonService = {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deleteSeason: jest.fn(),
};

jest.unstable_mockModule('../../src/services/season.service.js', () => ({
    ...mockSeasonService,
}));

const { default: seasonRouter } = await import(
    '../../src/routes/season.routes.js'
);

const app = express();
app.use(express.json());
app.use('/seasons', seasonRouter);

const mockStartDate = '2025-09-01T00:00:00.000Z';
const mockEndDate = '2026-06-01T00:00:00.000Z';

const mockSeason: Season = {
    id: 1,
    startDate: new Date(mockStartDate),
    endDate: new Date(mockEndDate),
    competitionId: 10,
} as Season;

const mockSeasonWithRelations = {
    ...mockSeason,
    competition: { id: 10, name: 'Champions League', organizationId: 1 },
    matches: [],
};

const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

describe('Season Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        consoleErrorSpy.mockClear();
    });

    afterAll(() => {
        consoleErrorSpy.mockRestore();
    });

    describe('GET /seasons', () => {
        it('should return all seasons including their relations', async () => {
            mockSeasonService.getAll.mockResolvedValue([
                mockSeasonWithRelations,
            ] as never);
            const res = await request(app).get('/seasons');
            expect(res.status).toBe(200);
            expect(res.body).toEqual([
                {
                    ...mockSeasonWithRelations,
                    startDate: mockStartDate,
                    endDate: mockEndDate,
                },
            ]);
            expect(mockSeasonService.getAll).toHaveBeenCalledTimes(1);
        });

        it('should return 500 if the service fails', async () => {
            mockSeasonService.getAll.mockRejectedValue(new Error('DB error') as never);
            const res = await request(app).get('/seasons');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error obtaining seasons' });
        });
    });

    describe('GET /seasons/:id', () => {
        it('should return the season if it exists', async () => {
            mockSeasonService.getById.mockResolvedValue(
                mockSeasonWithRelations as never
            );
            const res = await request(app).get('/seasons/1');
            expect(res.status).toBe(200);
            expect(res.body.id).toBe(1);
            expect(res.body.competitionId).toBe(10);
            expect(mockSeasonService.getById).toHaveBeenCalledWith(1);
        });

        it('should return 400 if the id is not a number', async () => {
            const res = await request(app).get('/seasons/abc');
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Invalid season ID' });
            expect(mockSeasonService.getById).not.toHaveBeenCalled();
        });

        it('should return 404 if the season does not exist', async () => {
            mockSeasonService.getById.mockResolvedValue(null as never);
            const res = await request(app).get('/seasons/999');
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'Season not found' });
        });

        it('should return 500 if the service fails', async () => {
            mockSeasonService.getById.mockRejectedValue(new Error('DB error') as never);
            const res = await request(app).get('/seasons/1');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error obtaining season' });
        });
    });

    describe('POST /seasons', () => {
        it('should return 201 and the created season', async () => {
            const input = {
                startDate: mockStartDate,
                endDate: mockEndDate,
                competitionId: 10,
            };
            const created = {
                ...mockSeason,
                id: 2,
            };
            mockSeasonService.create.mockResolvedValue(created as never);
            const res = await request(app)
                .post('/seasons')
                .send(input);
            expect(res.status).toBe(201);
            expect(res.body.id).toBe(2);
            expect(mockSeasonService.create).toHaveBeenCalledWith({
                startDate: new Date(mockStartDate),
                endDate: new Date(mockEndDate),
                competition: {
                    connect: { id: 10 },
                },
            });
        });

        it('should return 400 if validation fails due to missing or invalid fields', async () => {
            const res = await request(app)
                .post('/seasons')
                .send({ startDate: 'invalid-date' });
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
            expect(mockSeasonService.create).not.toHaveBeenCalled();
        });

        it('should return 404 if the associated competition does not exist (P2025)', async () => {
            const prismaError = { code: 'P2025' };
            mockSeasonService.create.mockRejectedValue(prismaError as never);
            const res = await request(app)
                .post('/seasons')
                .send({
                    startDate: mockStartDate,
                    endDate: mockEndDate,
                    competitionId: 999,
                });
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'Associated competition not found' });
        });

        it('should return 500 if the service fails', async () => {
            mockSeasonService.create.mockRejectedValue(new Error('DB error') as never);
            const res = await request(app)
                .post('/seasons')
                .send({
                    startDate: mockStartDate,
                    endDate: mockEndDate,
                    competitionId: 10,
                });
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error creating season' });
        });
    });

    describe('PUT /seasons/:id', () => {
        it('should return 200 and the updated season', async () => {
            const newEndDate = '2026-07-01T00:00:00.000Z';
            const input = { endDate: newEndDate };
            const updated = { ...mockSeason, endDate: new Date(newEndDate) };
            mockSeasonService.update.mockResolvedValue(updated as never);
            const res = await request(app)
                .put('/seasons/1')
                .send(input);
            expect(res.status).toBe(200);
            expect(res.body.id).toBe(1);
            expect(mockSeasonService.update).toHaveBeenCalledWith(1, {
                endDate: new Date(newEndDate),
            });
        });

        it('should return 400 if the id is invalid', async () => {
            const res = await request(app)
                .put('/seasons/abc')
                .send({ endDate: mockEndDate });
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Invalid season ID' });
        });

        it('should return 400 if validation fails due to invalid data type', async () => {
            const res = await request(app)
                .put('/seasons/1')
                .send({ endDate: 'not-a-date' });
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
            expect(mockSeasonService.update).not.toHaveBeenCalled();
        });

        it('should return 404 if the season or competition does not exist (P2025)', async () => {
            const prismaError = { code: 'P2025' };
            mockSeasonService.update.mockRejectedValue(prismaError as never);
            const res = await request(app)
                .put('/seasons/999')
                .send({ competitionId: 999 });
            expect(res.status).toBe(404);
            expect(res.body).toEqual({
                error: 'Season or associated competition not found',
            });
        });

        it('should return 500 if the service fails', async () => {
            mockSeasonService.update.mockRejectedValue(new Error('DB error') as never);
            const res = await request(app)
                .put('/seasons/1')
                .send({ endDate: mockEndDate });
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error updating season' });
        });
    });

    describe('DELETE /seasons/:id', () => {
        it('should return 204 when deleting successfully', async () => {
            mockSeasonService.deleteSeason.mockResolvedValue(mockSeason as never);
            const res = await request(app).delete('/seasons/1');
            expect(res.status).toBe(204);
            expect(res.body).toEqual({});
            expect(mockSeasonService.deleteSeason).toHaveBeenCalledWith(1);
        });

        it('should return 400 if the id is invalid', async () => {
            const res = await request(app).delete('/seasons/abc');
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Invalid season ID' });
        });

        it('should return 404 if the season does not exist (P2025)', async () => {
            const prismaError = { code: 'P2025' };
            mockSeasonService.deleteSeason.mockRejectedValue(prismaError as never);
            const res = await request(app).delete('/seasons/999');
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'Season not found' });
        });

        it('should return 500 if the service fails', async () => {
            mockSeasonService.deleteSeason.mockRejectedValue(
                new Error('DB error') as never
            );
            const res = await request(app).delete('/seasons/1');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error deleting season' });
        });
    });
});