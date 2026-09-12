import type { Request, Response } from 'express';
import z from 'zod';
import * as matchTeamStatsService from '../services/match-team-stats.service.js';
import {
    matchTeamStatsParamsSchema,
    createMatchTeamStatsSchema,
} from '../schemas/match-team-stats.schema.js';

export async function getStatsByMatch(req: Request, res: Response) {
    try {
        const { id: matchId } = matchTeamStatsParamsSchema.parse(req.params);
        const stats = await matchTeamStatsService.getStatsByMatch(matchId);
        res.json(stats);
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        console.error(error);
        res.status(500).json({ error: 'Error obtaining match team stats' });
    }
}

export async function addTeamStats(req: Request, res: Response) {
    try {
        const { id: matchId } = matchTeamStatsParamsSchema.parse(req.params);
        const validatedData = createMatchTeamStatsSchema.parse(req.body);
        const newStats = await matchTeamStatsService.addTeamStats(matchId, validatedData);
        res.status(201).json(newStats);
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        if (error instanceof Error) {
            if (error.message.includes('does not exist')) {
                return res.status(400).json({ error: error.message });
            }
            if (error.message.includes('does not play in match')) {
                return res.status(422).json({ error: error.message });
            }
            if (error.message.includes('already registered')) {
                return res.status(409).json({ error: error.message });
            }
        }
        console.error(error);
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2003') {
            return res.status(404).json({ error: 'Match or team not found' });
        }
        res.status(500).json({ error: 'Error adding team stats to match' });
    }
}

export async function updateTeamStats(req: Request, res: Response) {
    try {
        const { id: matchId, statId } = matchTeamStatsParamsSchema.parse(req.params);
        if (!statId) {
            return res.status(400).json({ error: 'The "statId" parameter is required' });
        }
        const validatedData = createMatchTeamStatsSchema.partial().parse(req.body);
        const updatedStats = await matchTeamStatsService.updateTeamStats(
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
            return res.status(404).json({ error: 'Team stats entry not found' });
        }
        res.status(500).json({ error: 'Error updating team stats' });
    }
}

export async function removeTeamStats(req: Request, res: Response) {
    try {
        const { id: matchId, statId } = matchTeamStatsParamsSchema.parse(req.params);
        if (!statId) {
            return res.status(400).json({ error: 'The "statId" parameter is required' });
        }
        await matchTeamStatsService.removeTeamStats(matchId, statId);
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
            return res.status(404).json({ error: 'Team stats entry not found' });
        }
        res.status(500).json({ error: 'Error removing team stats' });
    }
}