import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calculator,
  CheckCircle2,
  PenTool,
  Sparkles,
  Timer,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import type { CheckStatus, CheckType, LearningModule } from '../../types/neuro';
import { playGentleSuccess, playSoftTap } from '../../utils/gentleAudio';
import { CheckResultsSummary } from './CheckResultsSummary';
import { FocusCheckFlow } from './FocusCheckFlow';
import { LumiGuide } from './LumiGuide';
import { NumberCheckFlow } from './NumberCheckFlow';
import { ReadingCheckFlow } from './ReadingCheckFlow';
import { WritingCheckFlow } from './WritingCheckFlow';

interface CheckHubProps {
  standalone?: boolean;
}

interface CheckMeta {
  id: CheckType;
  title: string;
  focusLabel: string;
  description: string;
  timeNeeded: string;
  connectedWorld: LearningModule;
  cardBg: string;
  cardBorder: string;
  iconBg: string;
  btnClass: string;
  icon: React.ReactNode;
}

const CHECK_CARDS: CheckMeta[] = [
  {
    id: 'reading',
    title: 'Reading Check',
    focusLabel: 'Dyslexia Support',
    description:
      'Play five sound, letter-sound, made-up word, spelling, and memory span games in English, Hindi, or Kannada.',
    timeNeeded: '6-8 minutes',
    connectedWorld: 'Reading World',
    cardBg: 'bg-[#E0F2FE]/70',
    cardBorder: 'border-sky-300',
    iconBg: 'bg-sky-700 text-white',
    btnClass: 'bg-sky-700 hover:bg-sky-800 text-white',
    icon: <BookOpen className="h-6 w-6" aria-hidden="true" />,
  },
  {
    id: 'number',
    title: 'Number Check',
    focusLabel: 'Dyscalculia Support',
    description:
      'Compare dot groups, compare written numbers, and solve quick addition and subtraction sums within 20.',
    timeNeeded: '3-5 minutes',
    connectedWorld: 'Number World',
    cardBg: 'bg-[#D1FAE5]/70',
    cardBorder: 'border-emerald-300',
    iconBg: 'bg-emerald-700 text-white',
    btnClass: 'bg-emerald-700 hover:bg-emerald-800 text-white',
    icon: <Calculator className="h-6 w-6" aria-hidden="true" />,
  },
  {
    id: 'writing',
    title: 'Writing Check',
    focusLabel: 'Dysgraphia Support',
    description:
      'Copy a short sentence, write digits 0 to 9, and trace a spiral, circle, and straight line on canvas.',
    timeNeeded: '4-6 minutes',
    connectedWorld: 'Writing World',
    cardBg: 'bg-[#FEF9C3]/80',
    cardBorder: 'border-amber-300',
    iconBg: 'bg-amber-600 text-white',
    btnClass: 'bg-amber-700 hover:bg-amber-800 text-white',
    icon: <PenTool className="h-6 w-6" aria-hidden="true" />,
  },
  {
    id: 'focus',
    title: 'Focus Check',
    focusLabel: 'ADHD Support',
    description:
      'Play the Star & Moon attention game, paired with a parent and teacher everyday behaviour checklist.',
    timeNeeded: '5-8 minutes',
    connectedWorld: 'Focus World',
    cardBg: 'bg-[#FFE4E6]/80',
    cardBorder: 'border-rose-300',
    iconBg: 'bg-rose-700 text-white',
    btnClass: 'bg-rose-700 hover:bg-rose-800 text-white',
    icon: <Timer className="h-6 w-6" aria-hidden="true" />,
  },
];

