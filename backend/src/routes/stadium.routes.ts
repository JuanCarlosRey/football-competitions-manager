import { Router } from 'express';
import {
    getStadiums,
    getStadiumById,
    createStadium,
    updateStadium,
    deleteStadium,
} from '../controllers/stadium.controller.js';

const router = Router();

router.get('/', getStadiums);
router.get('/:id', getStadiumById);
router.post('/', createStadium);
router.put('/:id', updateStadium);
router.delete('/:id', deleteStadium);

export default router;