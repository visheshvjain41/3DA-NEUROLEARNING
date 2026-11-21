import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, Loader2, RefreshCw, RotateCcw, Send, Volume2, VolumeX } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import { buildSimulatedBuddyReply } from '../../utils/demoAiFallbacks';
import { playSoftTap } from '../../utils/gentleAudio';

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
    soundEnabled,
    setSoundEnabled,
    prefersReducedMotion,
  } = useAppData();

  const firstName = activeStudent.name.split(' ')[0];

  const [messages, setMessages] = useState<BuddyMessage[]>([
    {
      id: 'lumi-init',
      role: 'buddy',
      text: `Hi ${firstName}! I'm Lumi, your study buddy. Tell me what you're working on today—we can break it into small, steady steps, find a helpful hint, or take a 60-second reset together.`,
      sourceLabel: geminiConfigured ? 'Gemini AI Buddy' : 'Study Buddy',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) return;

    playSoftTap(soundEnabled);
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
          sourceLabel: 'Study Buddy',
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
        sourceLabel: 'Local Buddy Reply',
      },
    ]);
    setErrorMsg('');
  };

  const handleResetChat = () => {
    playSoftTap(soundEnabled);
    setErrorMsg('');
    setMessages([
      {
        id: 'lumi-reset',
        role: 'buddy',
        text: `Fresh start, ${firstName}! Pick one of the quick buttons below or ask me anything in your own words.`,
        sourceLabel: geminiConfigured ? 'Gemini AI Buddy' : 'Study Buddy',
      },
    ]);
  };

  return (
    <div className="space-y-5">
      {/* Lumi Header Card */}
      <div className="rounded-3xl border-2 border-purple-200 bg-gradient-to-br from-[#FFFDF7] via-[#F3E8FF]/55 to-[#E0F2FE]/55 p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <motion.img
            src="/src/assets/images/buddy_avatar_lumi_1795274053620.jpg"
            alt="Lumi the friendly study owl"
            referrerPolicy="no-referrer"
            animate={
              prefersReducedMotion
                ? { y: 0, rotate: 0 }
                : { y: [0, -4, 0], rotate: [-1.5, 1.5, -1.5] }
            }
            transition={
              prefersReducedMotion
                ? { duration: 0 }
                : { duration: 3.6, repeat: Infinity, ease: 'easeInOut' }
            }
            className="h-16 w-16 rounded-2xl border-2 border-amber-300 bg-[#FFFDF7] object-cover shrink-0"
          />
          <div>
            <p className="text-xs font-bold text-purple-800">
              Lumi · {geminiConfigured ? 'Gemini AI Connected' : 'Study Buddy Ready'}
            </p>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
              Your Study Buddy
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Educational helper only · Hints before answers · No pressure
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-pressed={soundEnabled}
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              if (next) playSoftTap(true);
            }}
            className={`inline-flex items-center gap-1.5 rounded-2xl border-2 px-3 py-2 text-xs font-bold cursor-pointer ${
              soundEnabled
                ? 'border-emerald-400 bg-[#D1FAE5] text-emerald-950'
                : 'border-slate-300 bg-white text-slate-700'
            }`}
          >
            {soundEnabled ? (
              <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <VolumeX className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {soundEnabled ? 'Sound On' : 'Sound Off'}
          </button>
          <button
            type="button"
            onClick={() =>
              setAccessibilityPrefs((p) => ({
                ...p,
                readingFriendly: !p.readingFriendly,
              }))
            }
            className={`rounded-2xl border-2 px-3 py-2 text-xs font-bold cursor-pointer ${
              accessibilityPrefs.readingFriendly
                ? 'border-sky-600 bg-[#E0F2FE] text-sky-950'
                : 'border-slate-200 bg-white text-slate-700'
            }`}
          >
            {accessibilityPrefs.readingFriendly
              ? 'Spacious Text: On'
              : 'Spacious Text'}
          </button>
          <button
            type="button"
            onClick={handleResetChat}
            className="inline-flex items-center gap-1.5 rounded-2xl border-2 border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            Reset Chat
          </button>
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="flex flex-wrap gap-2">
        {BUDDY_QUICK_PROMPTS.map((q) => (
          <motion.button
            key={q}
            type="button"
            disabled={loading}
            whileHover={prefersReducedMotion ? undefined : { y: -2 }}
            whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
            onClick={() => sendMessage(q)}
            className="rounded-2xl border-2 border-sky-200 bg-[#FFFDF7] px-4 py-2 text-xs sm:text-sm font-bold text-slate-800 hover:border-indigo-400 hover:bg-[#E0F2FE]/60 transition-colors cursor-pointer"
          >
            {q}
          </motion.button>
        ))}
      </div>

      {/* Chat Area */}
      <div className="rounded-3xl border-2 border-sky-200 bg-white flex flex-col min-h-[400px] max-h-[540px]">
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
                Lumi is thinking of a helpful next step...
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
                Use Local Buddy Reply
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
