import type { Request, Response } from 'express';
import * as stadiumService from '../services/stadium.service.js';
import { createStadiumSchema, updateStadiumSchema } from '../schemas/stadium.schema.js';
import z from 'zod';

export async function getStadiums(req: Request, res: Response) {
    try {
        const stadiums = await stadiumService.getAll();
        res.json(stadiums);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error obtaining stadiums' });
    }
}

export async function getStadiumById(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid stadium ID' });
        }
        const stadium = await stadiumService.getById(id);
        if (!stadium) {
            return res.status(404).json({ error: 'Stadium not found' });
        }
        res.json(stadium);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error obtaining stadium' });
    }
}

export async function createStadium(req: Request, res: Response) {
    try {
        const validatedData = createStadiumSchema.parse(req.body);
        const newStadium = await stadiumService.create(validatedData);
        res.status(201).json(newStadium);
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        console.error(error);
        res.status(500).json({ error: 'Error creating stadium' });
    }
}

export async function updateStadium(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid stadium ID' });
        }
        const validatedData = updateStadiumSchema.parse(req.body);
        const updatedStadium = await stadiumService.update(id, validatedData);
        res.json(updatedStadium);
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        console.error(error);
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
            return res.status(404).json({ error: 'Stadium not found' });
        }
        res.status(500).json({ error: 'Error updating stadium' });
    }
}

export async function deleteStadium(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid stadium ID' });
        }
        await stadiumService.deleteStadium(id);
        res.status(204).send();
    } catch (error: unknown) {
        console.error(error);
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
            return res.status(404).json({ error: 'Stadium not found' });
        }
        res.status(500).json({ error: 'Error deleting stadium' });
    }
}