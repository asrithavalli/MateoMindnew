import db from '../config/db.js';
import { sendInstantBookingNotification } from '../services/notificationService.js';

export const processPayment = async (req, res) => {
  const userId = req.user.id;
  const username = req.user.username;
  const {
    doctorId,
    doctorName,
    appointmentDate,
    slot,
    amount,
    paymentMethod, // 'card' | 'upi' | 'qr'
    cardDetails, // { cardHolder, cardNumber, expiry }
    upiId,
    simulateFailure
  } = req.body;

  if (!doctorId || !slot || !paymentMethod) {
    return res.status(400).json({ error: 'Doctor ID, slot, and payment method are required' });
  }

  // Simulate payment cancellation or failure if requested for demo testing
  if (simulateFailure) {
    return res.status(400).json({
      error: 'Payment transaction failed or was cancelled by the user. No appointment was created.'
    });
  }

  let maskedDetails = 'Demo Payment';
  if (paymentMethod === 'card') {
    if (!cardDetails || !cardDetails.cardNumber) {
      return res.status(400).json({ error: 'Card details are incomplete' });
    }
    const cleanNum = cardDetails.cardNumber.replace(/\s+/g, '');
    const last4 = cleanNum.length >= 4 ? cleanNum.slice(-4) : '4242';
    maskedDetails = `Card ending in •••• ${last4} (${cardDetails.cardHolder || 'Cardholder'})`;
  } else if (paymentMethod === 'upi') {
    if (!upiId) {
      return res.status(400).json({ error: 'UPI ID is required' });
    }
    maskedDetails = `UPI ID: ${upiId}`;
  } else if (paymentMethod === 'qr') {
    maskedDetails = `Scan & Pay QR Transfer`;
  }

  const transactionId = `TXN-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  const finalAmount = amount || 500;
  const finalDate = appointmentDate || new Date().toLocaleDateString();

  try {
    const doctorObj = await db.get(`SELECT * FROM doctors WHERE id = ?`, [doctorId]);

    // 1. Create Appointment Record
    const apptResult = await db.run(
      `INSERT INTO appointments (user_id, username, doctor_id, doctor_name, appointment_date, slot, payment_method, payment_status, transaction_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        username,
        doctorId,
        doctorName || doctorObj?.name || 'Therapist Consultation',
        finalDate,
        slot,
        paymentMethod,
        'confirmed',
        transactionId
      ]
    );

    const appointmentId = apptResult.lastInsertRowid;

    // 2. Create Payment Record
    const payResult = await db.run(
      `INSERT INTO payments (transaction_id, user_id, username, appointment_id, amount, payment_method, payment_details_masked, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        transactionId,
        userId,
        username,
        appointmentId,
        finalAmount,
        paymentMethod,
        maskedDetails,
        'success'
      ]
    );

    const appointment = {
      id: appointmentId,
      doctorId,
      doctorName: doctorName || doctorObj?.name || 'Therapist Consultation',
      date: finalDate,
      time: slot,
      paymentMethod,
      paymentStatus: 'confirmed',
      transactionId,
      amount: finalAmount,
      bookedAt: new Date().toISOString()
    };

    const payment = {
      id: payResult.lastInsertRowid,
      transactionId,
      amount: finalAmount,
      paymentMethod,
      details: maskedDetails,
      status: 'success',
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString()
    };

    // Trigger instant Email & SMS notifications to Doctor & Patient
    const notificationResult = await sendInstantBookingNotification({
      appointment,
      doctor: {
        id: doctorId,
        name: doctorName || doctorObj?.name || 'Therapist Consultation',
        email: doctorObj?.email || `dr.${(doctorName || 'johnson').toLowerCase().replace(/[^a-z]/g, '')}@mateomind.com`,
        phone: doctorObj?.phone || '+1 555-0144'
      },
      user: req.user
    });

    res.status(201).json({
      message: 'Payment processed successfully! Appointment confirmed.',
      transactionId,
      appointment,
      payment,
      notification: notificationResult
    });
  } catch (err) {
    console.error('Payment processing error:', err);
    res.status(500).json({ error: 'Server error during payment checkout' });
  }
};

export const getPaymentHistory = async (req, res) => {
  const userId = req.user.id;
  try {
    const rows = await db.query(
      `SELECT * FROM payments WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    const payments = rows.map(p => ({
      id: p.id,
      transactionId: p.transaction_id,
      appointmentId: p.appointment_id,
      amount: p.amount,
      paymentMethod: p.payment_method,
      details: p.payment_details_masked,
      status: p.status,
      date: new Date(p.created_at).toLocaleDateString(),
      time: new Date(p.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

    res.json({ payments });
  } catch (err) {
    console.error('Payment history error:', err);
    res.status(500).json({ error: 'Failed to retrieve payment history' });
  }
};
