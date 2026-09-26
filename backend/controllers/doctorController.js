import db from '../config/db.js';
import { sendInstantBookingNotification } from '../services/notificationService.js';

export const getDoctors = async (req, res) => {
  try {
    const rows = await db.query(`SELECT * FROM doctors`);
    const doctors = rows.map(d => ({
      id: d.id,
      name: d.name,
      specialty: d.specialty,
      rating: d.rating,
      experience: d.experience,
      slots: JSON.parse(d.slots_json || '[]'),
      fee: d.fee || 500,
      email: d.email || `dr.${d.name.toLowerCase().replace(/[^a-z]/g, '')}@mateomind.com`,
      phone: d.phone || '+1 555-0144'
    }));

    res.json({ doctors });
  } catch (err) {
    console.error('Fetch doctors error:', err);
    res.status(500).json({ error: 'Failed to fetch doctors' });
  }
};

export const bookAppointment = async (req, res) => {
  const userId = req.user.id;
  const username = req.user.username;
  const { doctorId, doctorName, appointmentDate, slot, paymentMethod } = req.body;

  if (!doctorId || !slot) {
    return res.status(400).json({ error: 'Doctor ID and time slot are required' });
  }

  const finalDate = appointmentDate || new Date().toLocaleDateString();

  try {
    const doctorObj = await db.get(`SELECT * FROM doctors WHERE id = ?`, [doctorId]);

    const result = await db.run(
      `INSERT INTO appointments (user_id, username, doctor_id, doctor_name, appointment_date, slot, payment_method, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, username, doctorId, doctorName || doctorObj?.name || 'Therapist', finalDate, slot, paymentMethod || 'card', 'confirmed']
    );

    const appointment = {
      id: result.lastInsertRowid,
      userId,
      username,
      doctorId,
      doctorName: doctorName || doctorObj?.name || 'Therapist',
      date: finalDate,
      slot,
      paymentMethod: paymentMethod || 'card',
      status: 'confirmed',
      bookedAt: new Date().toISOString()
    };

    // Trigger instant Email & SMS notifications to Doctor & Patient
    const notificationResult = await sendInstantBookingNotification({
      appointment,
      doctor: {
        id: doctorId,
        name: doctorName || doctorObj?.name || 'Therapist',
        email: doctorObj?.email || `dr.${(doctorName || 'johnson').toLowerCase().replace(/[^a-z]/g, '')}@mateomind.com`,
        phone: doctorObj?.phone || '+1 555-0144'
      },
      user: req.user
    });

    res.status(201).json({
      message: 'Appointment booked successfully',
      appointment,
      notification: notificationResult
    });
  } catch (err) {
    console.error('Booking error:', err);
    res.status(500).json({ error: 'Failed to book appointment' });
  }
};

export const getAppointments = async (req, res) => {
  const userId = req.user.id;
  try {
    const rows = await db.query(
      `SELECT a.*, d.email as doc_email, d.phone as doc_phone 
       FROM appointments a
       LEFT JOIN doctors d ON a.doctor_id = d.id
       WHERE a.user_id = ? ORDER BY a.booked_at DESC`,
      [userId]
    );

    const appointments = rows.map(r => ({
      id: r.id,
      doctorId: r.doctor_id,
      doctorName: r.doctor_name,
      doctor: r.doctor_name,
      doctorEmail: r.doc_email || 'dr.sarah.johnson@mateomind.com',
      doctorPhone: r.doc_phone || '+1 555-0144',
      specialty: 'Clinical Specialist',
      date: r.appointment_date || new Date(r.booked_at).toLocaleDateString(),
      slot: r.slot,
      time: r.slot,
      paymentMethod: r.payment_method,
      status: r.payment_status === 'confirmed' ? 'Confirmed' : 'Pending',
      reminderSent: r.reminder_sent === 1,
      bookedAt: r.booked_at
    }));

    res.json({ appointments });
  } catch (err) {
    console.error('Fetch appointments error:', err);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
};

export const getNotificationLogs = async (req, res) => {
  try {
    const rows = await db.query(`SELECT * FROM notification_logs ORDER BY created_at DESC LIMIT 50`);
    res.json({ notifications: rows });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch notification logs' });
  }
};

