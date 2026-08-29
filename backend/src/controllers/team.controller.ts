import type { Request, Response } from 'express';
import * as teamService from '../services/team.service.js';
import { createTeamSchema, updateTeamSchema } from '../schemas/team.schema.js';
import z from 'zod';

export async function getTeams(req: Request, res: Response) {
    try {
        const teams = await teamService.getAll();
        res.json(teams);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error obtaining teams' });
    }
}

export async function getTeamById(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid team ID' });
        }
        const team = await teamService.getById(id);
        if (!team) {
            return res.status(404).json({ error: 'Team not found' });
        }
        res.json(team);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error obtaining team' });
    }
}

export async function createTeam(req: Request, res: Response) {
    try {
        const validatedData = createTeamSchema.parse(req.body);
        const newTeam = await teamService.create(validatedData);
        res.status(201).json(newTeam);
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        console.error(error);
        res.status(500).json({ error: 'Error creating team' });
    }
}

export async function updateTeam(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid team ID' });
        }
        const validatedData = updateTeamSchema.parse(req.body);
        const updatedTeam = await teamService.update(id, validatedData);
        res.json(updatedTeam);
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        console.error(error);
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
            return res.status(404).json({ error: 'Team not found' });
        }
        res.status(500).json({ error: 'Error updating team' });
    }
}

export async function deleteTeam(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid team ID' });
        }
        await teamService.remove(id);
        res.status(204).send();
    } catch (error: unknown) {
        console.error(error);
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
            return res.status(404).json({ error: 'Team not found' });
        }
        res.status(500).json({ error: 'Error deleting team' });
    }
}