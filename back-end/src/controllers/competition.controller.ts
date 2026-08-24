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