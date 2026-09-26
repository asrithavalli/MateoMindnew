import express from 'express';
import { getDoctors, bookAppointment, getAppointments, getNotificationLogs } from '../controllers/doctorController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getDoctors);
router.post('/book', authMiddleware, bookAppointment);
router.get('/appointments', authMiddleware, getAppointments);
router.get('/notifications', getNotificationLogs);

export default router;

