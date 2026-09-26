import express from 'express';
import { submitAssessment, getAssessmentHistory } from '../controllers/assessmentController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/submit', authMiddleware, submitAssessment);
router.get('/history', authMiddleware, getAssessmentHistory);

export default router;
