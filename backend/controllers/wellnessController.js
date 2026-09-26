import db from '../config/db.js';

export const addWellnessEntry = async (req, res) => {
  const userId = req.user.id;
  const username = req.user.username;
  const { type, content } = req.body; // type: 'journal' | 'sleep' | 'gratitude' | 'mood' | 'voice' | 'community'

  if (!type || content === undefined) {
    return res.status(400).json({ error: 'Type and content are required' });
  }

  try {
    const result = await db.run(
      `INSERT INTO wellness_entries (user_id, username, entry_type, content_json)
       VALUES (?, ?, ?, ?)`,
      [userId, username, type, JSON.stringify(content)]
    );

    res.status(201).json({
      id: result.lastInsertRowid,
      type,
      content,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    console.error('Add wellness entry error:', err);
    res.status(500).json({ error: 'Failed to add wellness entry' });
  }
};

export const getWellnessEntries = async (req, res) => {
  const userId = req.user.id;
  const { type } = req.query;

  try {
    let rows;
    if (type) {
      rows = await db.query(
        `SELECT * FROM wellness_entries WHERE user_id = ? AND entry_type = ? ORDER BY created_at DESC`,
        [userId, type]
      );
    } else {
      rows = await db.query(
        `SELECT * FROM wellness_entries WHERE user_id = ? ORDER BY created_at DESC`,
        [userId]
      );
    }

    const entries = rows.map(r => ({
      id: r.id,
      type: r.entry_type,
      content: JSON.parse(r.content_json || '{}'),
      createdAt: r.created_at
    }));

    res.json({ entries });
  } catch (err) {
    console.error('Fetch wellness entries error:', err);
    res.status(500).json({ error: 'Failed to fetch wellness entries' });
  }
};
