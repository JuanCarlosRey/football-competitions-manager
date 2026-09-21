import { Router } from 'express';
import {
    getMatches,
    getMatchById,
    createMatch,
    updateMatch,
    deleteMatch,
} from '../controllers/match.controller.js';
import {
    addTeamLineup,
    getLineupsByMatch,
    removeLineupEntry,
    updateLineupEntry
} from '../controllers/match-lineup.controller.js';
import {
    addTeamStats,
    getStatsByMatch,
    removeTeamStats,
    updateTeamStats
} from '../controllers/match-team-stats.controller.js';
import {
    addPlayerStats,
    getStatsByMatch as getPlayerStatsByMatch,
    removePlayerStats,
    updatePlayerStats
} from '../controllers/match-player-stats.controller.js';

const router = Router();

router.get('/', getMatches);
router.get('/:id', getMatchById);
router.post('/', createMatch);
router.put('/:id', updateMatch);
router.delete('/:id', deleteMatch);

router.get('/:id/lineups', getLineupsByMatch);
router.post('/:id/lineups', addTeamLineup);
router.put('/:id/lineups/:lineupId', updateLineupEntry);
router.delete('/:id/lineups/:lineupId', removeLineupEntry);

router.get('/:id/statistics', getStatsByMatch);
router.post('/:id/statistics', addTeamStats);
router.put('/:id/statistics/:statId', updateTeamStats);
router.delete('/:id/statistics/:statId', removeTeamStats);

router.get('/:id/player-statistics', getPlayerStatsByMatch);
router.post('/:id/player-statistics', addPlayerStats);
router.put('/:id/player-statistics/:statId', updatePlayerStats);
router.delete('/:id/player-statistics/:statId', removePlayerStats);

export default router;