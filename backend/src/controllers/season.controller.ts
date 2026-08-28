import type { Request, Response } from 'express';
import * as seasonService from '../services/season.service.js';
import { createSeasonSchema, updateSeasonSchema } from '../schemas/season.schema.js';
import z from 'zod';

export async function getSeasons(req: Request, res: Response) {
    try {
        const seasons = await seasonService.getAll();
        res.json(seasons);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error obtaining seasons' });
    }
}

export async function getSeasonById(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid season ID' });
        }
        const season = await seasonService.getById(id);
        if (!season) {
            return res.status(404).json({ error: 'Season not found' });
        }
        res.json(season);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error obtaining season' });
    }
}

export async function createSeason(req: Request, res: Response) {
    try {
        const validatedData = createSeasonSchema.parse(req.body);
        const newSeason = await seasonService.create({
            startDate: validatedData.startDate,
            endDate: validatedData.endDate,
            competition: {
                connect: { id: validatedData.competitionId },
            },
        });
        res.status(201).json(newSeason);
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        console.error(error);
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
            return res.status(404).json({ error: 'Associated competition not found' });
        }
        res.status(500).json({ error: 'Error creating season' });
    }
}

export async function updateSeason(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid season ID' });
        }
        const validatedData = updateSeasonSchema.parse(req.body);
        const updateData: Parameters<typeof seasonService.update>[1] = {};
        if (validatedData.startDate !== undefined) {
            updateData.startDate = validatedData.startDate;
        }
        if (validatedData.endDate !== undefined) {
            updateData.endDate = validatedData.endDate;
        }
        if (validatedData.competitionId !== undefined) {
            updateData.competition = {
                connect: { id: validatedData.competitionId },
            };
        }
        const updatedSeason = await seasonService.update(id, updateData);
        res.json(updatedSeason);
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        console.error(error);
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
            return res.status(404).json({ error: 'Season or associated competition not found' });
        }
        res.status(500).json({ error: 'Error updating season' });
    }
}

export async function deleteSeason(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid season ID' });
        }
        await seasonService.deleteSeason(id);
        res.status(204).send();
    } catch (error: unknown) {
        console.error(error);
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
            return res.status(404).json({ error: 'Season not found' });
        }
        res.status(500).json({ error: 'Error deleting season' });
    }
}