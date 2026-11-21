import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

function getConfiguredApiKey(): string | null {
  const key = process.env.GEMINI_API_KEY?.trim();
  if (!key || key === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return key;
}

function createAiClient(): GoogleGenAI | null {
  const apiKey = getConfiguredApiKey();
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      ok: true,
      geminiConfigured: Boolean(getConfiguredApiKey()),
    });
  });

  app.post('/api/ai/support-plan', async (req, res) => {
    const ai = createAiClient();
    if (!ai) {
      res.status(503).json({
        error: 'GEMINI_NOT_CONFIGURED',
        message: 'Gemini API key is not configured in the server environment.',
      });
      return;
    }

    try {
      const {
        studentName,
        className,
        supportProfile,
        strengths,
        learningPreferences,
        recentActivitiesSummary,
        observationsSummary,
      } = req.body ?? {};

      if (!studentName || !supportProfile) {
        res.status(400).json({ error: 'Missing required student context.' });
        return;
      }

      const prompt = [
        `Create a practical, strengths-based Monthly Educational Support Plan for a demo student.`,
        `Student: ${studentName} (${className ?? 'Middle School'})`,
        `Learning Support Focus: ${supportProfile}`,
        `Observed Strengths: ${Array.isArray(strengths) ? strengths.join('; ') : 'Creative problem solving'}`,
        `Learning Preferences: ${Array.isArray(learningPreferences) ? learningPreferences.join('; ') : 'Visual and step-by-step scaffolding'}`,
        `Recent 30-Day Activity Summary: ${recentActivitiesSummary || 'Steady engagement across interactive reading and focus modules.'}`,
        `Teacher & Counsellor Notes: ${observationsSummary || 'Responds well to calm, chunked instructions.'}`,
      ].join('\n');

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: prompt,
        config: {
          systemInstruction:
            'You are an inclusive education support planner for 3DA NeuroLearning. Generate concise, warm, strengths-based classroom and home support suggestions. Never diagnose, label clinically, or recommend medical/clinical treatments. Keep all items practical for teachers, parents, and students.',
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              overview: { type: Type.STRING, description: 'A warm 2-3 sentence educational overview.' },
              strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
              learningPreferences: { type: Type.ARRAY, items: { type: Type.STRING } },
              supportAreas: { type: Type.ARRAY, items: { type: Type.STRING } },
              monthlyGoals: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '2 to 3 achievable, non-pressured monthly educational goals.',
              },
              schoolAccommodations: { type: Type.ARRAY, items: { type: Type.STRING } },
              homeActivities: { type: Type.ARRAY, items: { type: Type.STRING } },
              progressIndicators: { type: Type.ARRAY, items: { type: Type.STRING } },
              educatorNotes: { type: Type.STRING },
            },
            required: [
              'overview',
              'strengths',
              'learningPreferences',
              'supportAreas',
              'monthlyGoals',
              'schoolAccommodations',
              'homeActivities',
              'progressIndicators',
              'educatorNotes',
            ],
          },
        },
      });

      const parsed = JSON.parse((response.text ?? '{}').trim());
      res.json({ source: 'gemini', plan: parsed });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to generate support plan.';
      console.error('Support plan generation error:', message);
      res.status(502).json({ error: 'GEMINI_UPSTREAM_ERROR', message });
    }
  });

  app.post('/api/ai/parent-hub', async (req, res) => {
    const ai = createAiClient();
    if (!ai) {
      res.status(503).json({
        error: 'GEMINI_NOT_CONFIGURED',
        message: 'Gemini API key is not configured in the server environment.',
      });
      return;
    }

    try {
      const { message, history, studentContext } = req.body ?? {};
      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: 'Message is required.' });
        return;
      }

      const systemInstruction = [
        'You are the 3DA NeuroLearning Parent & Counsellor Hub assistant.',
        'Your role is to help parents understand their child’s demo learning activity patterns in plain, reassuring language, suggest calm homework routines at home, and propose thoughtful questions they can bring to a school teacher or counsellor.',
        'Strict boundary: You NEVER diagnose learning disorders, never evaluate clinical symptoms, and never offer medical or therapeutic advice. Always clarify when appropriate that suggestions are educational support ideas.',
        'Keep responses well-structured, concise (under 180 words unless asked for detail), and warm.',
        studentContext ? `Current Demo Student Context:\n${studentContext}` : '',
      ]
        .filter(Boolean)
        .join('\n\n');

      const formattedHistory = Array.isArray(history)
        ? history
            .slice(-6)
            .map((m: { role?: string; text?: string }) => `${m.role === 'user' ? 'Parent' : 'Assistant'}: ${m.text ?? ''}`)
            .join('\n')
        : '';

      const contents = formattedHistory
        ? `Previous conversation:\n${formattedHistory}\n\nParent's new question: ${message}`
        : message;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      res.json({
        source: 'gemini',
        reply: response.text?.trim() || 'I am here to help you explore your child’s learning routines and school check-in questions.',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate response.';
      console.error('Parent hub error:', msg);
      res.status(502).json({ error: 'GEMINI_UPSTREAM_ERROR', message: msg });
    }
  });

  app.post('/api/ai/buddy', async (req, res) => {
    const ai = createAiClient();
    if (!ai) {
      res.status(503).json({
        error: 'GEMINI_NOT_CONFIGURED',
        message: 'Gemini API key is not configured in the server environment.',
      });
      return;
    }

    try {
      const { message, history, studentContext, readingFriendly } = req.body ?? {};
      if (!message || typeof message !== 'string') {
        res.status(400).json({ error: 'Message is required.' });
        return;
      }

      const systemInstruction = [
        'You are Lumi, a warm, gentle, playful, and supportive AI learning buddy for students on 3DA NeuroLearning.',
        'Guidelines:',
        '1. Explain ideas in short, clear sentences with zero jargon.',
        '2. Always give a gentle hint or first tiny step before giving a full answer.',
        '3. Break big homework tasks into 2–4 bite-sized, doable steps.',
        '4. Celebrate effort and curiosity without pressure or streaks.',
        '5. Recommend relevant learning activities inside the app when helpful: Reading World (Read-Along Studio, Word & Sound Check), Number World (Visual Number Lab, Word-Problem Decoder), Writing World (Idea & Outline Studio, Homework Builder), and Focus World (Focus Timer, Start Now Checklist, 60-Second Reset, Brain & Focus Game).',
        '6. Suggest a calm 60-second breathing break if a student sounds overwhelmed or tired.',
        '7. NEVER diagnose, label clinically, or collect personal sensitive information.',
        readingFriendly
          ? 'Formatting: Use extra-short sentences, simple everyday words, and clear bullet points with blank lines between them so reading feels spacious and calm.'
          : 'Formatting: Keep responses concise (around 60–140 words), friendly, and easy to scan.',
        studentContext ? `Educational preferences for this demo student:\n${studentContext}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      const formattedHistory = Array.isArray(history)
        ? history
            .slice(-6)
            .map((m: { role?: string; text?: string }) => `${m.role === 'user' ? 'Student' : 'Lumi'}: ${m.text ?? ''}`)
            .join('\n')
        : '';

      const contents = formattedHistory
        ? `Conversation so far:\n${formattedHistory}\n\nStudent says: ${message}`
        : message;

      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents,
        config: {
          systemInstruction,
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
        },
      });

      res.json({
        source: 'gemini',
        reply: response.text?.trim() || "Let's take this one tiny step at a time together. Tell me what you're working on!",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to reach Lumi right now.';
      console.error('AI Buddy error:', msg);
      res.status(502).json({ error: 'GEMINI_UPSTREAM_ERROR', message: msg });
    }
  });

  if (!IS_PRODUCTION) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('/{*splat}', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`3DA NeuroLearning server listening on http://localhost:${PORT}`);
  });
}

startServer();
