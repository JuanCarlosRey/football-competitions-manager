import type { Request, Response } from 'express';
import z from 'zod';
import * as matchPlayerStatsService from '../services/match-player-stats.service.js';
import {
    matchPlayerStatsParamsSchema,
    createMatchPlayerStatsSchema,
    updateMatchPlayerStatsSchema,
} from '../schemas/match-player-stats.schema.js';

export async function getStatsByMatch(req: Request, res: Response) {
    try {
        const { id: matchId } = matchPlayerStatsParamsSchema.parse(req.params);
        const stats = await matchPlayerStatsService.getStatsByMatch(matchId);
        res.json(stats);
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        console.error(error);
        res.status(500).json({ error: 'Error obtaining match player stats' });
    }
}

export async function addPlayerStats(req: Request, res: Response) {
    try {
        const { id: matchId } = matchPlayerStatsParamsSchema.parse(req.params);
        const validatedData = createMatchPlayerStatsSchema.parse(req.body);
        const newStats = await matchPlayerStatsService.addPlayerStats(matchId, validatedData);
        res.status(201).json(newStats);
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        if (error instanceof Error) {
            if (error.message.includes('does not exist')) {
                return res.status(400).json({ error: error.message });
            }
            if (error.message.includes('is not part of the lineup')) {
                return res.status(422).json({ error: error.message });
            }
            if (error.message.includes('already registered')) {
                return res.status(409).json({ error: error.message });
            }
        }
        console.error(error);
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2003') {
            return res.status(404).json({ error: 'Match or player not found' });
        }
        res.status(500).json({ error: 'Error adding player stats to match' });
    }
}

export async function updatePlayerStats(req: Request, res: Response) {
    try {
        const { id: matchId, statId } = matchPlayerStatsParamsSchema.parse(req.params);
        if (!statId) {
            return res.status(400).json({ error: 'The "statId" parameter is required' });
        }
        const validatedData = updateMatchPlayerStatsSchema.parse(req.body);
        const updatedStats = await matchPlayerStatsService.updatePlayerStats(
            matchId,
            statId,
            validatedData
        );
        res.json(updatedStats);
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        if (error instanceof Error && error.message.includes('was not found')) {
            return res.status(404).json({ error: error.message });
        }
        console.error(error);
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
            return res.status(404).json({ error: 'Player stats entry not found' });
        }
        res.status(500).json({ error: 'Error updating player stats' });
    }
}

export async function removePlayerStats(req: Request, res: Response) {
    try {
        const { id: matchId, statId } = matchPlayerStatsParamsSchema.parse(req.params);
        if (!statId) {
            return res.status(400).json({ error: 'The "statId" parameter is required' });
        }
        await matchPlayerStatsService.removePlayerStats(matchId, statId);
        res.status(204).send();
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        if (error instanceof Error && error.message.includes('was not found')) {
            return res.status(404).json({ error: error.message });
        }
        console.error(error);
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
            return res.status(404).json({ error: 'Player stats entry not found' });
        }
        res.status(500).json({ error: 'Error removing player stats' });
    }
}