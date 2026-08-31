import type { Request, Response } from 'express';
import * as matchService from '../services/match.service.js';
import { createMatchWithDbValidation, updateMatchWithDbValidation } from '../schemas/match.schema.js';
import { prisma } from '../config/prisma.js';
import z from 'zod';

export async function getMatches(req: Request, res: Response) {
    try {
        const matches = await matchService.getAll();
        res.json(matches);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error obtaining matches' });
    }
}

export async function getMatchById(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid match ID' });
        }
        const match = await matchService.getById(id);
        if (!match) {
            return res.status(404).json({ error: 'Match not found' });
        }
        res.json(match);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error obtaining match' });
    }
}

export async function createMatch(req: Request, res: Response) {
    try {
        const validatedData = await createMatchWithDbValidation(prisma).parseAsync(req.body);
        const newMatch = await matchService.create(validatedData);
        res.status(201).json(newMatch);
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        console.error(error);
        res.status(500).json({ error: 'Error creating match' });
    }
}

export async function updateMatch(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid match ID' });
        }
        const validatedData = await updateMatchWithDbValidation(prisma).parseAsync(req.body);
        const updatedMatch = await matchService.update(id, validatedData);
        res.json(updatedMatch);
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        console.error(error);
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
            return res.status(404).json({ error: 'Match not found' });
        }
        res.status(500).json({ error: 'Error updating match' });
    }
}

export async function deleteMatch(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid match ID' });
        }
        await matchService.deleteMatch(id);
        res.status(204).send();
    } catch (error: unknown) {
        console.error(error);
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
            return res.status(404).json({ error: 'Match not found' });
        }
        res.status(500).json({ error: 'Error deleting match' });
    }
}