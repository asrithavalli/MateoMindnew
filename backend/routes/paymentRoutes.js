import express from 'express';
import { processPayment, getPaymentHistory } from '../controllers/paymentController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.post('/checkout', authMiddleware, processPayment);
router.get('/history', authMiddleware, getPaymentHistory);

export default router;
