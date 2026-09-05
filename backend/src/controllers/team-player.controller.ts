import type { Request, Response } from 'express';
import * as teamPlayerService from '../services/team-player.service.js';
import {
    createTeamPlayerSchema,
    updateTeamPlayerSchema,
} from '../schemas/team-player.schema.js';
import z from 'zod';

export async function getPlayersByTeam(req: Request, res: Response) {
    try {
        const teamId = Number(req.params.id);
        if (isNaN(teamId)) {
            return res.status(400).json({ error: 'Invalid team ID' });
        }
        const players = await teamPlayerService.getPlayersByTeam(teamId);
        res.json(players);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error obtaining team players' });
    }
}

export async function addPlayerToTeam(req: Request, res: Response) {
    try {
        const teamId = Number(req.params.id);
        if (isNaN(teamId)) {
            return res.status(400).json({ error: 'Invalid team ID' });
        }
        const validatedData = createTeamPlayerSchema.parse(req.body);
        const newAssignment = await teamPlayerService.addPlayerToTeam(teamId, validatedData);
        res.status(201).json(newAssignment);
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        if (error instanceof Error && error.message === 'The player is already active in this team') {
            return res.status(409).json({ error: error.message });
        }
        console.error(error);
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2003') {
            return res.status(404).json({ error: 'Team or Player not found' });
        }
        res.status(500).json({ error: 'Error adding player to team' });
    }
}

export async function updatePlayerDates(req: Request, res: Response) {
    try {
        const teamId = Number(req.params.id);
        const playerId = Number(req.params.playerId);
        if (isNaN(teamId) || isNaN(playerId)) {
            return res.status(400).json({ error: 'Invalid team ID or player ID' });
        }
        const validatedData = updateTeamPlayerSchema.parse(req.body);
        const updatedAssignment = await teamPlayerService.updatePlayerDates(
            teamId,
            playerId,
            validatedData
        );
        res.json(updatedAssignment);
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        if (error instanceof Error && error.message === 'No active relation found between this team and player') {
            return res.status(404).json({ error: error.message });
        }
        console.error(error);
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
            return res.status(404).json({ error: 'Relation not found' });
        }
        res.status(500).json({ error: 'Error updating player dates' });
    }
}

export async function removePlayerFromTeam(req: Request, res: Response) {
    try {
        const teamId = Number(req.params.id);
        const playerId = Number(req.params.playerId);
        if (isNaN(teamId) || isNaN(playerId)) {
            return res.status(400).json({ error: 'Invalid team ID or player ID' });
        }
        await teamPlayerService.removePlayerFromTeam(teamId, playerId);
        res.status(204).send();
    } catch (error: unknown) {
        if (error instanceof Error && error.message === 'No active relation found to remove') {
            return res.status(404).json({ error: error.message });
        }
        console.error(error);
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
            return res.status(404).json({ error: 'Relation not found' });
        }
        res.status(500).json({ error: 'Error removing player from team' });
    }
}

export async function getPlayerCareer(req: Request, res: Response) {
    try {
        const playerId = Number(req.params.id);
        if (isNaN(playerId)) {
            return res.status(400).json({ error: 'Invalid player ID' });
        }
        const career = await teamPlayerService.getPlayerCareer(playerId);
        res.json(career);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error obtaining player career' });
    }
}