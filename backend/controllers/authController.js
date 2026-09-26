import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../config/db.js';
import { JWT_SECRET } from '../middleware/auth.js';

export const registerUser = async (req, res) => {
  const { username, email, password, ageGroup, profile } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const existingUser = await db.get(`SELECT id FROM users WHERE username = ?`, [username]);
    if (existingUser) {
      return res.status(400).json({ error: 'Username already registered' });
    }

    if (email) {
      const existingEmail = await db.get(`SELECT id FROM users WHERE email = ?`, [email]);
      if (existingEmail) {
        return res.status(400).json({ error: 'Email address already registered' });
      }
    }

    const password_hash = bcrypt.hashSync(password, 10);
    const profileJson = JSON.stringify(profile || {
      name: username,
      age: "",
      photo: "",
      email: email || "",
      phone: "",
      gender: "",
      dob: "",
      pronouns: "",
      strengths: ['Empathy', 'Resilience'],
      goals: ['Practice mindfulness', 'Connect with friends'],
      supportContacts: [{ name: 'Alex Johnson', relation: 'Friend', phone: '+1 555-0192' }],
      favoriteResources: ['Meditation', 'Music', 'Yoga'],
      wellnessScore: 85,
      lastCheckIn: "Today"
    });

    const result = await db.run(
      `INSERT INTO users (username, email, password_hash, age_group, profile_json) VALUES (?, ?, ?, ?, ?)`,
      [username, email || '', password_hash, ageGroup || '', profileJson]
    );

    const userId = result.lastInsertRowid;
    const token = jwt.sign({ id: userId, username }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: userId,
        username,
        email: email || '',
        ageGroup: ageGroup || '',
        profile: JSON.parse(profileJson)
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

export const loginUser = async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }

  try {
    const user = await db.get(`SELECT * FROM users WHERE username = ? OR email = ?`, [username, username]);

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    if (user.password_hash) {
      const isValid = bcrypt.compareSync(password, user.password_hash);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    const profile = JSON.parse(user.profile_json || '{}');

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        ageGroup: user.age_group,
        profile
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
};

export const getProfile = async (req, res) => {
  const userId = req.user.id;
  const username = req.user.username;

  try {
    let user = null;
    if (userId) {
      user = await db.get(`SELECT * FROM users WHERE id = ?`, [userId]);
    }
    if (!user && username) {
      user = await db.get(`SELECT * FROM users WHERE username = ?`, [username]);
    }

    if (!user) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      ageGroup: user.age_group,
      profile: JSON.parse(user.profile_json || '{}')
    });
  } catch (err) {
    console.error('Fetch profile error:', err);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req, res) => {
  const userId = req.user.id;
  const username = req.user.username;
  const { profile, ageGroup, email } = req.body;

  try {
    let user = null;
    if (userId) {
      user = await db.get(`SELECT * FROM users WHERE id = ?`, [userId]);
    }
    if (!user && username) {
      user = await db.get(`SELECT * FROM users WHERE username = ?`, [username]);
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedProfileJson = JSON.stringify(profile || {});
    await db.run(
      `UPDATE users SET profile_json = ?, age_group = COALESCE(?, age_group), email = COALESCE(?, email) WHERE id = ?`,
      [updatedProfileJson, ageGroup || null, email || null, user.id]
    );

    res.json({ message: 'Profile updated successfully', profile });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};
