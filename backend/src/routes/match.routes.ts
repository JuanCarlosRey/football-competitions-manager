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

export default router;