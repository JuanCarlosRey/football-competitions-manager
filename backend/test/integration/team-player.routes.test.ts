import { jest, describe, beforeEach, it, expect, afterAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';

process.env.DATABASE_URL = 'postgresql://mock:mock@localhost:5432/mock_db';

const mockTeamPlayerService = {
    getPlayersByTeam: jest.fn(),
    addPlayerToTeam: jest.fn(),
    updatePlayerDates: jest.fn(),
    removePlayerFromTeam: jest.fn(),
    getPlayerCareer: jest.fn(),
};

jest.unstable_mockModule('../../src/services/team-player.service.js', () => ({
    ...mockTeamPlayerService,
}));

const { default: teamPlayerRouter } = await import(
    '../../src/routes/team-player.routes.js'
);

const app = express();
app.use(express.json());
app.use('/teams', teamPlayerRouter);
app.use('/players', teamPlayerRouter);

const mockStartDate = '2023-01-01T00:00:00.000Z';
const mockEndDate = '2024-01-01T00:00:00.000Z';

const mockTeamPlayer = {
    id: 1,
    teamId: 10,
    playerId: 100,
    startDate: mockStartDate,
    endDate: null,
    team: { id: 10, name: 'Real Madrid' },
    player: { id: 100, firstName: 'Luka', lastName: 'Modric' },
};

const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

describe('TeamPlayer Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        consoleErrorSpy.mockClear();
    });

    afterAll(() => {
        consoleErrorSpy.mockRestore();
    });

    describe('GET /teams/:teamId/players', () => {
        it('should return all players for a given team ID', async () => {
            mockTeamPlayerService.getPlayersByTeam.mockResolvedValue([
                mockTeamPlayer,
            ] as never);
            const res = await request(app).get('/teams/10/players');
            expect(res.status).toBe(200);
            expect(res.body).toEqual([mockTeamPlayer]);
            expect(mockTeamPlayerService.getPlayersByTeam).toHaveBeenCalledWith(10);
        });

        it('should return 400 if teamId is invalid', async () => {
            const res = await request(app).get('/teams/abc/players');
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Invalid team ID' });
            expect(mockTeamPlayerService.getPlayersByTeam).not.toHaveBeenCalled();
        });

        it('should return 500 if service fails', async () => {
            mockTeamPlayerService.getPlayersByTeam.mockRejectedValue(
                new Error('DB Error') as never
            );
            const res = await request(app).get('/teams/10/players');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error obtaining team players' });
        });
    });

    describe('POST /teams/:teamId/players', () => {
        it('should add a player to a team and return 201', async () => {
            const payload = {
                playerId: 100,
                startDate: mockStartDate,
            };
            mockTeamPlayerService.addPlayerToTeam.mockResolvedValue(
                mockTeamPlayer as never
            );
            const res = await request(app)
                .post('/teams/10/players')
                .send(payload);
            expect(res.status).toBe(201);
            expect(res.body).toEqual(mockTeamPlayer);
            expect(mockTeamPlayerService.addPlayerToTeam).toHaveBeenCalledWith(10, {
                playerId: 100,
                startDate: new Date(mockStartDate),
            });
        });

        it('should return 400 if teamId is invalid', async () => {
            const res = await request(app)
                .post('/teams/abc/players')
                .send({ playerId: 100, startDate: mockStartDate });
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Invalid team ID' });
            expect(mockTeamPlayerService.addPlayerToTeam).not.toHaveBeenCalled();
        });

        it('should return 400 if body validation fails', async () => {
            const res = await request(app)
                .post('/teams/10/players')
                .send({ startDate: mockStartDate }); // Missing playerId
            expect(res.status).toBe(400);
            expect(res.body).toEqual({
                errors: [
                    {
                        code: 'invalid_type',
                        expected: 'number',
                        message: 'The "playerId" field is required',
                        path: ['playerId'],
                    },
                ],
            });
            expect(mockTeamPlayerService.addPlayerToTeam).not.toHaveBeenCalled();
        });

        it('should return 409 if player is already active in the team', async () => {
            mockTeamPlayerService.addPlayerToTeam.mockRejectedValue(
                new Error('The player is already active in this team') as never
            );
            const res = await request(app)
                .post('/teams/10/players')
                .send({ playerId: 100, startDate: mockStartDate });
            expect(res.status).toBe(409);
            expect(res.body).toEqual({
                error: 'The player is already active in this team',
            });
        });

        it('should return 404 if foreign key constraint fails (P2003)', async () => {
            mockTeamPlayerService.addPlayerToTeam.mockRejectedValue({
                code: 'P2003',
            } as never);
            const res = await request(app)
                .post('/teams/10/players')
                .send({ playerId: 999, startDate: mockStartDate });
            expect(res.status).toBe(404);
            expect(res.body).toEqual({
                error: 'Team or player not found',
            });
        });

        it('should return 500 if service fails with generic error', async () => {
            mockTeamPlayerService.addPlayerToTeam.mockRejectedValue(
                new Error('DB Error') as never
            );
            const res = await request(app)
                .post('/teams/10/players')
                .send({ playerId: 100, startDate: mockStartDate });
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error adding player to team' });
        });
    });

    describe('PUT /teams/:teamId/players/:playerId', () => {
        it('should update player contract dates and return 200', async () => {
            const payload = { endDate: mockEndDate };
            const updatedRecord = { ...mockTeamPlayer, endDate: mockEndDate };
            mockTeamPlayerService.updatePlayerDates.mockResolvedValue(
                updatedRecord as never
            );
            const res = await request(app)
                .put('/teams/10/players/100')
                .send(payload);
            expect(res.status).toBe(200);
            expect(res.body).toEqual(updatedRecord);
            expect(mockTeamPlayerService.updatePlayerDates).toHaveBeenCalledWith(
                10,
                100,
                { endDate: new Date(mockEndDate) }
            );
        });

        it('should return 400 if teamId or playerId is invalid', async () => {
            const res = await request(app)
                .put('/teams/10/players/abc')
                .send({ endDate: mockEndDate });
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Invalid team ID or player ID' });
            expect(mockTeamPlayerService.updatePlayerDates).not.toHaveBeenCalled();
        });

        it('should return 404 if active relation is not found', async () => {
            mockTeamPlayerService.updatePlayerDates.mockRejectedValue(
                new Error('No active relation found between this team and player') as never
            );
            const res = await request(app)
                .put('/teams/10/players/100')
                .send({ endDate: mockEndDate });
            expect(res.status).toBe(404);
            expect(res.body).toEqual({
                error: 'No active relation found between this team and player',
            });
        });

        it('should return 500 if service fails', async () => {
            mockTeamPlayerService.updatePlayerDates.mockRejectedValue(
                new Error('DB Error') as never
            );
            const res = await request(app)
                .put('/teams/10/players/100')
                .send({ endDate: mockEndDate });
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error updating player dates' });
        });
    });

    describe('DELETE /teams/:teamId/players/:playerId', () => {
        it('should remove player from team and return 204', async () => {
            mockTeamPlayerService.removePlayerFromTeam.mockResolvedValue(
                mockTeamPlayer as never
            );
            const res = await request(app).delete('/teams/10/players/100');
            expect(res.status).toBe(204);
            expect(res.body).toEqual({});
            expect(mockTeamPlayerService.removePlayerFromTeam).toHaveBeenCalledWith(
                10,
                100
            );
        });

        it('should return 400 if parameters are invalid', async () => {
            const res = await request(app).delete('/teams/abc/players/100');
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Invalid team ID or player ID' });
            expect(mockTeamPlayerService.removePlayerFromTeam).not.toHaveBeenCalled();
        });

        it('should return 404 if active relation is not found', async () => {
            mockTeamPlayerService.removePlayerFromTeam.mockRejectedValue(
                new Error('No active relation found to remove') as never
            );
            const res = await request(app).delete('/teams/10/players/100');
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'No active relation found to remove' });
        });

        it('should return 500 if service fails', async () => {
            mockTeamPlayerService.removePlayerFromTeam.mockRejectedValue(
                new Error('DB Error') as never
            );
            const res = await request(app).delete('/teams/10/players/100');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error removing player from team' });
        });
    });
});