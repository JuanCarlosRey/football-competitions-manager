import { jest, describe, beforeEach, it, expect, afterAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';

const mockMatchLineupService = {
    getLineupsByMatch: jest.fn(),
    addTeamLineup: jest.fn(),
    updateLineupEntry: jest.fn(),
    removeLineupEntry: jest.fn(),
};

const mockPrisma = {
    player: { findUnique: jest.fn() },
};

jest.unstable_mockModule('../../src/services/match-lineup.service.js', () => ({
    ...mockMatchLineupService,
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

const mockLineupEntry = {
    id: 1,
    matchId: 1,
    teamId: 10,
    playerId: 100,
    starter: true,
    shirtNumber: 10,
    position: 'MIDFIELDER',
};

const mockLineupWithRelations = {
    ...mockLineupEntry,
    team: { id: 10, name: 'Real Madrid' },
    player: { id: 100, name: 'Luka Modric' },
};

const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

describe('Match Lineup Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        consoleErrorSpy.mockClear();
    });

    afterAll(() => {
        consoleErrorSpy.mockRestore();
    });

    describe('GET /matches/:id/lineups', () => {
        it('should return all lineups for a given match', async () => {
            mockMatchLineupService.getLineupsByMatch.mockResolvedValue([
                mockLineupWithRelations,
            ] as never);
            const res = await request(app).get('/matches/1/lineups');
            expect(res.status).toBe(200);
            expect(res.body).toEqual([mockLineupWithRelations]);
            expect(mockMatchLineupService.getLineupsByMatch).toHaveBeenCalledWith(1);
        });

        it('should return 400 if the match ID is invalid', async () => {
            const res = await request(app).get('/matches/abc/lineups');
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
            expect(res.body.errors[0].path).toContain('id');
            expect(mockMatchLineupService.getLineupsByMatch).not.toHaveBeenCalled();
        });

        it('should return 500 if the service fails', async () => {
            mockMatchLineupService.getLineupsByMatch.mockRejectedValue(
                new Error('DB error') as never
            );
            const res = await request(app).get('/matches/1/lineups');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error obtaining match lineups' });
        });
    });

    describe('POST /matches/:id/lineups', () => {
        const validPayload = {
            teamId: 10,
            players: [
                { playerId: 100, starter: true, shirtNumber: 10, position: 'MIDFIELDER' },
            ],
        };

        it('should return 201 and created lineups when payload and players exist', async () => {
            mockPrisma.player.findUnique.mockResolvedValue({ id: 100 } as never);
            mockMatchLineupService.addTeamLineup.mockResolvedValue([
                mockLineupWithRelations,
            ] as never);
            const res = await request(app)
                .post('/matches/1/lineups')
                .send(validPayload);
            expect(res.status).toBe(201);
            expect(res.body).toEqual([mockLineupWithRelations]);
            expect(mockMatchLineupService.addTeamLineup).toHaveBeenCalledWith(1, validPayload);
        });

        it('should return 400 if the match ID is invalid', async () => {
            const res = await request(app)
                .post('/matches/abc/lineups')
                .send(validPayload);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
            expect(res.body.errors[0].path).toContain('id');
            expect(mockMatchLineupService.addTeamLineup).not.toHaveBeenCalled();
        });

        it('should return 400 if schema validation fails (e.g. empty players array)', async () => {
            const invalidPayload = { teamId: 10, players: [] };
            const res = await request(app)
                .post('/matches/1/lineups')
                .send(invalidPayload);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
            expect(mockMatchLineupService.addTeamLineup).not.toHaveBeenCalled();
        });

        it('should return 400 (or 404/422) if a player referenced in the payload does not exist', async () => {
            mockMatchLineupService.addTeamLineup.mockRejectedValue(
                new Error('Player with ID 100 does not exist') as never
            );
            const res = await request(app)
                .post('/matches/1/lineups')
                .send(validPayload);
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Player with ID 100 does not exist' });
        });

        it('should return 422 if service throws a business rule error (e.g. team not in match)', async () => {
            mockPrisma.player.findUnique.mockResolvedValue({ id: 100 } as never);
            mockMatchLineupService.addTeamLineup.mockRejectedValue(
                new Error('Team with ID 10 does not play in match 1') as never
            );
            const res = await request(app)
                .post('/matches/1/lineups')
                .send(validPayload);
            expect(res.status).toBe(422);
            expect(res.body).toEqual({ error: 'Team with ID 10 does not play in match 1' });
        });

        it('should return 500 on unexpected errors', async () => {
            mockPrisma.player.findUnique.mockResolvedValue({ id: 100 } as never);
            mockMatchLineupService.addTeamLineup.mockRejectedValue(
                new Error('Unexpected DB error') as never
            );
            const res = await request(app)
                .post('/matches/1/lineups')
                .send(validPayload);
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error adding team lineup to match' });
        });
    });

    describe('PUT /matches/:id/lineups/:lineupId', () => {
        const validUpdatePayload = {
            starter: false,
            shirtNumber: 14,
        };

        it('should return 200 and updated lineup entry', async () => {
            const updatedEntry = { ...mockLineupWithRelations, starter: false, shirtNumber: 14 };
            mockMatchLineupService.updateLineupEntry.mockResolvedValue(updatedEntry as never);
            const res = await request(app)
                .put('/matches/1/lineups/1')
                .send(validUpdatePayload);
            expect(res.status).toBe(200);
            expect(res.body).toEqual(updatedEntry);
            expect(mockMatchLineupService.updateLineupEntry).toHaveBeenCalledWith(1, 1, validUpdatePayload);
        });

        it('should return 400 if match ID or lineup ID are invalid numbers', async () => {
            const res = await request(app)
                .put('/matches/1/lineups/abc')
                .send(validUpdatePayload);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
            expect(res.body.errors[0].path).toContain('lineupId');
            expect(mockMatchLineupService.updateLineupEntry).not.toHaveBeenCalled();
        });

        it('should return 400 if schema validation fails', async () => {
            const res = await request(app)
                .put('/matches/1/lineups/1')
                .send({ shirtNumber: -5 });
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
            expect(mockMatchLineupService.updateLineupEntry).not.toHaveBeenCalled();
        });

        it('should return 404 if lineup entry is not found for the match', async () => {
            mockMatchLineupService.updateLineupEntry.mockRejectedValue(
                new Error('Lineup entry with ID 999 was not found for match 1') as never
            );
            const res = await request(app)
                .put('/matches/1/lineups/999')
                .send(validUpdatePayload);
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'Lineup entry with ID 999 was not found for match 1' });
        });

        it('should return 500 on unexpected service failure', async () => {
            mockMatchLineupService.updateLineupEntry.mockRejectedValue(
                new Error('DB failure') as never
            );
            const res = await request(app)
                .put('/matches/1/lineups/1')
                .send(validUpdatePayload);
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error updating player lineup' });
        });
    });

    describe('DELETE /matches/:id/lineups/:lineupId', () => {
        it('should return 204 when deleting lineup entry successfully', async () => {
            mockMatchLineupService.removeLineupEntry.mockResolvedValue(mockLineupEntry as never);
            const res = await request(app).delete('/matches/1/lineups/1');
            expect(res.status).toBe(204);
            expect(res.body).toEqual({});
            expect(mockMatchLineupService.removeLineupEntry).toHaveBeenCalledWith(1, 1);
        });

        it('should return 400 if match ID or lineup ID are invalid', async () => {
            const res = await request(app).delete('/matches/abc/lineups/1');
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
            expect(res.body.errors[0].path).toContain('id');
            expect(mockMatchLineupService.removeLineupEntry).not.toHaveBeenCalled();
        });

        it('should return 404 if lineup entry is not found', async () => {
            mockMatchLineupService.removeLineupEntry.mockRejectedValue(
                new Error('Lineup entry with ID 999 was not found for match 1') as never
            );
            const res = await request(app).delete('/matches/1/lineups/999');
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'Lineup entry with ID 999 was not found for match 1' });
        });

        it('should return 500 on unexpected service failure', async () => {
            mockMatchLineupService.removeLineupEntry.mockRejectedValue(
                new Error('DB failure') as never
            );
            const res = await request(app).delete('/matches/1/lineups/1');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error removing player from lineup' });
        });
    });
});