import { Router } from 'express';
import {
    getPlayersByTeam,
    addPlayerToTeam,
    updatePlayerDates,
    removePlayerFromTeam,
} from '../controllers/team-player.controller.js';

const router = Router();

// Endpoint Base: /api/teams
router.get('/:id/players', getPlayersByTeam);
router.post('/:id/players', addPlayerToTeam);
router.put('/:id/players/:playerId', updatePlayerDates);
router.delete('/:id/players/:playerId', removePlayerFromTeam);

export default router;