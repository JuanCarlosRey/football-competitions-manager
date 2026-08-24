import type { Request, Response } from 'express';
import * as competitionService from '../services/competition.service.js';

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
        const { name, organization } = req.body;
        if (!name || typeof name !== 'string') {
            return res.status(400).json({ error: 'Field "name" is required and must be a string' });
        }
        const newCompetition = await competitionService.create({ name, organization });
        res.status(201).json(newCompetition);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error creating competition' });
    }
}

export async function updateCompetition(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid competition ID' });
        }
        const { name, organization } = req.body;
        const updatedCompetition = await competitionService.update(id, { name, organization });
        res.json(updatedCompetition);
    } catch (error: any) {
        console.error(error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Competition not found' });
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
    } catch (error: any) {
        console.error(error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Competition not found' });
        }
        res.status(500).json({ error: 'Error deleting competition' });
    }
}