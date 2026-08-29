import { jest, describe, beforeEach, it, expect, afterAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import type { Team } from '@prisma/client';

const mockTeamService = {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deleteTeam: jest.fn(),
};

jest.unstable_mockModule('../../src/services/team.service.js', () => ({
    ...mockTeamService,
}));

const { default: teamRouter } = await import(
    '../../src/routes/team.routes.js'
);

const app = express();
app.use(express.json());
app.use('/teams', teamRouter);

const mockTeam: Team = {
    id: 1,
    name: 'Real Madrid',
    abbreviation: 'RMA',
    crest: 'https://example.com/crests/rma.png',
    president: 'Florentino Pérez',
};

const mockTeamWithRelations = {
    ...mockTeam,
    homeMatches: [],
    awayMatches: [],
};

const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

describe('Team Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        consoleErrorSpy.mockClear();
    });

    afterAll(() => {
        consoleErrorSpy.mockRestore();
    });

    describe('GET /teams', () => {
        it('should return all teams including their relations', async () => {
            mockTeamService.getAll.mockResolvedValue([
                mockTeamWithRelations,
            ] as never);
            const res = await request(app).get('/teams');
            expect(res.status).toBe(200);
            expect(res.body).toEqual([mockTeamWithRelations]);
            expect(mockTeamService.getAll).toHaveBeenCalledTimes(1);
        });

        it('should return 500 if the service fails', async () => {
            mockTeamService.getAll.mockRejectedValue(new Error('DB error') as never);
            const res = await request(app).get('/teams');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error obtaining teams' });
        });
    });

    describe('GET /teams/:id', () => {
        it('should return the team if it exists', async () => {
            mockTeamService.getById.mockResolvedValue(
                mockTeamWithRelations as never
            );
            const res = await request(app).get('/teams/1');
            expect(res.status).toBe(200);
            expect(res.body.id).toBe(1);
            expect(res.body.name).toBe('Real Madrid');
            expect(mockTeamService.getById).toHaveBeenCalledWith(1);
        });

        it('should return 400 if the id is not a number', async () => {
            const res = await request(app).get('/teams/abc');
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Invalid team ID' });
            expect(mockTeamService.getById).not.toHaveBeenCalled();
        });

        it('should return 404 if the team does not exist', async () => {
            mockTeamService.getById.mockResolvedValue(null as never);
            const res = await request(app).get('/teams/999');
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'Team not found' });
        });

        it('should return 500 if the service fails', async () => {
            mockTeamService.getById.mockRejectedValue(new Error('DB error') as never);
            const res = await request(app).get('/teams/1');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error obtaining team' });
        });
    });

    describe('POST /teams', () => {
        it('should return 201 and the created team', async () => {
            const input = {
                name: 'Real Madrid',
                abbreviation: 'RMA',
                crest: 'https://example.com/crests/rma.png',
                president: 'Florentino Pérez',
            };
            const created = {
                ...mockTeam,
                id: 2,
            };
            mockTeamService.create.mockResolvedValue(created as never);
            const res = await request(app)
                .post('/teams')
                .send(input);
            expect(res.status).toBe(201);
            expect(res.body.id).toBe(2);
            expect(mockTeamService.create).toHaveBeenCalledWith(input);
        });

        it('should return 400 if validation fails due to missing required fields', async () => {
            const res = await request(app)
                .post('/teams')
                .send({ abbreviation: 'RMA' });
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
            expect(mockTeamService.create).not.toHaveBeenCalled();
        });

        it('should return 500 if the service fails', async () => {
            mockTeamService.create.mockRejectedValue(new Error('DB error') as never);
            const res = await request(app)
                .post('/teams')
                .send({
                    name: 'Real Madrid',
                    abbreviation: 'RMA',
                });
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error creating team' });
        });
    });

    describe('PUT /teams/:id', () => {
        it('should return 200 and the updated team', async () => {
            const input = { president: 'New President' };
            const updated = { ...mockTeam, president: 'New President' };
            mockTeamService.update.mockResolvedValue(updated as never);
            const res = await request(app)
                .put('/teams/1')
                .send(input);
            expect(res.status).toBe(200);
            expect(res.body.id).toBe(1);
            expect(mockTeamService.update).toHaveBeenCalledWith(1, input);
        });

        it('should return 400 if the id is invalid', async () => {
            const res = await request(app)
                .put('/teams/abc')
                .send({ name: 'Updated Name' });
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Invalid team ID' });
        });

        it('should return 400 if validation fails due to invalid field type', async () => {
            const res = await request(app)
                .put('/teams/1')
                .send({ crest: 'not-a-valid-url' });
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
            expect(mockTeamService.update).not.toHaveBeenCalled();
        });

        it('should return 404 if the team does not exist (P2025)', async () => {
            const prismaError = { code: 'P2025' };
            mockTeamService.update.mockRejectedValue(prismaError as never);
            const res = await request(app)
                .put('/teams/999')
                .send({ name: 'Nonexistent Team' });
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'Team not found' });
        });

        it('should return 500 if the service fails', async () => {
            mockTeamService.update.mockRejectedValue(new Error('DB error') as never);
            const res = await request(app)
                .put('/teams/1')
                .send({ name: 'Updated Name' });
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error updating team' });
        });
    });

    describe('DELETE /teams/:id', () => {
        it('should return 204 when deleting successfully', async () => {
            mockTeamService.deleteTeam.mockResolvedValue(mockTeam as never);
            const res = await request(app).delete('/teams/1');
            expect(res.status).toBe(204);
            expect(res.body).toEqual({});
            expect(mockTeamService.deleteTeam).toHaveBeenCalledWith(1);
        });

        it('should return 400 if the id is invalid', async () => {
            const res = await request(app).delete('/teams/abc');
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Invalid team ID' });
        });

        it('should return 404 if the team does not exist (P2025)', async () => {
            const prismaError = { code: 'P2025' };
            mockTeamService.deleteTeam.mockRejectedValue(prismaError as never);
            const res = await request(app).delete('/teams/999');
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'Team not found' });
        });

        it('should return 500 if the service fails', async () => {
            mockTeamService.deleteTeam.mockRejectedValue(
                new Error('DB error') as never
            );
            const res = await request(app).delete('/teams/1');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error deleting team' });
        });
    });
});