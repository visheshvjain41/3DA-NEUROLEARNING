import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, Calculator, Play, Sparkles, Star } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import type { NumberTaskId, NumberTaskMetrics, TrafficBand } from '../../types/neuro';
import { playCelebrationChord, playGentleSuccess, playSoftTap } from '../../utils/gentleAudio';

interface NumberCheckFlowProps {
  standalone?: boolean;
  onBack: () => void;
  onJumpToNumberWorld: () => void;
}

interface DotTrial {
  leftCount: number;
  rightCount: number;
}

// 12 dot-comparison trials
const DOT_TRIALS: DotTrial[] = [
  { leftCount: 5, rightCount: 9 },
  { leftCount: 11, rightCount: 7 },
  { leftCount: 4, rightCount: 8 },
  { leftCount: 10, rightCount: 6 },
  { leftCount: 8, rightCount: 12 },
  { leftCount: 9, rightCount: 5 },
  { leftCount: 7, rightCount: 10 },
  { leftCount: 13, rightCount: 9 },
  { leftCount: 6, rightCount: 9 },
  { leftCount: 12, rightCount: 8 },
  { leftCount: 9, rightCount: 14 },
  { leftCount: 11, rightCount: 8 },
];

interface NumberTrial {
  left: number;
  right: number;
}

// 12 number-comparison trials
const NUMBER_TRIALS: NumberTrial[] = [
  { left: 7, right: 12 },
  { left: 19, right: 14 },
  { left: 23, right: 32 },
  { left: 41, right: 18 },
  { left: 15, right: 27 },
  { left: 56, right: 49 },
  { left: 38, right: 61 },
  { left: 74, right: 47 },
  { left: 13, right: 9 },
  { left: 68, right: 86 },
  { left: 91, right: 84 },
  { left: 29, right: 43 },
];

interface SumTrial {
  prompt: string;
  answer: number;
  options: number[];
}

// 10 addition and subtraction questions within 20
const SUM_TRIALS: SumTrial[] = [
  { prompt: '4 + 5 = ?', answer: 9, options: [8, 9, 10, 11] },
  { prompt: '11 - 4 = ?', answer: 7, options: [6, 7, 8, 9] },
  { prompt: '8 + 6 = ?', answer: 14, options: [12, 13, 14, 15] },
  { prompt: '15 - 7 = ?', answer: 8, options: [7, 8, 9, 10] },
  { prompt: '9 + 8 = ?', answer: 17, options: [15, 16, 17, 18] },
  { prompt: '18 - 5 = ?', answer: 13, options: [12, 13, 14, 15] },
  { prompt: '6 + 7 = ?', answer: 13, options: [11, 12, 13, 14] },
  { prompt: '14 - 8 = ?', answer: 6, options: [5, 6, 7, 8] },
  { prompt: '12 + 7 = ?', answer: 19, options: [17, 18, 19, 20] },
  { prompt: '16 - 9 = ?', answer: 7, options: [6, 7, 8, 9] },
];

// Deterministic non-overlapping grid coordinates inside 160x120 SVG box
const DOT_POSITIONS: Array<[number, number]> = [
  [30, 26],
  [80, 24],
  [130, 28],
  [52, 54],
  [106, 52],
  [26, 86],
  [78, 88],
  [132, 84],
  [54, 106],
  [108, 105],
  [28, 56],
  [132, 56],
  [80, 58],
  [54, 26],
];

function medianMs(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? Math.round((sorted[mid - 1] + sorted[mid]) / 2)
    : Math.round(sorted[mid]);
}

// Placeholder thresholds (indicative only): >=80 Green, 60-79 Amber, <60 Red
function accuracyBand(pct: number): TrafficBand {
  if (pct >= 80) return 'Green';
  if (pct >= 60) return 'Amber';
  return 'Red';
}

function bandClasses(band: TrafficBand) {
  if (band === 'Green') return 'border-emerald-300 bg-emerald-50 text-emerald-900';
  if (band === 'Amber') return 'border-amber-300 bg-amber-50 text-amber-900';
  return 'border-rose-300 bg-rose-50 text-rose-900';
}

function plainTaskSummary(taskId: NumberTaskId, band: TrafficBand): string {
  const area =
    taskId === 'dots'
      ? 'comparing dot quantities visually'
      : taskId === 'numbers'
        ? 'comparing written numbers'
        : 'solving quick sums within 20';
  if (band === 'Green') {
    return `Comfortable accuracy and steady fluency when ${area}.`;
  }
  if (band === 'Amber') {
    return `Mixed accuracy when ${area}; extra visual practice may help build confidence.`;
  }
  return `Extra visual scaffolding and unhurried practice may help when ${area}.`;
}

