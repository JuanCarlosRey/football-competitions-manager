import { jest, describe, beforeEach, it, expect, afterAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import type { Player, PreferredFoot } from '@prisma/client';

const mockPlayerService = {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deletePlayer: jest.fn(),
};

jest.unstable_mockModule('../../src/services/player.service.js', () => ({
    ...mockPlayerService,
}));

const { default: playerRouter } = await import(
    '../../src/routes/player.routes.js'
);

const app = express();
app.use(express.json());
app.use('/players', playerRouter);

const mockPlayer: Player = {
    id: 1,
    firstName: 'Lamine',
    lastName: 'Yamal',
    birthDate: new Date('2007-07-13T00:00:00.000Z'),
    position: 'RW',
    nationality: 'Spain',
    overall: 89,
    height: 1.80,
    weight: 68.0,
    preferredFoot: 'LEFT' as PreferredFoot,
    marketValue: 150000000 as never,
    annualSalary: 15000000 as never,
};

const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

describe('Player Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        consoleErrorSpy.mockClear();
    });

    afterAll(() => {
        consoleErrorSpy.mockRestore();
    });

    describe('GET /players', () => {
        it('should return all players', async () => {
            mockPlayerService.getAll.mockResolvedValue([mockPlayer] as never);
            const res = await request(app).get('/players');
            expect(res.status).toBe(200);
            expect(res.body).toEqual([
                {
                    ...mockPlayer,
                    birthDate: mockPlayer.birthDate.toISOString(),
                },
            ]);
            expect(mockPlayerService.getAll).toHaveBeenCalledTimes(1);
        });

        it('should return 500 if the service fails', async () => {
            mockPlayerService.getAll.mockRejectedValue(new Error('DB error') as never);
            const res = await request(app).get('/players');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error obtaining players' });
        });
    });

    describe('GET /players/:id', () => {
        it('should return the player if it exists', async () => {
            mockPlayerService.getById.mockResolvedValue(mockPlayer as never);
            const res = await request(app).get('/players/1');
            expect(res.status).toBe(200);
            expect(res.body.id).toBe(1);
            expect(res.body.firstName).toBe('Lamine');
            expect(res.body.lastName).toBe('Yamal');
            expect(mockPlayerService.getById).toHaveBeenCalledWith(1);
        });

        it('should return 400 if the id is not a number', async () => {
            const res = await request(app).get('/players/abc');
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Invalid player ID' });
            expect(mockPlayerService.getById).not.toHaveBeenCalled();
        });

        it('should return 404 if the player does not exist', async () => {
            mockPlayerService.getById.mockResolvedValue(null as never);
            const res = await request(app).get('/players/999');
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'Player not found' });
        });

        it('should return 500 if the service fails', async () => {
            mockPlayerService.getById.mockRejectedValue(new Error('DB error') as never);
            const res = await request(app).get('/players/1');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error obtaining player' });
        });
    });

    describe('POST /players', () => {
        const validPayload = {
            firstName: 'Lamine',
            lastName: 'Yamal',
            birthDate: '2007-07-13T00:00:00.000Z',
            position: 'RW',
            nationality: 'Spain',
            overall: 89,
            height: 1.80,
            weight: 68.0,
            preferredFoot: 'LEFT',
            marketValue: 150000000,
            annualSalary: 15000000,
        };

        it('should return 201 and the created player', async () => {
            mockPlayerService.create.mockResolvedValue(mockPlayer as never);
            const res = await request(app)
                .post('/players')
                .send(validPayload);
            expect(res.status).toBe(201);
            expect(res.body.firstName).toBe('Lamine');
            expect(mockPlayerService.create).toHaveBeenCalledWith({
                ...validPayload,
                birthDate: new Date(validPayload.birthDate),
            });
        });

        it('should return 400 if validation fails due to missing fields', async () => {
            const invalidPayload = { ...validPayload };
            delete (invalidPayload as Partial<typeof validPayload>).firstName;
            const res = await request(app)
                .post('/players')
                .send(invalidPayload);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
            expect(mockPlayerService.create).not.toHaveBeenCalled();
        });

        it('should return 400 if overall is out of range', async () => {
            const invalidPayload = { ...validPayload, overall: 150 };
            const res = await request(app)
                .post('/players')
                .send(invalidPayload);
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
            expect(mockPlayerService.create).not.toHaveBeenCalled();
        });

        it('should return 500 if the service fails', async () => {
            mockPlayerService.create.mockRejectedValue(new Error('DB error') as never);
            const res = await request(app)
                .post('/players')
                .send(validPayload);
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error creating player' });
        });
    });

    describe('PUT /players/:id', () => {
        it('should return 200 and the updated player', async () => {
            const updateInput = { overall: 91 };
            const updatedPlayer = { ...mockPlayer, overall: 91 };
            mockPlayerService.update.mockResolvedValue(updatedPlayer as never);
            const res = await request(app)
                .put('/players/1')
                .send(updateInput);
            expect(res.status).toBe(200);
            expect(res.body.overall).toBe(91);
            expect(mockPlayerService.update).toHaveBeenCalledWith(1, updateInput);
        });

        it('should return 400 if the id is invalid', async () => {
            const res = await request(app)
                .put('/players/abc')
                .send({ overall: 90 });
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Invalid player ID' });
        });

        it('should return 404 if the player does not exist (P2025)', async () => {
            const prismaError = { code: 'P2025' };
            mockPlayerService.update.mockRejectedValue(prismaError as never);
            const res = await request(app)
                .put('/players/999')
                .send({ overall: 90 });
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'Player not found' });
        });

        it('should return 500 if the service fails', async () => {
            mockPlayerService.update.mockRejectedValue(new Error('DB error') as never);
            const res = await request(app)
                .put('/players/1')
                .send({ overall: 90 });
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error updating player' });
        });
    });

    describe('DELETE /players/:id', () => {
        it('should return 204 when deleting successfully', async () => {
            mockPlayerService.deletePlayer.mockResolvedValue(mockPlayer as never);
            const res = await request(app).delete('/players/1');
            expect(res.status).toBe(204);
            expect(res.body).toEqual({});
            expect(mockPlayerService.deletePlayer).toHaveBeenCalledWith(1);
        });

        it('should return 400 if the id is invalid', async () => {
            const res = await request(app).delete('/players/abc');
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Invalid player ID' });
        });

        it('should return 404 if the player does not exist (P2025)', async () => {
            const prismaError = { code: 'P2025' };
            mockPlayerService.deletePlayer.mockRejectedValue(prismaError as never);
            const res = await request(app).delete('/players/999');
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'Player not found' });
        });

        it('should return 500 if the service fails', async () => {
            mockPlayerService.deletePlayer.mockRejectedValue(new Error('DB error') as never);
            const res = await request(app).delete('/players/1');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error deleting player' });
        });
    });
});