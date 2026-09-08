import { Router } from 'express';
import {
    getTeams,
    getTeamById,
    getTeamMatches,
    createTeam,
    updateTeam,
    deleteTeam,
} from '../controllers/team.controller.js';

const router = Router();

router.get('/', getTeams);
router.get('/:id', getTeamById);
router.get('/:id/matches', getTeamMatches);
router.post('/', createTeam);
router.put('/:id', updateTeam);
router.delete('/:id', deleteTeam);

export default router;