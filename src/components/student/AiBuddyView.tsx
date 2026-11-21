import React, { useState } from 'react';
import { AlertCircle, Loader2, RefreshCw, RotateCcw, Send } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { buildSimulatedBuddyReply } from '../../utils/demoAiFallbacks';

interface BuddyMessage {
  id: string;
  role: 'user' | 'buddy';
  text: string;
  sourceLabel?: string;
}

const BUDDY_QUICK_PROMPTS = [
  'Help me get started',
  'Explain this in simpler words',
  'Give me a hint',
  'Help me organize my homework',
  "Let's try a game",
  'I need a short break',
];

export const AiBuddyView: React.FC = () => {
  const {
    activeStudent,
    state,
    geminiConfigured,
    accessibilityPrefs,
    setAccessibilityPrefs,
  } = useAppData();

  const firstName = activeStudent.name.split(' ')[0];

  const [messages, setMessages] = useState<BuddyMessage[]>([
    {
      id: 'lumi-init',
      role: 'buddy',
      text: `Hi ${firstName}! I'm Lumi, your study buddy. Tell me what you're working on today—we can break it into small, calm steps, find a gentle hint, or take a 60-second reset together.`,
      sourceLabel: geminiConfigured ? 'Gemini AI Buddy' : 'Simulated Demo Mode',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) return;

    setErrorMsg('');
    const userMsg: BuddyMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };
    const nextMsgs = [...messages, userMsg];
    setMessages(nextMsgs);
    setInput('');

    if (!geminiConfigured) {
      const reply = buildSimulatedBuddyReply(
        trimmed,
        activeStudent,
        accessibilityPrefs.readingFriendly
      );
      setMessages([
        ...nextMsgs,
        {
          id: `b-${Date.now()}`,
          role: 'buddy',
          text: reply,
          sourceLabel: 'Simulated Demo Mode',
        },
      ]);
      return;
    }

    setLoading(true);
    try {
      const recentActs = state.activities
        .filter((a) => a.studentId === activeStudent.id)
        .slice(0, 3)
        .map((a) => `${a.module}: ${a.activityTitle}`)
        .join('; ');

      const studentContext = [
        `First Name: ${firstName} (${activeStudent.className})`,
        `Strengths: ${activeStudent.strengths.join(', ')}`,
        `Helpful Learning Preferences: ${activeStudent.learningPreferences.join(', ')}`,
        recentActs ? `Recent App Activities: ${recentActs}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      const res = await fetch('/api/ai/buddy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: nextMsgs.slice(-6).map((m) => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            text: m.text,
          })),
          studentContext,
          readingFriendly: accessibilityPrefs.readingFriendly,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data?.message || 'Lumi could not reach Gemini right now.');
        return;
      }

      setMessages([
        ...nextMsgs,
        {
          id: `b-${Date.now()}`,
          role: 'buddy',
          text: data.reply,
          sourceLabel: 'Lumi · Gemini Educational Buddy',
        },
      ]);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Network error reaching Lumi.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseFallbackReply = () => {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUser) return;
    const reply = buildSimulatedBuddyReply(
      lastUser.text,
      activeStudent,
      accessibilityPrefs.readingFriendly
    );
    setMessages((prev) => [
      ...prev,
      {
        id: `b-${Date.now()}`,
        role: 'buddy',
        text: reply,
        sourceLabel: 'Offline Demo Fallback',
      },
    ]);
    setErrorMsg('');
  };

  const handleResetChat = () => {
    setErrorMsg('');
    setMessages([
      {
        id: 'lumi-reset',
        role: 'buddy',
        text: `Fresh start, ${firstName}! Pick one of the quick buttons below or ask me anything in your own words.`,
        sourceLabel: geminiConfigured ? 'Gemini AI Buddy' : 'Simulated Demo Mode',
      },
    ]);
  };

  return (
    <div className="space-y-5">
      {/* Lumi Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src="/src/assets/images/buddy_avatar_lumi_1795274053620.jpg"
            alt="Lumi the friendly study owl"
            referrerPolicy="no-referrer"
            className="h-16 w-16 rounded-xl border border-slate-200 object-cover shrink-0"
          />
          <div>
            <p className="text-xs font-semibold text-indigo-700">
              Lumi · {geminiConfigured ? 'Gemini AI Connected' : 'Simulated Demo Mode'}
            </p>
            <h2 className="font-display text-xl font-bold text-slate-900">
              Your Calm Study Buddy
            </h2>
            <p className="text-xs text-slate-500">
              Educational helper only · Hints before answers · No pressure
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setAccessibilityPrefs((p) => ({
                ...p,
                readingFriendly: !p.readingFriendly,
              }))
            }
            className={`rounded-lg border px-3 py-2 text-xs font-semibold cursor-pointer ${
              accessibilityPrefs.readingFriendly
                ? 'border-sky-600 bg-sky-50 text-sky-900'
                : 'border-slate-200 bg-[#FAF9F6] text-slate-700'
            }`}
          >
            {accessibilityPrefs.readingFriendly
              ? 'Reading-Friendly: On'
              : 'Reading-Friendly Text'}
          </button>
          <button
            type="button"
            onClick={handleResetChat}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Reset Chat
          </button>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="flex flex-wrap gap-2">
        {BUDDY_QUICK_PROMPTS.map((q) => (
          <button
            key={q}
            type="button"
            disabled={loading}
            onClick={() => sendMessage(q)}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:border-indigo-300 hover:bg-indigo-50/70 transition-colors cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Area */}
      <div className="rounded-2xl border border-slate-200 bg-white flex flex-col min-h-[400px] max-h-[540px]">
        <div
          className={`flex-1 overflow-y-auto p-5 space-y-4 ${
            accessibilityPrefs.readingFriendly ? 'reading-friendly text-base' : 'text-sm'
          }`}
        >
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed whitespace-pre-line ${
                  m.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'border border-slate-200 bg-[#FAF9F6] text-slate-900'
                }`}
              >
                {m.sourceLabel && m.role === 'buddy' && (
                  <p className="text-[11px] font-semibold text-indigo-700 mb-1">
                    {m.sourceLabel}
                  </p>
                )}
                {m.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-[#FAF9F6] px-4 py-3 text-xs text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" aria-hidden="true" />
                Lumi is thinking of a gentle next step...
              </div>
            </div>
          )}

          {errorMsg && (
            <div
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-rose-800"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
                <span>{errorMsg}</span>
              </div>
              <button
                type="button"
                onClick={handleUseFallbackReply}
                className="inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-white px-2.5 py-1 font-semibold hover:bg-rose-100 cursor-pointer shrink-0"
              >
                <RefreshCw className="h-3 w-3" aria-hidden="true" />
                Use Demo Buddy Reply
              </button>
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="border-t border-slate-200 p-3 flex items-center gap-2.5"
        >
          <input
            type="text"
            aria-label="Message Lumi AI Buddy"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Lumi for a hint, simpler words, or help getting started..."
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 cursor-pointer shrink-0"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Ask Lumi</span>
          </button>
        </form>
      </div>
    </div>
  );
};
