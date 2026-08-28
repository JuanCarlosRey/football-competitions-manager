import type { Request, Response } from 'express';
import * as competitionService from '../services/competition.service.js';
import { createCompetitionSchema, updateCompetitionSchema } from '../schemas/competition.schema.js';

export async function getCompetitions(req: Request, res: Response) {
    try {
        const competitions = await competitionService.getAll();
        res.json(competitions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error obtaining competitions' });
    }
}

export async function getCompetitionById(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid competition ID' });
        }
        const competition = await competitionService.getById(id);
        if (!competition) {
            return res.status(404).json({ error: 'Competition not found' });
        }
        res.json(competition);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error obtaining competition' });
    }
}

export async function createCompetition(req: Request, res: Response) {
    try {
        const validation = createCompetitionSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: validation.error.issues[0].message });
        }
        const newCompetition = await competitionService.create(validation.data);
        res.status(201).json(newCompetition);
    } catch (error: unknown) {
        console.error(error);
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2003') {
            return res.status(400).json({ error: 'The specified organizationId does not exist' });
        }
        res.status(500).json({ error: 'Error creating competition' });
    }
}

export async function updateCompetition(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid competition ID' });
        }
        const validation = updateCompetitionSchema.safeParse(req.body);
        if (!validation.success) {
            return res.status(400).json({ error: validation.error.issues[0].message });
        }
        const updatedCompetition = await competitionService.update(id, validation.data);
        res.json(updatedCompetition);
    } catch (error: unknown) {
        console.error(error);
        if (typeof error === 'object' && error !== null && 'code' in error) {
            if (error.code === 'P2025') {
                return res.status(404).json({ error: 'Competition not found' });
            }
            if (error.code === 'P2003') {
                return res.status(400).json({ error: 'The specified organizationId does not exist' });
            }
        }
        res.status(500).json({ error: 'Error updating competition' });
    }
}

export async function deleteCompetition(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid competition ID' });
        }
        await competitionService.deleteCompetition(id);
        res.status(204).send();
    } catch (error: unknown) {
        console.error(error);
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
            return res.status(404).json({ error: 'Competition not found' });
        }
        res.status(500).json({ error: 'Error deleting competition' });
    }
}