export const NumberCheckFlow: React.FC<NumberCheckFlowProps> = ({
  standalone = false,
  onBack,
  onJumpToNumberWorld,
}) => {
  const {
    activeRole,
    activeStudent,
    numberCheckResults,
    saveNumberTaskResult,
    updateCheckStatus,
    soundEnabled,
    prefersReducedMotion,
    logStudentActivity,
  } = useAppData();

  const isAdultPortal = !standalone && (activeRole === 'parent' || activeRole === 'school');
  const existing = numberCheckResults[activeStudent.id] ?? {};

  // Stage progression: overview -> dots -> numbers -> sums -> finished
  const [stage, setStage] = useState<'overview' | 'dots' | 'numbers' | 'sums' | 'finished'>(
    'overview'
  );
  const [trialIdx, setTrialIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [rts, setRts] = useState<number[]>([]);
  const trialStartRef = useRef<number>(0);

  useEffect(() => {
    if (stage === 'dots' || stage === 'numbers' || stage === 'sums') {
      trialStartRef.current = performance.now();
    }
  }, [stage, trialIdx]);

  const startAllTasks = () => {
    playSoftTap(soundEnabled);
    updateCheckStatus(activeStudent.id, 'number', 'In progress');
    setTrialIdx(0);
    setCorrectCount(0);
    setRts([]);
    setStage('dots');
  };

  const finishTaskAndAdvance = (
    taskId: NumberTaskId,
    title: string,
    finalCorrect: number,
    totalTrials: number,
    finalRts: number[],
    nextStage: 'numbers' | 'sums' | 'finished'
  ) => {
    const pct = Math.round((finalCorrect / totalTrials) * 100);
    const metrics: NumberTaskMetrics = {
      taskId,
      title,
      accuracyPct: pct,
      medianRtMs: medianMs(finalRts),
      correctCount: finalCorrect,
      totalTrials,
      band: accuracyBand(pct),
      completedAt: new Date().toISOString().slice(0, 10),
    };
    saveNumberTaskResult(activeStudent.id, metrics);

    if (nextStage === 'finished') {
      playCelebrationChord(soundEnabled);
      logStudentActivity({
        studentId: activeStudent.id,
        module: 'Number World',
        activityTitle: "Let's Check: Number Check Activity Set",
        durationMinutes: 4,
        status: 'Completed',
        studentFeedback: 'Completed Dot Comparison, Number Comparison, and Quick Sums.',
        feelingTag: 'Curious',
        achievementTitle: 'Number Explorer',
        achievementDescription: 'Completed all three Number Check games.',
      });
    } else {
      playGentleSuccess(soundEnabled);
    }

    setTrialIdx(0);
    setCorrectCount(0);
    setRts([]);
    setStage(nextStage);
  };

  const handleDotChoice = (side: 'left' | 'right') => {
    const rt = Math.max(100, Math.round(performance.now() - trialStartRef.current));
    const trial = DOT_TRIALS[trialIdx];
    const isCorrect =
      (side === 'left' && trial.leftCount > trial.rightCount) ||
      (side === 'right' && trial.rightCount > trial.leftCount);

    playSoftTap(soundEnabled);
    const nextCorrect = correctCount + (isCorrect ? 1 : 0);
    const nextRts = [...rts, rt];

    if (trialIdx + 1 < DOT_TRIALS.length) {
      setCorrectCount(nextCorrect);
      setRts(nextRts);
      setTrialIdx((i) => i + 1);
    } else {
      finishTaskAndAdvance(
        'dots',
        'Task 1 · Dot Comparison',
        nextCorrect,
        DOT_TRIALS.length,
        nextRts,
        'numbers'
      );
    }
  };

  const handleNumberChoice = (side: 'left' | 'right') => {
    const rt = Math.max(100, Math.round(performance.now() - trialStartRef.current));
    const trial = NUMBER_TRIALS[trialIdx];
    const isCorrect =
      (side === 'left' && trial.left > trial.right) ||
      (side === 'right' && trial.right > trial.left);

    playSoftTap(soundEnabled);
    const nextCorrect = correctCount + (isCorrect ? 1 : 0);
    const nextRts = [...rts, rt];

    if (trialIdx + 1 < NUMBER_TRIALS.length) {
      setCorrectCount(nextCorrect);
      setRts(nextRts);
      setTrialIdx((i) => i + 1);
    } else {
      finishTaskAndAdvance(
        'numbers',
        'Task 2 · Number Comparison',
        nextCorrect,
        NUMBER_TRIALS.length,
        nextRts,
        'sums'
      );
    }
  };

  const handleSumChoice = (picked: number) => {
    const rt = Math.max(100, Math.round(performance.now() - trialStartRef.current));
    const trial = SUM_TRIALS[trialIdx];
    const isCorrect = picked === trial.answer;

    playSoftTap(soundEnabled);
    const nextCorrect = correctCount + (isCorrect ? 1 : 0);
    const nextRts = [...rts, rt];

    if (trialIdx + 1 < SUM_TRIALS.length) {
      setCorrectCount(nextCorrect);
      setRts(nextRts);
      setTrialIdx((i) => i + 1);
    } else {
      finishTaskAndAdvance(
        'sums',
        'Task 3 · Quick Sums',
        nextCorrect,
        SUM_TRIALS.length,
        nextRts,
        'finished'
      );
    }
  };

  const taskCards = [existing.dots, existing.numbers, existing.sums].filter(
    Boolean
  ) as NumberTaskMetrics[];

  return (
    <div className="space-y-6">
      <div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 rounded-2xl border-2 border-slate-300 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-50 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Let&apos;s Check
        </button>
      </div>

      {stage === 'overview' && (
        <div className="space-y-6">
          <div className="rounded-3xl border-2 border-emerald-300 bg-[#D1FAE5]/45 p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-3 text-xs font-bold text-emerald-900">
              <Calculator className="h-5 w-5" aria-hidden="true" />
              <span>Number Check · 3–5 minutes</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              Three Quick Number Games
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="rounded-2xl border border-emerald-200 bg-white p-4">
                <p className="font-bold text-slate-900">1. Dot Comparison (12 trials)</p>
                <p className="mt-1 text-slate-600">Tap the side with more dots.</p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-white p-4">
                <p className="font-bold text-slate-900">2. Number Comparison (12 trials)</p>
                <p className="mt-1 text-slate-600">Tap the bigger written number.</p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-white p-4">
                <p className="font-bold text-slate-900">3. Quick Sums (10 questions)</p>
                <p className="mt-1 text-slate-600">Simple adding and subtracting within 20.</p>
              </div>
            </div>

            <button
              type="button"
              onClick={startAllTasks}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-700 px-6 py-3.5 text-sm sm:text-base font-bold text-white hover:bg-emerald-800 cursor-pointer"
            >
              <Play className="h-5 w-5" aria-hidden="true" />
              Start Number Check
            </button>
          </div>

          {/* Adult-only saved Number Check cards */}
          {isAdultPortal && taskCards.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Number Check Results ({activeStudent.name})
                </h3>
                <span className="text-xs font-medium text-slate-600">
                  Indicative results
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {taskCards.map((card) => (
                  <div
                    key={card.taskId}
                    className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-slate-900">{card.title}</span>
                        <span
                          className={`rounded-md border px-2 py-0.5 text-xs font-bold ${bandClasses(
                            card.band
                          )}`}
                        >
                          Indicative result: {card.band}
                        </span>
                      </div>
                      <div className="mt-2 flex items-baseline gap-4 font-mono text-sm tabular-nums text-slate-800">
                        <span>Accuracy: {card.accuracyPct}%</span>
                        <span>Median: {(card.medianRtMs / 1000).toFixed(2)}s</span>
                      </div>
                      <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                        {plainTaskSummary(card.taskId, card.band)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onJumpToNumberWorld}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0B1D3A] px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
                    >
                      Try the Number World
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500">
                Screening support tool. Results are not a medical diagnosis.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TASK 1: DOT COMPARISON */}
      {stage === 'dots' && (
        <div className="rounded-3xl border-2 border-emerald-300 bg-[#FFFDF7] p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Task 1 · Dot Comparison</span>
            <span className="font-mono tabular-nums">
              {trialIdx + 1} / {DOT_TRIALS.length}
            </span>
          </div>

          <h2 className="font-display text-2xl font-bold text-slate-900 text-center">
            Which group has MORE dots?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {(['left', 'right'] as const).map((side) => {
              const count =
                side === 'left'
                  ? DOT_TRIALS[trialIdx].leftCount
                  : DOT_TRIALS[trialIdx].rightCount;
              return (
                <motion.button
                  key={`${trialIdx}-${side}`}
                  type="button"
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                  onClick={() => handleDotChoice(side)}
                  aria-label={`${side === 'left' ? 'Left' : 'Right'} dot box`}
                  className="rounded-3xl border-2 border-sky-300 bg-white p-5 hover:border-emerald-500 transition-colors cursor-pointer flex flex-col items-center"
                >
                  <svg viewBox="0 0 160 124" className="w-full max-w-[220px] h-36">
                    {DOT_POSITIONS.slice(0, count).map(([cx, cy], dIdx) => (
                      <circle key={dIdx} cx={cx} cy={cy} r={8} fill="#0B1D3A" />
                    ))}
                  </svg>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* TASK 2: NUMBER COMPARISON */}
      {stage === 'numbers' && (
        <div className="rounded-3xl border-2 border-sky-300 bg-[#FFFDF7] p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Task 2 · Number Comparison</span>
            <span className="font-mono tabular-nums">
              {trialIdx + 1} / {NUMBER_TRIALS.length}
            </span>
          </div>

          <h2 className="font-display text-2xl font-bold text-slate-900 text-center">
            Tap the BIGGER number
          </h2>

          <div className="grid grid-cols-2 gap-5 max-w-xl mx-auto">
            {(['left', 'right'] as const).map((side) => {
              const val =
                side === 'left' ? NUMBER_TRIALS[trialIdx].left : NUMBER_TRIALS[trialIdx].right;
              return (
                <motion.button
                  key={`${trialIdx}-${side}`}
                  type="button"
                  whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                  onClick={() => handleNumberChoice(side)}
                  className="rounded-3xl border-2 border-sky-300 bg-white py-12 font-display text-5xl font-bold text-[#0B1D3A] hover:border-blue-600 hover:bg-[#E0F2FE]/45 transition-colors cursor-pointer tabular-nums"
                >
                  {val}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* TASK 3: QUICK SUMS */}
      {stage === 'sums' && (
        <div className="rounded-3xl border-2 border-amber-300 bg-[#FFFDF7] p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span>Task 3 · Quick Sums</span>
            <span className="font-mono tabular-nums">
              {trialIdx + 1} / {SUM_TRIALS.length}
            </span>
          </div>

          <h2 className="font-display text-4xl font-bold text-[#0B1D3A] text-center tabular-nums">
            {SUM_TRIALS[trialIdx].prompt}
          </h2>

          <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
            {SUM_TRIALS[trialIdx].options.map((opt) => (
              <motion.button
                key={`${trialIdx}-${opt}`}
                type="button"
                whileHover={prefersReducedMotion ? undefined : { scale: 1.02 }}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                onClick={() => handleSumChoice(opt)}
                className="rounded-3xl border-2 border-amber-300 bg-white py-6 font-display text-3xl font-bold text-slate-900 hover:border-indigo-600 hover:bg-[#FEF9C3]/65 transition-colors cursor-pointer tabular-nums"
              >
                {opt}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* COMPLETION SCREEN */}
      {stage === 'finished' && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.35 }}
          className="rounded-3xl border-2 border-emerald-300 bg-[#FFFDF7] p-7 sm:p-10 space-y-6"
        >
          <div className="text-center space-y-4">
            <div className="flex justify-center gap-3">
              {[0, 1, 2].map((starIdx) => (
                <motion.div
                  key={starIdx}
                  initial={prefersReducedMotion ? false : { scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={
                    prefersReducedMotion ? { duration: 0 } : { delay: starIdx * 0.14, duration: 0.4 }
                  }
                  className="rounded-2xl border-2 border-amber-300 bg-[#FEF9C3] p-3.5"
                >
                  <Star className="h-8 w-8 fill-amber-400 text-amber-600" aria-hidden="true" />
                </motion.div>
              ))}
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              Awesome number thinking!
            </h2>

            {!isAdultPortal && (
              <p className="mx-auto max-w-md text-sm sm:text-base text-slate-700">
                You completed all three number games! Want to build fraction bars and hop on the
                number line inside Number World?
              </p>
            )}
          </div>

          {/* Adult-only per-task traffic-light result cards */}
          {isAdultPortal && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Number Check Results ({activeStudent.name})
                </h3>
                <span className="text-xs font-medium text-slate-600">
                  Indicative results
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {taskCards.map((card) => (
                  <div
                    key={card.taskId}
                    className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-slate-900">{card.title}</span>
                        <span
                          className={`rounded-md border px-2.5 py-0.5 text-xs font-bold ${bandClasses(
                            card.band
                          )}`}
                        >
                          Indicative result: {card.band}
                        </span>
                      </div>
                      <div className="mt-2.5 flex items-baseline gap-4 font-mono text-sm tabular-nums text-slate-800">
                        <span>Accuracy: {card.accuracyPct}%</span>
                        <span>Median: {(card.medianRtMs / 1000).toFixed(2)}s</span>
                      </div>
                      <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                        {plainTaskSummary(card.taskId, card.band)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={onJumpToNumberWorld}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#0B1D3A] px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
                    >
                      Try the Number World
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>

              <p className="text-xs text-slate-500 text-center">
                Screening support tool. Results are not a medical diagnosis.
              </p>
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onJumpToNumberWorld}
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-800 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Try the Number World
            </button>
            <button
              type="button"
              onClick={onBack}
              className="rounded-2xl border-2 border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50 cursor-pointer"
            >
              Back to All Checks
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};
