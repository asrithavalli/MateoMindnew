import db from '../config/db.js';

export const submitAssessment = async (req, res) => {
  const userId = req.user.id;
  const username = req.user.username;
  const { moodType, questions, answers } = req.body;

  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'Invalid assessment data' });
  }

  let score = 0;
  let riskFactors = [];
  let strengths = [];

  answers.forEach((a, i) => {
    if (a === "Sometimes") score += 1;
    if (a === "Often") {
      score += 2;
      if (questions && questions[i]) riskFactors.push(questions[i]);
    }
    if (a === "Always") {
      score += 3;
      if (questions && questions[i]) riskFactors.push(questions[i]);
    }
    if (a === "Never" && questions && questions[i]) {
      strengths.push(questions[i]);
    }
  });

  let riskLevel = "Low";
  let recommendations = [];

  if (score > 15) {
    riskLevel = "High";
    recommendations = [
      "We strongly recommend connecting with a mental health professional.",
      "Consider reaching out to a crisis helpline if you need immediate support.",
      "Practice daily grounding exercises and try to maintain a sleep routine."
    ];
  } else if (score > 8) {
    riskLevel = "Moderate";
    recommendations = [
      "Try guided meditation or breathing exercises available in the app.",
      "Journal your thoughts daily to track stressors.",
      "Consider scheduling a consultation with a therapist."
    ];
  } else {
    riskLevel = "Low";
    recommendations = [
      "Keep up your positive wellness routines!",
      "Continue practicing mindfulness and gratitude.",
      "Stay connected with supportive friends and family."
    ];
  }

  try {
    const result = await db.run(
      `INSERT INTO assessments (user_id, username, mood_type, score, risk_level, risk_factors_json, strengths_json, answers_json, recommendations_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        username,
        moodType || '',
        score,
        riskLevel,
        JSON.stringify(riskFactors),
        JSON.stringify(strengths),
        JSON.stringify(answers),
        JSON.stringify(recommendations)
      ]
    );

    res.json({
      id: result.lastInsertRowid,
      score,
      riskLevel,
      riskFactors,
      strengths,
      recommendations,
      date: new Date().toLocaleDateString()
    });
  } catch (err) {
    console.error('Assessment submission error:', err);
    res.status(500).json({ error: 'Failed to record assessment' });
  }
};

export const getAssessmentHistory = async (req, res) => {
  const userId = req.user.id;
  try {
    const rows = await db.query(
      `SELECT * FROM assessments WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );

    const history = rows.map(r => ({
      id: r.id,
      moodType: r.mood_type,
      score: r.score,
      riskLevel: r.risk_level,
      riskFactors: JSON.parse(r.risk_factors_json || '[]'),
      strengths: JSON.parse(r.strengths_json || '[]'),
      recommendations: JSON.parse(r.recommendations_json || '[]'),
      date: new Date(r.created_at).toLocaleDateString()
    }));

    res.json({ history });
  } catch (err) {
    console.error('Fetch assessment history error:', err);
    res.status(500).json({ error: 'Failed to retrieve assessment history' });
  }
};
