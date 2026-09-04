import type { Request, Response } from 'express';
import * as playerService from '../services/player.service.js';
import { createPlayerSchema, updatePlayerSchema } from '../schemas/player.schema.js';
import { z } from 'zod';

export async function getPlayers(req: Request, res: Response) {
    try {
        const players = await playerService.getAll();
        res.json(players);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error obtaining players' });
    }
}

export async function getPlayerById(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid player ID' });
        }
        const player = await playerService.getById(id);
        if (!player) {
            return res.status(404).json({ error: 'Player not found' });
        }
        res.json(player);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error obtaining player' });
    }
}

export async function createPlayer(req: Request, res: Response) {
    try {
        const validatedData = createPlayerSchema.parse(req.body);
        const newPlayer = await playerService.create(validatedData);
        res.status(201).json(newPlayer);
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        console.error(error);
        res.status(500).json({ error: 'Error creating player' });
    }
}

export async function updatePlayer(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid player ID' });
        }
        const validatedData = updatePlayerSchema.parse(req.body);
        const updatedPlayer = await playerService.update(id, validatedData);
        res.json(updatedPlayer);
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        console.error(error);
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
            return res.status(404).json({ error: 'Player not found' });
        }
        res.status(500).json({ error: 'Error updating player' });
    }
}

export async function deletePlayer(req: Request, res: Response) {
    try {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ error: 'Invalid player ID' });
        }
        await playerService.deletePlayer(id);
        res.status(204).send();
    } catch (error: unknown) {
        console.error(error);
        if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2025') {
            return res.status(404).json({ error: 'Player not found' });
        }
        res.status(500).json({ error: 'Error deleting player' });
    }
}