import type { Request, Response } from 'express';
import z from 'zod';
import * as matchLineupService from '../services/match-lineup.service.js';
import {
    matchLineupParamsSchema,
    createMatchLineupSchema,
    updateMatchLineupItemSchema,
} from '../schemas/match-lineup.schema.js';

export async function getLineupsByMatch(req: Request, res: Response) {
    try {
        const { id: matchId } = matchLineupParamsSchema.parse(req.params);
        const lineups = await matchLineupService.getLineupsByMatch(matchId);
        res.json(lineups);
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        console.error(error);
        res.status(500).json({ error: 'Error obtaining match lineups' });
    }
}

export async function addTeamLineup(req: Request, res: Response) {
    try {
        const { id: matchId } = matchLineupParamsSchema.parse(req.params);
        const validatedData = createMatchLineupSchema.parse(req.body);
        const newLineup = await matchLineupService.addTeamLineup(matchId, validatedData);
        res.status(201).json(newLineup);
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        if (error instanceof Error) {
            if (
                error.message.includes('does not exist') ||
                error.message.includes('not active members')
            ) {
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
            return res.status(404).json({ error: 'Match, team, or player not found' });
        }
        res.status(500).json({ error: 'Error adding team lineup to match' });
    }
}

export async function updateLineupEntry(req: Request, res: Response) {
    try {
        const { id: matchId, lineupId } = matchLineupParamsSchema.parse(req.params);
        if (!lineupId) {
            return res.status(400).json({ error: 'The "lineupId" parameter is required' });
        }
        const validatedData = updateMatchLineupItemSchema.parse(req.body);
        const updatedLineup = await matchLineupService.updateLineupEntry(
            matchId,
            lineupId,
            validatedData
        );
        res.json(updatedLineup);
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        if (error instanceof Error && error.message.includes('was not found')) {
            return res.status(404).json({ error: error.message });
        }
        console.error(error);
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
            return res.status(404).json({ error: 'Lineup entry not found' });
        }
        res.status(500).json({ error: 'Error updating player lineup' });
    }
}

export async function removeLineupEntry(req: Request, res: Response) {
    try {
        const { id: matchId, lineupId } = matchLineupParamsSchema.parse(req.params);
        if (!lineupId) {
            return res.status(400).json({ error: 'The "lineupId" parameter is required' });
        }
        await matchLineupService.removeLineupEntry(matchId, lineupId);
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
            return res.status(404).json({ error: 'Lineup entry not found' });
        }
        res.status(500).json({ error: 'Error removing player from lineup' });
    }
}