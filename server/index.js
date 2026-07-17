import 'dotenv/config';
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json({ limit: '100kb' }));

const PORT = process.env.PORT || 3001;
const AI_BASE_URL = process.env.AI_BASE_URL || 'https://api.groq.com/openai/v1';
const AI_API_KEY = process.env.AI_API_KEY;
const AI_MODEL = process.env.AI_MODEL || 'llama-3.1-8b-instant';

// The model is instructed to return ONLY this JSON shape. We deliberately do
// NOT rely on provider-specific "JSON mode" flags here (not every
// OpenAI-compatible provider or local model supports them consistently) —
// instead the prompt is strict, and the frontend does defensive parsing on
// whatever text comes back. See src/utils/parseItinerary.js.
const SYSTEM_PROMPT = `You are a travel itinerary generator.

Given a free-form trip description, respond with ONLY a single JSON object -- no markdown code fences, no commentary before or after it. Match this shape exactly:

{
  "title": "short trip title",
  "summary": "1-2 sentence overview of the trip",
  "days": [
    {
      "day": 1,
      "label": "Day 1 -- Arrival",
      "stops": [
        { "time": "Morning", "name": "Place or activity name", "description": "1-3 sentences of specific detail" }
      ]
    }
  ]
}

Rules:
- If the description gives a trip length, use it. Otherwise default to 3 days.
- Give each day 3 to 5 stops, ordered through the day.
- Descriptions should reflect the traveler's stated interests, pace, and budget.
- Respond with valid JSON only: double-quoted keys and strings, no trailing commas, no comments, no markdown.`;

app.post('/api/plan-trip', async (req, res) => {
  const description = typeof req.body?.description === 'string' ? req.body.description.trim() : '';

  if (!description) {
    return res.status(400).json({ error: 'Describe a trip before generating an itinerary.' });
  }
  if (description.length > 2000) {
    return res.status(400).json({ error: 'That description is too long -- keep it under 2000 characters.' });
  }
  if (!AI_API_KEY) {
    return res.status(500).json({ error: 'Server is missing AI_API_KEY. Add it to your .env file (see .env.example).' });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const upstream = await fetch(`${AI_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: AI_MODEL,
        temperature: 0.7,
        max_tokens: 2000,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: description },
        ],
      }),
      signal: controller.signal,
    });

    const data = await upstream.json().catch(() => null);

    if (!upstream.ok) {
      const message = data?.error?.message || `The AI provider returned an error (status ${upstream.status}).`;
      return res.status(502).json({ error: message });
    }

    const content = data?.choices?.[0]?.message?.content;
    if (!content) {
      return res.status(502).json({ error: 'The AI provider returned an empty response.' });
    }

    // Deliberately forward the raw text as-is. Parsing, repair, and
    // validation happen on the frontend so failures surface in the UI
    // exactly the same way regardless of which provider is behind this.
    return res.json({ content });
  } catch (err) {
    if (err.name === 'AbortError') {
      return res.status(504).json({ error: 'The AI provider took too long to respond.' });
    }
    console.error('plan-trip error:', err);
    return res.status(502).json({ error: 'Could not reach the AI provider. Check AI_BASE_URL and your connection.' });
  } finally {
    clearTimeout(timeout);
  }
});

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Trip planner backend listening on http://localhost:${PORT}`);
});
