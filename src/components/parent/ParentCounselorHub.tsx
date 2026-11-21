import React, { useState } from 'react';
import { AlertCircle, Loader2, RefreshCw, RotateCcw, Send, Sparkles } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import type { DailyActivity, StudentRecord, TeacherObservation } from '../../types/neuro';
import { buildSimulatedParentHubReply } from '../../utils/demoAiFallbacks';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  sourceLabel?: string;
}

interface ParentCounselorHubProps {
  student: StudentRecord;
  activities: DailyActivity[];
  observations: TeacherObservation[];
}

const QUICK_PROMPTS = [
  "Explain this month's learning activity in plain words",
  'Suggest a calm 20-minute homework routine for home',
  'What questions can I ask our school counsellor?',
  'How can we celebrate effort without pressure?',
];

export const ParentCounselorHub: React.FC<ParentCounselorHubProps> = ({
  student,
  activities,
  observations,
}) => {
  const { geminiConfigured } = useAppData();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: `Hello ${student.parentAccountName.split('(')[0].trim()}! I can help explain ${student.name}'s recent demo learning activities, suggest calm home routines, and prepare helpful questions for ${student.counsellor} or ${student.teacher}. Ask me anything below.`,
      sourceLabel: geminiConfigured ? 'Gemini Educational Assistant' : 'Simulated Demo Assistant',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const sendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || loading) return;

    setErrorMsg('');
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: trimmed,
    };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput('');

    if (!geminiConfigured) {
      const simReply = buildSimulatedParentHubReply(
        trimmed,
        student,
        activities,
        observations
      );
      setMessages([
        ...nextMessages,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: simReply,
          sourceLabel: 'Simulated Demo Mode',
        },
      ]);
      return;
    }

    setLoading(true);
    try {
      const studentContext = [
        `Student: ${student.name} (${student.className})`,
        `Educational Support Focus: ${student.supportProfile}`,
        `Strengths: ${student.strengths.join(', ')}`,
        `Learning Preferences: ${student.learningPreferences.join(', ')}`,
        `Recent Activities (${activities.length} total): ${activities
          .slice(0, 5)
          .map((a) => `${a.date} ${a.module} (${a.durationMinutes}m, ${a.status})`)
          .join('; ')}`,
        `Teacher/Counsellor Notes: ${observations
          .slice(0, 2)
          .map((o) => `${o.author}: ${o.note}`)
          .join('; ')}`,
        `Support Plan Status: ${student.supportPlan.reviewStatus}`,
      ].join('\n');

      const res = await fetch('/api/ai/parent-hub', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          history: nextMessages.slice(-6).map((m) => ({ role: m.role, text: m.text })),
          studentContext,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data?.message || 'Unable to reach Gemini right now.');
        return;
      }

      setMessages([
        ...nextMessages,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: data.reply,
          sourceLabel: 'Gemini AI · Educational support only',
        },
      ]);
    } catch (err: unknown) {
      setErrorMsg(
        err instanceof Error ? err.message : 'Network error reaching Parent Hub assistant.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemoReplyForLast = () => {
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUser) return;
    const simReply = buildSimulatedParentHubReply(
      lastUser.text,
      student,
      activities,
      observations
    );
    setMessages((prev) => [
      ...prev,
      {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: simReply,
        sourceLabel: 'Offline Demo Fallback',
      },
    ]);
    setErrorMsg('');
  };

  const handleResetChat = () => {
    setErrorMsg('');
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        text: `Chat cleared. Ask me about ${student.name}'s recent activities, home routines, or questions for ${student.counsellor}.`,
        sourceLabel: geminiConfigured ? 'Gemini Educational Assistant' : 'Simulated Demo Assistant',
      },
    ]);
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-indigo-700">
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            <span>
              AI &amp; Counselor Hub ·{' '}
              {geminiConfigured ? 'Gemini AI Connected' : 'Simulated Demo Mode'}
            </span>
          </div>
          <h1 className="font-display text-2xl font-bold text-slate-900 mt-1">
            Parent Guidance &amp; School Prep
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Educational support ideas only—never clinical diagnosis or medical advice.
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetChat}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-[#FAF9F6] px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Reset Chat
        </button>
      </div>

      {/* Quick Prompts */}
      <div className="flex flex-wrap gap-2">
        {QUICK_PROMPTS.map((q) => (
          <button
            key={q}
            type="button"
            disabled={loading}
            onClick={() => sendMessage(q)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/60 hover:text-indigo-800 transition-colors cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Stream */}
      <div className="rounded-2xl border border-slate-200 bg-white flex flex-col min-h-[420px] max-h-[560px]">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'border border-slate-200 bg-[#FAF9F6] text-slate-800'
                }`}
              >
                {msg.sourceLabel && msg.role === 'assistant' && (
                  <p className="text-[11px] font-semibold text-indigo-700 mb-1">
                    {msg.sourceLabel}
                  </p>
                )}
                {msg.text}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-[#FAF9F6] px-4 py-3 text-xs text-slate-600">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" aria-hidden="true" />
                Thinking through {student.name}’s learning notes...
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
                onClick={handleUseDemoReplyForLast}
                className="inline-flex items-center gap-1 rounded-lg border border-rose-300 bg-white px-2.5 py-1 font-semibold hover:bg-rose-100 cursor-pointer shrink-0"
              >
                <RefreshCw className="h-3 w-3" aria-hidden="true" />
                Use Demo Response
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
            aria-label="Ask Parent and Counselor Hub"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask about ${student.name}'s activities, routines, or school check-ins...`}
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50 cursor-pointer shrink-0"
          >
            <Send className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
