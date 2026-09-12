import { jest, describe, beforeEach, it, expect, afterAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';

const mockMatchTeamStatsService = {
    getStatsByMatch: jest.fn(),
    addTeamStats: jest.fn(),
    updateTeamStats: jest.fn(),
    removeTeamStats: jest.fn(),
};

const mockPrisma = {
    team: { findUnique: jest.fn() },
    match: { findUnique: jest.fn() },
};

jest.unstable_mockModule('../../src/services/match-team-stats.service.js', () => ({
    ...mockMatchTeamStatsService
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
    teamId: 10,
    possession: 55,
    shots: 12,
    shotsOnTarget: 5,
    fouls: 10,
    offsides: 2,
    corners: 6,
    freeKicks: 12,
    passes: 500,
    completedPasses: 430,
    crosses: 15,
    interceptions: 8,
    tackles: 14,
    saves: 3,
    yellowCards: 2,
    redCards: 0,
};

const mockStatsWithRelations = {
    ...mockStatsItem,
    match: { id: 1, dateTime: '2026-09-01T20:00:00.000Z' },
    team: { id: 10, name: 'Real Madrid' },
};

const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

describe('Match Team Stats Routes Integration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        consoleErrorSpy.mockClear();
    });

    afterAll(() => {
        consoleErrorSpy.mockRestore();
    });

    describe('GET /matches/:id/statistics', () => {
        it('should return all team stats for a given match', async () => {
            mockMatchTeamStatsService.getStatsByMatch.mockResolvedValue([
                mockStatsWithRelations,
            ] as never);
            const res = await request(app).get('/matches/1/statistics');
            expect(res.status).toBe(200);
            expect(res.body).toEqual([mockStatsWithRelations]);
            expect(mockMatchTeamStatsService.getStatsByMatch).toHaveBeenCalledWith(1);
        });

        it('should return 400 if the match ID parameter is not a valid number', async () => {
            const res = await request(app).get('/matches/abc/statistics');
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
            expect(res.body.errors[0].path).toContain('id');
            expect(mockMatchTeamStatsService.getStatsByMatch).not.toHaveBeenCalled();
        });

        it('should return 500 if the service encounters an error', async () => {
            mockMatchTeamStatsService.getStatsByMatch.mockRejectedValue(
                new Error('Database disconnect') as never
            );
            const res = await request(app).get('/matches/1/statistics');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error obtaining match team stats' });
        });
    });

    describe('POST /matches/:id/statistics', () => {
        const validPayload = {
            teamId: 10,
            possession: 55,
            shots: 12,
            shotsOnTarget: 5,
            fouls: 10,
            offsides: 2,
            corners: 6,
            freeKicks: 12,
            passes: 500,
            completedPasses: 430,
            crosses: 15,
            interceptions: 8,
            tackles: 14,
            saves: 3,
            yellowCards: 2,
            redCards: 0,
        };

        it('should create team stats entry and return 201 status code', async () => {
            mockMatchTeamStatsService.addTeamStats.mockResolvedValue(
                mockStatsWithRelations as never
            );
            const res = await request(app)
                .post('/matches/1/statistics')
                .send(validPayload);
            expect(res.status).toBe(201);
            expect(res.body).toEqual(mockStatsWithRelations);
            expect(mockMatchTeamStatsService.addTeamStats).toHaveBeenCalledWith(1, validPayload);
        });

        it('should return 400 if the match ID is invalid', async () => {
            const res = await request(app)
                .post('/matches/invalid-id/statistics')
                .send(validPayload);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
            expect(res.body.errors[0].path).toContain('id');
            expect(mockMatchTeamStatsService.addTeamStats).not.toHaveBeenCalled();
        });

        it('should return 400 if schema validation fails (e.g. negative values or missing fields)', async () => {
            const invalidPayload = {
                teamId: 10,
                possession: -10,
            };
            const res = await request(app)
                .post('/matches/1/statistics')
                .send(invalidPayload);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
            expect(mockMatchTeamStatsService.addTeamStats).not.toHaveBeenCalled();
        });

        it('should return 400 or 404 if the specified match or team does not exist', async () => {
            mockMatchTeamStatsService.addTeamStats.mockRejectedValue(
                new Error('Match with ID 999 does not exist') as never
            );
            const res = await request(app)
                .post('/matches/999/statistics')
                .send(validPayload);
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Match with ID 999 does not exist' });
        });

        it('should return 422 on domain rule conflicts (e.g. team not in match or already registered)', async () => {
            mockMatchTeamStatsService.addTeamStats.mockRejectedValue(
                new Error('Team with ID 10 does not play in match 1') as never
            );
            const res = await request(app)
                .post('/matches/1/statistics')
                .send(validPayload);
            expect(res.status).toBe(422);
            expect(res.body).toEqual({ error: 'Team with ID 10 does not play in match 1' });
        });

        it('should return 500 on unexpected errors', async () => {
            mockMatchTeamStatsService.addTeamStats.mockRejectedValue(
                new Error('Internal server error') as never
            );
            const res = await request(app)
                .post('/matches/1/statistics')
                .send(validPayload);
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error adding team stats to match' });
        });
    });

    describe('PUT /matches/:id/statistics/:statId', () => {
        const validUpdatePayload = {
            possession: 60,
            shots: 15,
        };

        it('should update team stats successfully and return 200', async () => {
            const updatedStats = {
                ...mockStatsWithRelations,
                possession: 60,
                shots: 15,
            };
            mockMatchTeamStatsService.updateTeamStats.mockResolvedValue(
                updatedStats as never
            );
            const res = await request(app)
                .put('/matches/1/statistics/1')
                .send(validUpdatePayload);
            expect(res.status).toBe(200);
            expect(res.body).toEqual(updatedStats);
            expect(mockMatchTeamStatsService.updateTeamStats).toHaveBeenCalledWith(
                1,
                1,
                validUpdatePayload
            );
        });

        it('should return 400 if URL parameter is an invalid number', async () => {
            const res = await request(app)
                .put('/matches/1/statistics/abc')
                .send(validUpdatePayload);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
            expect(res.body.errors[0].path).toContain('statId');
            expect(mockMatchTeamStatsService.updateTeamStats).not.toHaveBeenCalled();
        });

        it('should return 400 if update payload fails validation', async () => {
            const res = await request(app)
                .put('/matches/1/statistics/1')
                .send({ possession: 150 });
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
            expect(mockMatchTeamStatsService.updateTeamStats).not.toHaveBeenCalled();
        });

        it('should return 404 if the stats entry is not found', async () => {
            mockMatchTeamStatsService.updateTeamStats.mockRejectedValue(
                new Error('Stats entry with ID 999 was not found for match 1') as never
            );
            const res = await request(app)
                .put('/matches/1/statistics/999')
                .send(validUpdatePayload);
            expect(res.status).toBe(404);
            expect(res.body).toEqual({
                error: 'Stats entry with ID 999 was not found for match 1',
            });
        });

        it('should return 500 on unexpected service failure', async () => {
            mockMatchTeamStatsService.updateTeamStats.mockRejectedValue(
                new Error('Unexpected DB error') as never
            );
            const res = await request(app)
                .put('/matches/1/statistics/1')
                .send(validUpdatePayload);
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error updating team stats' });
        });
    });

    describe('DELETE /matches/:id/statistics/:statId', () => {
        it('should remove team stats entry and return 204 status', async () => {
            mockMatchTeamStatsService.removeTeamStats.mockResolvedValue(
                mockStatsItem as never
            );
            const res = await request(app).delete('/matches/1/statistics/1');
            expect(res.status).toBe(204);
            expect(res.body).toEqual({});
            expect(mockMatchTeamStatsService.removeTeamStats).toHaveBeenCalledWith(1, 1);
        });

        it('should return 400 if match ID or stats ID are not valid numbers', async () => {
            const res = await request(app).delete('/matches/xyz/statistics/1');
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
            expect(res.body.errors[0].path).toContain('id');
            expect(mockMatchTeamStatsService.removeTeamStats).not.toHaveBeenCalled();
        });

        it('should return 404 if team stats entry to delete is not found', async () => {
            mockMatchTeamStatsService.removeTeamStats.mockRejectedValue(
                new Error('Stats entry with ID 999 was not found for match 1') as never
            );
            const res = await request(app).delete('/matches/1/statistics/999');
            expect(res.status).toBe(404);
            expect(res.body).toEqual({
                error: 'Stats entry with ID 999 was not found for match 1',
            });
        });

        it('should return 500 on unexpected error during deletion', async () => {
            mockMatchTeamStatsService.removeTeamStats.mockRejectedValue(
                new Error('Database delete failure') as never
            );
            const res = await request(app).delete('/matches/1/statistics/1');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error removing team stats' });
        });
    });
});