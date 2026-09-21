import { jest, describe, beforeEach, it, expect, afterAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';

const mockMatchPlayerStatsService = {
    getStatsByMatch: jest.fn(),
    addPlayerStats: jest.fn(),
    updatePlayerStats: jest.fn(),
    removePlayerStats: jest.fn(),
};

const mockPrisma = {
    player: { findUnique: jest.fn() },
    match: { findUnique: jest.fn() },
};

jest.unstable_mockModule('../../src/services/match-player-stats.service.js', () => ({
    ...mockMatchPlayerStatsService,
}));

jest.unstable_mockModule('../../src/config/prisma.js', () => ({
    __esModule: true,
    prisma: mockPrisma,
    default: mockPrisma,
}));

const { default: matchRouter } = await import(
    '../../src/routes/match.routes.js'
);

const app = express();
app.use(express.json());
app.use('/matches', matchRouter);

const mockStatsItem = {
    id: 1,
    matchId: 1,
    playerId: 7,
    goals: 2,
    goalsConceded: 0,
    assists: 1,
    yellowCards: 0,
    redCards: 0,
    rating: 9.2,
};

const mockStatsWithRelations = {
    ...mockStatsItem,
    match: { id: 1, dateTime: '2026-09-01T20:00:00.000Z' },
    player: { id: 7, firstName: 'Vinicius', lastName: 'Jr' },
};

const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

describe('Match Player Stats Routes Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        consoleErrorSpy.mockClear();
    });

    afterAll(() => {
        consoleErrorSpy.mockRestore();
    });

    describe('GET /matches/:id/player-statistics', () => {
        it('should return all player stats for a given match', async () => {
            mockMatchPlayerStatsService.getStatsByMatch.mockResolvedValue([
                mockStatsWithRelations,
            ] as never);
            const res = await request(app).get('/matches/1/player-statistics');
            expect(res.status).toBe(200);
            expect(res.body).toEqual([mockStatsWithRelations]);
            expect(mockMatchPlayerStatsService.getStatsByMatch).toHaveBeenCalledWith(1);
        });

        it('should return 400 if the match ID parameter is not a valid number', async () => {
            const res = await request(app).get('/matches/abc/player-statistics');
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
            expect(res.body.errors[0].path).toContain('id');
            expect(mockMatchPlayerStatsService.getStatsByMatch).not.toHaveBeenCalled();
        });

        it('should return 500 if the service encounters an error', async () => {
            mockMatchPlayerStatsService.getStatsByMatch.mockRejectedValue(
                new Error('Database disconnect') as never
            );
            const res = await request(app).get('/matches/1/player-statistics');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error obtaining match player stats' });
        });
    });

    describe('POST /matches/:id/player-statistics', () => {
        const validPayload = {
            playerId: 7,
            goals: 2,
            goalsConceded: 0,
            assists: 1,
            yellowCards: 0,
            redCards: 0,
            rating: 9.2,
        };

        it('should create player stats entry and return 201 status code', async () => {
            mockMatchPlayerStatsService.addPlayerStats.mockResolvedValue(
                mockStatsWithRelations as never
            );
            const res = await request(app)
                .post('/matches/1/player-statistics')
                .send(validPayload);
            expect(res.status).toBe(201);
            expect(res.body).toEqual(mockStatsWithRelations);
            expect(mockMatchPlayerStatsService.addPlayerStats).toHaveBeenCalledWith(1, validPayload);
        });

        it('should return 400 if the match ID is invalid', async () => {
            const res = await request(app)
                .post('/matches/invalid-id/player-statistics')
                .send(validPayload);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
            expect(res.body.errors[0].path).toContain('id');
            expect(mockMatchPlayerStatsService.addPlayerStats).not.toHaveBeenCalled();
        });

        it('should return 400 if schema validation fails (e.g. missing playerId or negative values)', async () => {
            const invalidPayload = {
                goals: -1,
                rating: 15,
            };
            const res = await request(app)
                .post('/matches/1/player-statistics')
                .send(invalidPayload);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
            expect(mockMatchPlayerStatsService.addPlayerStats).not.toHaveBeenCalled();
        });

        it('should return 400 if the specified match does not exist', async () => {
            mockMatchPlayerStatsService.addPlayerStats.mockRejectedValue(
                new Error('Match with ID 999 does not exist') as never
            );
            const res = await request(app)
                .post('/matches/999/player-statistics')
                .send(validPayload);
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Match with ID 999 does not exist' });
        });

        it('should return 422 if the player is not part of the lineup', async () => {
            mockMatchPlayerStatsService.addPlayerStats.mockRejectedValue(
                new Error('Player with ID 7 is not part of the lineup for match 1') as never
            );
            const res = await request(app)
                .post('/matches/1/player-statistics')
                .send(validPayload);
            expect(res.status).toBe(422);
            expect(res.body).toEqual({
                error: 'Player with ID 7 is not part of the lineup for match 1',
            });
        });

        it('should return 409 if stats for the player are already registered', async () => {
            mockMatchPlayerStatsService.addPlayerStats.mockRejectedValue(
                new Error('Stats for player with ID 7 are already registered for match 1') as never
            );
            const res = await request(app)
                .post('/matches/1/player-statistics')
                .send(validPayload);
            expect(res.status).toBe(409);
            expect(res.body).toEqual({
                error: 'Stats for player with ID 7 are already registered for match 1',
            });
        });

        it('should return 404 on Prisma P2003 foreign key constraint error', async () => {
            const prismaError = new Error('Foreign key failed');
            (prismaError as unknown as { code: string }).code = 'P2003';
            mockMatchPlayerStatsService.addPlayerStats.mockRejectedValue(prismaError as never);
            const res = await request(app)
                .post('/matches/1/player-statistics')
                .send(validPayload);
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'Match or player not found' });
        });

        it('should return 500 on unexpected errors', async () => {
            mockMatchPlayerStatsService.addPlayerStats.mockRejectedValue(
                new Error('Internal server error') as never
            );
            const res = await request(app)
                .post('/matches/1/player-statistics')
                .send(validPayload);
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error adding player stats to match' });
        });
    });

    describe('PUT /matches/:id/player-statistics/:statId', () => {
        const validUpdatePayload = {
            goals: 3,
            rating: 9.8,
        };

        it('should update player stats successfully and return 200', async () => {
            const updatedStats = {
                ...mockStatsWithRelations,
                goals: 3,
                rating: 9.8,
            };
            mockMatchPlayerStatsService.updatePlayerStats.mockResolvedValue(
                updatedStats as never
            );
            const res = await request(app)
                .put('/matches/1/player-statistics/1')
                .send(validUpdatePayload);
            expect(res.status).toBe(200);
            expect(res.body).toEqual(updatedStats);
            expect(mockMatchPlayerStatsService.updatePlayerStats).toHaveBeenCalledWith(
                1,
                1,
                validUpdatePayload
            );
        });

        it('should return 400 if URL parameter is an invalid number', async () => {
            const res = await request(app)
                .put('/matches/1/player-statistics/abc')
                .send(validUpdatePayload);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
            expect(res.body.errors[0].path).toContain('statId');
            expect(mockMatchPlayerStatsService.updatePlayerStats).not.toHaveBeenCalled();
        });

        it('should return 400 if update payload fails validation', async () => {
            const res = await request(app)
                .put('/matches/1/player-statistics/1')
                .send({ rating: 15 });
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
            expect(mockMatchPlayerStatsService.updatePlayerStats).not.toHaveBeenCalled();
        });

        it('should return 404 if the stats entry is not found', async () => {
            mockMatchPlayerStatsService.updatePlayerStats.mockRejectedValue(
                new Error('Stats entry with ID 999 was not found for match 1') as never
            );
            const res = await request(app)
                .put('/matches/1/player-statistics/999')
                .send(validUpdatePayload);
            expect(res.status).toBe(404);
            expect(res.body).toEqual({
                error: 'Stats entry with ID 999 was not found for match 1',
            });
        });

        it('should return 404 on Prisma P2025 record not found error', async () => {
            const prismaError = new Error('Record not found');
            (prismaError as unknown as { code: string }).code = 'P2025';
            mockMatchPlayerStatsService.updatePlayerStats.mockRejectedValue(prismaError as never);
            const res = await request(app)
                .put('/matches/1/player-statistics/1')
                .send(validUpdatePayload);
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'Player stats entry not found' });
        });

        it('should return 500 on unexpected service failure', async () => {
            mockMatchPlayerStatsService.updatePlayerStats.mockRejectedValue(
                new Error('Unexpected DB error') as never
            );
            const res = await request(app)
                .put('/matches/1/player-statistics/1')
                .send(validUpdatePayload);
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error updating player stats' });
        });
    });

    describe('DELETE /matches/:id/player-statistics/:statId', () => {
        it('should remove player stats entry and return 204 status', async () => {
            mockMatchPlayerStatsService.removePlayerStats.mockResolvedValue(
                mockStatsItem as never
            );
            const res = await request(app).delete('/matches/1/player-statistics/1');
            expect(res.status).toBe(204);
            expect(res.body).toEqual({});
            expect(mockMatchPlayerStatsService.removePlayerStats).toHaveBeenCalledWith(1, 1);
        });

        it('should return 400 if match ID or stats ID are not valid numbers', async () => {
            const res = await request(app).delete('/matches/xyz/player-statistics/1');
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
            expect(res.body.errors[0].path).toContain('id');
            expect(mockMatchPlayerStatsService.removePlayerStats).not.toHaveBeenCalled();
        });

        it('should return 404 if player stats entry to delete is not found', async () => {
            mockMatchPlayerStatsService.removePlayerStats.mockRejectedValue(
                new Error('Stats entry with ID 999 was not found for match 1') as never
            );
            const res = await request(app).delete('/matches/1/player-statistics/999');
            expect(res.status).toBe(404);
            expect(res.body).toEqual({
                error: 'Stats entry with ID 999 was not found for match 1',
            });
        });

        it('should return 404 on Prisma P2025 record not found error during deletion', async () => {
            const prismaError = new Error('Record not found');
            (prismaError as unknown as { code: string }).code = 'P2025';
            mockMatchPlayerStatsService.removePlayerStats.mockRejectedValue(prismaError as never);
            const res = await request(app).delete('/matches/1/player-statistics/1');
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'Player stats entry not found' });
        });

        it('should return 500 on unexpected error during deletion', async () => {
            mockMatchPlayerStatsService.removePlayerStats.mockRejectedValue(
                new Error('Database delete failure') as never
            );
            const res = await request(app).delete('/matches/1/player-statistics/1');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error removing player stats' });
        });
    });
});