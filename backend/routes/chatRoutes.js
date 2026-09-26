import express from 'express';
import { processChatMessage, getChatHistory } from '../controllers/chatController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/message', authMiddleware, processChatMessage);
router.get('/history', authMiddleware, getChatHistory);

export default router;
