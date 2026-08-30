import { jest, describe, beforeEach, it, expect, afterAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import type { Stadium } from '@prisma/client';

const mockStadiumService = {
    getAll: jest.fn(),
    getById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deleteStadium: jest.fn(),
};

jest.unstable_mockModule('../../src/services/stadium.service.js', () => ({
    ...mockStadiumService,
}));

const { default: stadiumRouter } = await import(
    '../../src/routes/stadium.routes.js'
);

const app = express();
app.use(express.json());
app.use('/stadiums', stadiumRouter);

const mockStadium: Stadium = {
    id: 1,
    name: 'Santiago Bernabéu',
    capacity: 81044,
    address: 'Av. de Concha Espina 1, Madrid',
};

const mockStadiumWithRelations = {
    ...mockStadium,
    matches: [],
};

const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

describe('Stadium Routes', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        consoleErrorSpy.mockClear();
    });

    afterAll(() => {
        consoleErrorSpy.mockRestore();
    });

    describe('GET /stadiums', () => {
        it('should return all stadiums including their relations', async () => {
            mockStadiumService.getAll.mockResolvedValue([
                mockStadiumWithRelations,
            ] as never);
            const res = await request(app).get('/stadiums');
            expect(res.status).toBe(200);
            expect(res.body).toEqual([mockStadiumWithRelations]);
            expect(mockStadiumService.getAll).toHaveBeenCalledTimes(1);
        });

        it('should return 500 if the service fails', async () => {
            mockStadiumService.getAll.mockRejectedValue(new Error('DB error') as never);
            const res = await request(app).get('/stadiums');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error obtaining stadiums' });
        });
    });

    describe('GET /stadiums/:id', () => {
        it('should return the stadium if it exists', async () => {
            mockStadiumService.getById.mockResolvedValue(
                mockStadiumWithRelations as never
            );
            const res = await request(app).get('/stadiums/1');
            expect(res.status).toBe(200);
            expect(res.body.id).toBe(1);
            expect(res.body.name).toBe('Santiago Bernabéu');
            expect(mockStadiumService.getById).toHaveBeenCalledWith(1);
        });

        it('should return 400 if the id is not a number', async () => {
            const res = await request(app).get('/stadiums/abc');
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Invalid stadium ID' });
            expect(mockStadiumService.getById).not.toHaveBeenCalled();
        });

        it('should return 404 if the stadium does not exist', async () => {
            mockStadiumService.getById.mockResolvedValue(null as never);
            const res = await request(app).get('/stadiums/999');
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'Stadium not found' });
        });

        it('should return 500 if the service fails', async () => {
            mockStadiumService.getById.mockRejectedValue(new Error('DB error') as never);
            const res = await request(app).get('/stadiums/1');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error obtaining stadium' });
        });
    });

    describe('POST /stadiums', () => {
        it('should return 201 and the created stadium', async () => {
            const input = {
                name: 'Santiago Bernabéu',
                capacity: 81044,
                address: 'Av. de Concha Espina 1, Madrid',
            };
            const created = {
                ...mockStadium,
                id: 2,
            };
            mockStadiumService.create.mockResolvedValue(created as never);
            const res = await request(app)
                .post('/stadiums')
                .send(input);
            expect(res.status).toBe(201);
            expect(res.body.id).toBe(2);
            expect(mockStadiumService.create).toHaveBeenCalledWith(input);
        });

        it('should return 400 if validation fails due to missing required fields', async () => {
            const res = await request(app)
                .post('/stadiums')
                .send({ capacity: 81044 });
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
            expect(mockStadiumService.create).not.toHaveBeenCalled();
        });

        it('should return 400 if validation fails due to negative capacity', async () => {
            const res = await request(app)
                .post('/stadiums')
                .send({
                    name: 'Santiago Bernabéu',
                    capacity: -500,
                    address: 'Av. de Concha Espina 1, Madrid',
                });
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
            expect(mockStadiumService.create).not.toHaveBeenCalled();
        });

        it('should return 500 if the service fails', async () => {
            mockStadiumService.create.mockRejectedValue(new Error('DB error') as never);
            const res = await request(app)
                .post('/stadiums')
                .send({
                    name: 'Santiago Bernabéu',
                    capacity: 81044,
                    address: 'Av. de Concha Espina 1, Madrid',
                });
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error creating stadium' });
        });
    });

    describe('PUT /stadiums/:id', () => {
        it('should return 200 and the updated stadium', async () => {
            const input = { capacity: 85000 };
            const updated = { ...mockStadium, capacity: 85000 };
            mockStadiumService.update.mockResolvedValue(updated as never);
            const res = await request(app)
                .put('/stadiums/1')
                .send(input);
            expect(res.status).toBe(200);
            expect(res.body.id).toBe(1);
            expect(mockStadiumService.update).toHaveBeenCalledWith(1, input);
        });

        it('should return 400 if the id is invalid', async () => {
            const res = await request(app)
                .put('/stadiums/abc')
                .send({ name: 'Updated Name' });
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Invalid stadium ID' });
        });

        it('should return 400 if validation fails due to invalid field type', async () => {
            const res = await request(app)
                .put('/stadiums/1')
                .send({ capacity: -100 });
            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
            expect(mockStadiumService.update).not.toHaveBeenCalled();
        });

        it('should return 404 if the stadium does not exist (P2025)', async () => {
            const prismaError = { code: 'P2025' };
            mockStadiumService.update.mockRejectedValue(prismaError as never);
            const res = await request(app)
                .put('/stadiums/999')
                .send({ name: 'Nonexistent Stadium' });
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'Stadium not found' });
        });

        it('should return 500 if the service fails', async () => {
            mockStadiumService.update.mockRejectedValue(new Error('DB error') as never);
            const res = await request(app)
                .put('/stadiums/1')
                .send({ name: 'Updated Name' });
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error updating stadium' });
        });
    });

    describe('DELETE /stadiums/:id', () => {
        it('should return 204 when deleting successfully', async () => {
            mockStadiumService.deleteStadium.mockResolvedValue(mockStadium as never);
            const res = await request(app).delete('/stadiums/1');
            expect(res.status).toBe(204);
            expect(res.body).toEqual({});
            expect(mockStadiumService.deleteStadium).toHaveBeenCalledWith(1);
        });

        it('should return 400 if the id is invalid', async () => {
            const res = await request(app).delete('/stadiums/abc');
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'Invalid stadium ID' });
        });

        it('should return 404 if the stadium does not exist (P2025)', async () => {
            const prismaError = { code: 'P2025' };
            mockStadiumService.deleteStadium.mockRejectedValue(prismaError as never);
            const res = await request(app).delete('/stadiums/999');
            expect(res.status).toBe(404);
            expect(res.body).toEqual({ error: 'Stadium not found' });
        });

        it('should return 500 if the service fails', async () => {
            mockStadiumService.deleteStadium.mockRejectedValue(
                new Error('DB error') as never
            );
            const res = await request(app).delete('/stadiums/1');
            expect(res.status).toBe(500);
            expect(res.body).toEqual({ error: 'Error deleting stadium' });
        });
    });
});