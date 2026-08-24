import { Router } from 'express';
import { getCompetitions } from '../controllers/competition.controller.js';

const router = Router();

router.get('/', getCompetitions);

export default router;