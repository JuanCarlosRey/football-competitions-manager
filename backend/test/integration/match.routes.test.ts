import { jest, describe, beforeEach, it, expect, afterAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import type { Match } from '@prisma/client';

const mockMatchService = {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deleteMatch: jest.fn(),
};

const mockPrisma = {
    season: { findUnique: jest.fn() },
    stadium: { findUnique: jest.fn() },
    team: { findUnique: jest.fn() },
};

jest.unstable_mockModule('../../src/services/match.service.js', () => ({
    ...mockMatchService,
}));

jest.unstable_mockModule('../../src/config/prisma.js', () => ({
    prisma: mockPrisma,
}));

const { default: matchRouter } = await import(
    '../../src/routes/match.routes.js'
);

const app = express();
app.use(express.json());
app.use('/matches', matchRouter);

const mockMatch: Match = {
    id: 1,
    dateTime: new Date('2026-09-01T20:00:00.000Z'),
    status: 'SCHEDULED',
    seasonId: 1,
    stadiumId: 1,
    homeTeamId: 1,
    awayTeamId: 2,
};

const mockMatchWithRelations = {
    ...mockMatch,
    dateTime: mockMatch.dateTime.toISOString(),
    season: { id: 1, year: '2026' },
    stadium: { id: 1, name: 'Santiago Bernabéu' },
    homeTeam: { id: 1, name: 'Real Madrid' },
    awayTeam: { id: 2, name: 'FC Barcelona' },
};

const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

describe('Match Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        consoleErrorSpy.mockClear();
    });

    afterAll(() => {
        consoleErrorSpy.mockRestore();
    });

    describe('GET /matches', () => {
        it('should return all matches including their relations', async () => {
            mockMatchService.getAll.mockResolvedValue([
                mockMatchWithRelations,
            ] as never);
            const res = await request(app).get('/matches');
            expect(res.status).toBe(200);
            expect(res.body).toEqual([mockMatchWithRelations]);
            expect(mockMatchService.getAll).toHaveBeenCalledTimes(1);
        });

        it('should return 500 if the service fails', async () => {
            mockMatchService.getAll.mockRejectedValue(new Error('DB error') as never);
            const res = await request(app).get('/matches');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error obtaining matches' });
        });
    });

    describe('GET /matches/:id', () => {
        it('should return the match if it exists', async () => {
            mockMatchService.getById.mockResolvedValue(
                mockMatchWithRelations as never
            );
            const res = await request(app).get('/matches/1');
            expect(res.status).toBe(200);
            expect(res.body.id).toBe(1);
            expect(res.body.status).toBe('SCHEDULED');
            expect(mockMatchService.getById).toHaveBeenCalledWith(1);
        });

        it('should return 400 if the id is not a number', async () => {
            const res = await request(app).get('/matches/abc');
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Invalid match ID' });
            expect(mockMatchService.getById).not.toHaveBeenCalled();
        });

        it('should return 404 if the match does not exist', async () => {
            mockMatchService.getById.mockResolvedValue(null as never);
            const res = await request(app).get('/matches/999');
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'Match not found' });
        });

        it('should return 500 if the service fails', async () => {
            mockMatchService.getById.mockRejectedValue(new Error('DB error') as never);
            const res = await request(app).get('/matches/1');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error obtaining match' });
        });
    });

    describe('POST /matches', () => {
        const validInput = {
            dateTime: '2026-09-01T20:00:00.000Z',
            status: 'SCHEDULED',
            seasonId: 1,
            stadiumId: 1,
            homeTeamId: 1,
            awayTeamId: 2,
        };

        it('should return 201 and the created match when payload and foreign keys are valid', async () => {
            mockPrisma.season.findUnique.mockResolvedValue({ id: 1 } as never);
            mockPrisma.stadium.findUnique.mockResolvedValue({ id: 1 } as never);
            mockPrisma.team.findUnique.mockResolvedValue({ id: 1 } as never);
            const created = {
                ...mockMatchWithRelations,
                id: 2,
            };
            mockMatchService.create.mockResolvedValue(created as never);
            const res = await request(app)
                .post('/matches')
                .send(validInput);
            expect(res.status).toBe(201);
            expect(res.body.id).toBe(2);
            expect(mockMatchService.create).toHaveBeenCalledWith(validInput);
        });

        it('should return 400 if validation fails when homeTeamId equals awayTeamId', async () => {
            const invalidInput = { ...validInput, awayTeamId: 1 };
            const res = await request(app)
                .post('/matches')
                .send(invalidInput);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
            expect(mockMatchService.create).not.toHaveBeenCalled();
        });

        it('should return 400 if validation fails because a foreign key does not exist', async () => {
            mockPrisma.season.findUnique.mockResolvedValue(null as never);
            mockPrisma.stadium.findUnique.mockResolvedValue({ id: 1 } as never);
            mockPrisma.team.findUnique.mockResolvedValue({ id: 1 } as never);
            const res = await request(app)
                .post('/matches')
                .send(validInput);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
            expect(mockMatchService.create).not.toHaveBeenCalled();
        });

        it('should return 500 if the service fails', async () => {
            mockPrisma.season.findUnique.mockResolvedValue({ id: 1 } as never);
            mockPrisma.stadium.findUnique.mockResolvedValue({ id: 1 } as never);
            mockPrisma.team.findUnique.mockResolvedValue({ id: 1 } as never);
            mockMatchService.create.mockRejectedValue(new Error('DB error') as never);
            const res = await request(app)
                .post('/matches')
                .send(validInput);
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error creating match' });
        });
    });

    describe('PUT /matches/:id', () => {
        it('should return 200 and the updated match', async () => {
            const input = { status: 'FINISHED' };
            const updated = { ...mockMatchWithRelations, status: 'FINISHED' };
            mockMatchService.update.mockResolvedValue(updated as never);
            const res = await request(app)
                .put('/matches/1')
                .send(input);
            expect(res.status).toBe(200);
            expect(res.body.id).toBe(1);
            expect(res.body.status).toBe('FINISHED');
            expect(mockMatchService.update).toHaveBeenCalledWith(1, input);
        });

        it('should return 400 if the id is invalid', async () => {
            const res = await request(app)
                .put('/matches/abc')
                .send({ status: 'FINISHED' });
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Invalid match ID' });
        });

        it('should return 400 if validation fails due to invalid status enum', async () => {
            const res = await request(app)
                .put('/matches/1')
                .send({ status: 'INVALID_STATUS' });
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
            expect(mockMatchService.update).not.toHaveBeenCalled();
        });

        it('should return 404 if the match does not exist (P2025)', async () => {
            const prismaError = { code: 'P2025' };
            mockMatchService.update.mockRejectedValue(prismaError as never);
            const res = await request(app)
                .put('/matches/999')
                .send({ status: 'FINISHED' });
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'Match not found' });
        });

        it('should return 500 if the service fails', async () => {
            mockMatchService.update.mockRejectedValue(new Error('DB error') as never);
            const res = await request(app)
                .put('/matches/1')
                .send({ status: 'FINISHED' });
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error updating match' });
        });
    });

    describe('DELETE /matches/:id', () => {
        it('should return 204 when deleting successfully', async () => {
            mockMatchService.deleteMatch.mockResolvedValue(mockMatch as never);
            const res = await request(app).delete('/matches/1');
            expect(res.status).toBe(204);
            expect(res.body).toEqual({});
            expect(mockMatchService.deleteMatch).toHaveBeenCalledWith(1);
        });

        it('should return 400 if the id is invalid', async () => {
            const res = await request(app).delete('/matches/abc');
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Invalid match ID' });
        });

        it('should return 404 if the match does not exist (P2025)', async () => {
            const prismaError = { code: 'P2025' };
            mockMatchService.deleteMatch.mockRejectedValue(prismaError as never);
            const res = await request(app).delete('/matches/999');
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'Match not found' });
        });

        it('should return 500 if the service fails', async () => {
            mockMatchService.deleteMatch.mockRejectedValue(
                new Error('DB error') as never
            );
            const res = await request(app).delete('/matches/1');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error deleting match' });
        });
    });
});