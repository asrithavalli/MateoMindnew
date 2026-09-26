import express from 'express';
import { addWellnessEntry, getWellnessEntries } from '../controllers/wellnessController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/entry', authMiddleware, addWellnessEntry);
router.get('/entries', authMiddleware, getWellnessEntries);

export default router;
