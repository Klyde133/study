require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Gemini uses GOOGLE_API_KEY, fallback to old name for compatibility
const API_KEY = process.env.GOOGLE_API_KEY || process.env.OPENAI_API_KEY;
const MODEL = process.env.GEMINI_MODEL || process.env.OPENAI_MODEL || 'gemini-2.5-flash';

// Gemini's OpenAI-compatible endpoint
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/openai/chat/completions';

app.use(express.json({ limit: '1mb' }));
app.use(express.static(path.join(__dirname)));

const SYSTEM_PROMPT = `You are StudyHub AI, a friendly and knowledgeable study assistant built into a student dashboard app.
Help students understand topics, explain concepts clearly, create quiz questions, summarize notes, break down problems step-by-step, and give practical study tips.
Keep answers focused, accurate, and easy to follow. Use examples when helpful.
If asked about something unrelated to learning or studying, gently redirect back to study topics.`;

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    ai: Boolean(API_KEY),
    model: MODEL
  });
});

app.post('/api/chat', async (req, res) => {
  if (!API_KEY) {
    return res.status(503).json({
      error: 'AI is not configured. Add your GOOGLE_API_KEY to the .env file on the server.'
    });
  }

  const { messages } = req.body;
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Messages are required.' });
  }

  const safeMessages = messages
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-20)
    .map(m => ({ role: m.role, content: m.content.slice(0, 4000) }));

  if (safeMessages.length === 0) {
    return res.status(400).json({ error: 'No valid messages provided.' });
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...safeMessages],
        max_tokens: 1024,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const msg = data.error?.message || 'AI request failed';
      return res.status(response.status).json({ error: msg });
    }

    const reply = data.choices?.[0]?.message?.content;
    if (!reply) {
      return res.status(502).json({ error: 'No response from AI.' });
    }

    res.json({ message: reply });

  } catch (err) {
    res.status(500).json({ error: 'Could not reach AI service. Check your internet connection.' });
  }
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`StudyHub running at http://localhost:${PORT}`);
  console.log(API_KEY ? `AI enabled (${MODEL})` : 'AI disabled — set GOOGLE_API_KEY in .env');
});