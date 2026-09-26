import db from '../config/db.js';

const CHATBOT_RESPONSES = {
  greeting: [
    "Hello! I'm MateoMind Assistant. How can I support your emotional well-being and goals today?",
    "Hi there! How are you feeling today? I'm here to listen and help."
  ],
  sad: [
    "I understand you're feeling down. Remember, it's completely okay to feel this way. Would you like to talk about what's causing it?",
    "I'm here for you. Taking things one step at a time can help when feeling low. What's on your mind?"
  ],
  anxious: [
    "Anxiety can feel overwhelming. Take a deep, slow breath with me. What's causing you to feel anxious right now?",
    "Let's ground ourselves together. Deep breathing helps calm the nervous system. What's worrying you?"
  ],
  stressed: [
    "Stress can really take a toll. Breaking big tasks into smaller steps can help. What's your biggest stressor today?",
    "I hear you. Managing stress starts with prioritizing your peace. How can I help lighten your mental load?"
  ],
  dull_tired: [
    "Feeling dull or exhausted often means your brain and body need rest. Make sure to stay hydrated and take a short break today.",
    "It's normal to feel low energy sometimes. Try taking a gentle 5-minute walk or a deep breathing exercise. How long have you felt this way?"
  ],
  career_study: [
    "Balancing career paths like GATE vs. Campus Placements can be tricky! A good strategy is to assess your goal: GATE is ideal for Higher Studies/PSUs, while Campus Drives focus on immediate industry jobs. If uncertain, focusing on core technical fundamentals often benefits both!",
    "Career decisions can bring stress. Try listing your top priorities: immediate employment vs. higher education. Would you like tips on managing exam and placement stress?"
  ],
  happy: [
    "That's wonderful! I'm glad you're having a positive day. What brought you joy today?",
    "Great to hear! Celebrating small wins is so important for long-term well-being."
  ],
  help_questions: [
    "I'm here to help you track your mood, reduce stress, manage career/exam anxiety, and provide guided coping strategies. What specific guidance are you looking for?",
    "I can answer questions regarding stress management, study & career anxiety, daily well-being, and guided exercises. How can I assist you?"
  ],
  fallback: [
    "That's an interesting question! While I'm focused primarily on mental health, wellness, and stress support, I'd love to help you break down your thoughts. Tell me more about what you're trying to decide or work through.",
    "I hear you! Making big choices or seeking answers can sometimes feel confusing. How is this situation affecting your mood or stress levels right now?"
  ]
};

export const processChatMessage = async (req, res) => {
  const userId = req.user.id;
  const username = req.user.username;
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  const userText = message.trim().toLowerCase();
  let botCategory = 'fallback';

  // Explicit greeting check
  if (/^(hi|hello|hey|hlo|helo|greetings)\b/.test(userText) && userText.length < 15) {
    botCategory = 'greeting';
  }
  // Career / Study / Exam / GATE / Placement / Job / College
  else if (userText.includes('gate') || userText.includes('campus') || userText.includes('placement') || userText.includes('job') || userText.includes('career') || userText.includes('study') || userText.includes('exam') || userText.includes('prepare') || userText.includes('preparation')) {
    botCategory = 'career_study';
  }
  // Dull / Tired / Fatigue / Low energy / Bored
  else if (userText.includes('dull') || userText.includes('tired') || userText.includes('bored') || userText.includes('exhausted') || userText.includes('lazy') || userText.includes('low energy')) {
    botCategory = 'dull_tired';
  }
  // Sad / Depressed
  else if (userText.includes('sad') || userText.includes('depressed') || userText.includes('down') || userText.includes('unhappy') || userText.includes('cry') || userText.includes('lonely')) {
    botCategory = 'sad';
  }
  // Anxious / Worried / Panic
  else if (userText.includes('anxious') || userText.includes('worried') || userText.includes('panic') || userText.includes('fear') || userText.includes('scared') || userText.includes('nervous')) {
    botCategory = 'anxious';
  }
  // Stressed / Overwhelmed
  else if (userText.includes('stress') || userText.includes('overwhelmed') || userText.includes('pressure') || userText.includes('burden')) {
    botCategory = 'stressed';
  }
  // Happy / Joy
  else if (userText.includes('happy') || userText.includes('great') || userText.includes('good') || userText.includes('joy') || userText.includes('awesome') || userText.includes('excited')) {
    botCategory = 'happy';
  }
  // Questions / Help / Capabilities
  else if (userText.includes('help') || userText.includes('support') || userText.includes('doctor') || userText.includes('answer') || userText.includes('question') || userText.includes('can you') || userText.includes('what can')) {
    botCategory = 'help_questions';
  }

  const options = CHATBOT_RESPONSES[botCategory] || CHATBOT_RESPONSES.fallback;
  const botReply = options[Math.floor(Math.random() * options.length)];

  try {
    await db.run(
      `INSERT INTO chat_logs (user_id, username, sender, text) VALUES (?, ?, ?, ?)`,
      [userId, username, 'user', message]
    );

    await db.run(
      `INSERT INTO chat_logs (user_id, username, sender, text) VALUES (?, ?, ?, ?)`,
      [userId, username, 'bot', botReply]
    );

    res.json({
      userMessage: message,
      reply: botReply,
      category: botCategory,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
};

export const getChatHistory = async (req, res) => {
  const userId = req.user.id;
  try {
    const rows = await db.query(
      `SELECT sender, text, created_at FROM chat_logs WHERE user_id = ? ORDER BY created_at ASC`,
      [userId]
    );

    const messages = rows.map(r => ({
      sender: r.sender,
      text: r.text,
      timestamp: new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }));

    res.json({ messages });
  } catch (err) {
    console.error('Fetch chat history error:', err);
    res.status(500).json({ error: 'Failed to retrieve chat history' });
  }
};

