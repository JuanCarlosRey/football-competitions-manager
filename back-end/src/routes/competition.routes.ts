import { Router } from 'express';
import {
    getCompetitions,
    getCompetitionById,
    createCompetition,
    updateCompetition,
    deleteCompetition,
} from '../controllers/competition.controller.js';

const router = Router();

router.get('/', getCompetitions);
router.get('/:id', getCompetitionById);
router.post('/', createCompetition);
router.put('/:id', updateCompetition);
router.delete('/:id', deleteCompetition);

export default router;