export const CheckHub: React.FC<CheckHubProps> = ({ standalone = false }) => {
  const {
    state,
    activeRole,
    activeStudent,
    activeStudentId,
    setActiveStudentId,
    setRoute,
    setActiveRole,
    setRequestedWorld,
    getStudentChecks,
    updateCheckStatus,
    consentAccepted,
    setConsentAccepted,
    soundEnabled,
    setSoundEnabled,
    accessibilityPrefs,
    setAccessibilityPrefs,
    prefersReducedMotion,
  } = useAppData();

  const [consentInputChecked, setConsentInputChecked] = useState(consentAccepted);
  const [activeCheck, setActiveCheck] = useState<CheckType | null>(null);

  const isAdultPortal = !standalone && (activeRole === 'parent' || activeRole === 'school');
  const studentChecks = getStudentChecks(activeStudent.id);
  const doneCount = Object.values(studentChecks).filter((s) => s === 'Done').length;

  const lumiLine = activeCheck
    ? 'Take your time — you are doing great!'
    : doneCount > 0
      ? `Great progress! You finished ${doneCount} of 4 checks.`
      : 'Ready to play? Pick any check card below!';

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (next) {
      playSoftTap(true);
    }
  };

  const handleStartCheck = (checkId: CheckType) => {
    playSoftTap(soundEnabled);
    if (studentChecks[checkId] === 'Not started') {
      updateCheckStatus(activeStudent.id, checkId, 'In progress');
    }
    setActiveCheck(checkId);
  };

  const handleJumpToWorld = (worldId: CheckType) => {
    playSoftTap(soundEnabled);
    setRequestedWorld(worldId);
    setActiveRole('student');
    setRoute('portal');
  };

  const statusBadgeStyle = (status: CheckStatus) => {
    if (status === 'Done') return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    if (status === 'In progress') return 'bg-amber-100 text-amber-900 border-amber-300';
    return 'bg-white/90 text-slate-700 border-slate-300';
  };

  return (
    <div
      className={`${
        standalone ? 'min-h-screen bg-[#F8FAFC]' : ''
      } text-slate-900 ${accessibilityPrefs.reducedMotion ? 'reduced-motion' : ''}`}
    >
      {/* Standalone Top Header when launched from Landing Page */}
      {standalone && (
        <header className="no-print sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
            <button
              type="button"
              onClick={() => setRoute('landing')}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer whitespace-nowrap"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Back to Home
            </button>

            <span className="font-display text-lg sm:text-xl font-bold tracking-tight text-[#0B1D3A] whitespace-nowrap">
              3DA NeuroLearning · Let&apos;s Check
            </span>

            <button
              type="button"
              onClick={() => setRoute('login')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#0B1D3A] px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 cursor-pointer whitespace-nowrap"
            >
              Start Your Journey
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </header>
      )}

      <div className={`${standalone ? 'mx-auto max-w-6xl px-6 py-8 sm:py-10' : ''} space-y-6`}>
        {/* Top Controls + Lumi Guide */}
        <div className="no-print rounded-3xl border-2 border-sky-200 bg-gradient-to-br from-[#FFFDF7] via-[#E0F2FE]/55 to-[#F3E8FF]/45 p-6 sm:p-7">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            <LumiGuide
              message={lumiLine}
              subMessage={`Active profile: ${activeStudent.name} (${activeStudent.className})`}
            />

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {standalone && (
                <select
                  aria-label="Switch student profile"
                  value={activeStudentId}
                  onChange={(e) => setActiveStudentId(e.target.value)}
                  className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800"
                >
                  {state.students.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.className})
                    </option>
                  ))}
                </select>
              )}

              <button
                type="button"
                aria-pressed={soundEnabled}
                onClick={handleToggleSound}
                className={`inline-flex items-center gap-2 rounded-xl border-2 px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  soundEnabled
                    ? 'border-emerald-400 bg-[#D1FAE5] text-emerald-950'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {soundEnabled ? (
                  <Volume2 className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <VolumeX className="h-4 w-4" aria-hidden="true" />
                )}
                {soundEnabled ? 'Sound On' : 'Sound Off'}
              </button>

              <button
                type="button"
                aria-pressed={accessibilityPrefs.reducedMotion}
                onClick={() =>
                  setAccessibilityPrefs((p) => ({ ...p, reducedMotion: !p.reducedMotion }))
                }
                className={`rounded-xl border-2 px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer whitespace-nowrap ${
                  accessibilityPrefs.reducedMotion
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {accessibilityPrefs.reducedMotion ? 'Motion: Static' : 'Smooth Motion'}
              </button>
            </div>
          </div>

          {/* Progress Path with moving character */}
          <div className="mt-6 rounded-2xl border border-sky-200 bg-white/95 p-4 sm:p-5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-3">
              <span>Screening Progress Path</span>
              <span className="font-mono tabular-nums text-blue-800">
                {doneCount} of 4 checks finished
              </span>
            </div>

            <div className="relative pt-2 pb-1">
              <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  initial={false}
                  animate={{ width: `${(doneCount / 4) * 100}%` }}
                  transition={
                    prefersReducedMotion ? { duration: 0 } : { duration: 0.7, ease: 'easeOut' }
                  }
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 via-emerald-500 to-amber-400"
                />
              </div>

              <motion.div
                initial={false}
                animate={{ left: `${Math.min(92, Math.max(2, (doneCount / 4) * 90))}%` }}
                transition={
                  prefersReducedMotion ? { duration: 0 } : { duration: 0.7, ease: 'easeOut' }
                }
                style={{ top: '-4px' }}
                className="absolute -translate-x-1/2 pointer-events-none"
              >
                <div className="h-7 w-7 rounded-full border-2 border-amber-400 bg-[#FEF9C3] flex items-center justify-center shadow-xs">
                  <Sparkles className="h-3.5 w-3.5 text-amber-800" aria-hidden="true" />
                </div>
              </motion.div>

              <div className="mt-3 grid grid-cols-4 gap-2 text-center text-[11px] font-semibold text-slate-600">
                {CHECK_CARDS.map((c) => {
                  const isDone = studentChecks[c.id] === 'Done';
                  return (
                    <span
                      key={c.id}
                      className={isDone ? 'text-emerald-800 font-bold' : 'text-slate-500'}
                    >
                      {isDone
                        ? `★ ${c.title.replace(' Check', '')}`
                        : c.title.replace(' Check', '')}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* CONSENT GATE (only the parent/teacher consent checkbox, no extra disclaimer) */}
        {!consentAccepted ? (
          <motion.div
            initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.35 }}
            className="rounded-3xl border-2 border-slate-200 bg-white p-6 sm:p-8 space-y-5"
          >
            <div className="max-w-2xl space-y-2">
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                Consent Confirmation
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[#0B1D3A]">
                Before starting these games
              </h2>
            </div>

            <label className="flex items-start gap-3 rounded-2xl border-2 border-slate-200 bg-[#FFFDF7] p-4 cursor-pointer hover:border-blue-400">
              <input
                type="checkbox"
                checked={consentInputChecked}
                onChange={(e) => setConsentInputChecked(e.target.checked)}
                className="mt-1 h-5 w-5 accent-blue-700 shrink-0"
              />
              <span className="text-sm sm:text-base font-semibold text-slate-900">
                A parent or teacher has agreed to start these games. Results are stored for this
                account only and can be cleared with Manage Data.
              </span>
            </label>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={!consentInputChecked}
                onClick={() => {
                  playGentleSuccess(soundEnabled);
                  setConsentAccepted(true);
                }}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#0B1D3A] px-6 py-3.5 text-sm sm:text-base font-bold text-white hover:bg-slate-800 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
              >
                <Sparkles className="h-5 w-5" aria-hidden="true" />
                Continue to Checks
              </button>
            </div>
          </motion.div>
        ) : activeCheck === 'focus' ? (
          <FocusCheckFlow
            standalone={standalone}
            onBack={() => setActiveCheck(null)}
            onJumpToFocusWorld={() => handleJumpToWorld('focus')}
          />
        ) : activeCheck === 'number' ? (
          <NumberCheckFlow
            standalone={standalone}
            onBack={() => setActiveCheck(null)}
            onJumpToNumberWorld={() => handleJumpToWorld('number')}
          />
        ) : activeCheck === 'reading' ? (
          <ReadingCheckFlow
            standalone={standalone}
            onBack={() => setActiveCheck(null)}
            onJumpToReadingWorld={() => handleJumpToWorld('reading')}
          />
        ) : activeCheck === 'writing' ? (
          <WritingCheckFlow
            standalone={standalone}
            onBack={() => setActiveCheck(null)}
            onJumpToWritingWorld={() => handleJumpToWorld('writing')}
          />
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key="hub-grid"
              initial={prefersReducedMotion ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.3 }}
              className="space-y-6"
            >
              <div className="no-print grid grid-cols-1 md:grid-cols-2 gap-6">
                {CHECK_CARDS.map((card) => {
                  const status = studentChecks[card.id];
                  return (
                    <motion.div
                      key={card.id}
                      whileHover={prefersReducedMotion ? undefined : { y: -4, scale: 1.01 }}
                      whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                      transition={
                        prefersReducedMotion
                          ? { duration: 0 }
                          : { type: 'spring', stiffness: 260, damping: 22 }
                      }
                      className={`rounded-3xl border-2 ${card.cardBorder} ${card.cardBg} p-6 sm:p-7 flex flex-col justify-between gap-5`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className={`rounded-2xl p-3.5 ${card.iconBg} shrink-0`}>
                            {card.icon}
                          </div>
                          <span
                            className={`rounded-xl border px-3 py-1 text-xs font-bold ${statusBadgeStyle(
                              status
                            )}`}
                          >
                            {status}
                          </span>
                        </div>

                        <div className="mt-4">
                          <p className="text-xs font-bold text-slate-600">
                            {card.focusLabel} · {card.timeNeeded}
                          </p>
                          <h3 className="mt-1 font-display text-2xl font-bold text-slate-900">
                            {card.title}
                          </h3>
                          <p className="mt-2 text-sm sm:text-base text-slate-700 leading-relaxed">
                            {card.description}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3 pt-3 border-t border-slate-900/10">
                        <p className="text-xs font-semibold text-slate-700">
                          Connects to:{' '}
                          <span className="font-bold text-slate-900">{card.connectedWorld}</span>
                        </p>
                        <div className="flex flex-wrap items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => handleStartCheck(card.id)}
                            className={`inline-flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-bold cursor-pointer ${card.btnClass}`}
                          >
                            {status === 'Done'
                              ? 'Play Again'
                              : status === 'In progress'
                                ? 'Continue Check'
                                : 'Start Check'}
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleJumpToWorld(card.id)}
                            className="inline-flex items-center gap-1.5 rounded-2xl border-2 border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-50 cursor-pointer"
                          >
                            <CheckCircle2
                              className="h-4 w-4 text-emerald-700"
                              aria-hidden="true"
                            />
                            Go to {card.connectedWorld}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Adult-only Unified Printable Results Page */}
              {isAdultPortal && (
                <CheckResultsSummary
                  student={activeStudent}
                  onNextStepWorld={handleJumpToWorld}
                  onStartOrOpenCheck={(checkId) => handleStartCheck(checkId)}
                />
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
