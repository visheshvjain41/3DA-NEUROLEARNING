import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  Moon,
  Play,
  Sparkles,
  Star,
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import type {
  FocusQuestionnaireResult,
  StarMoonGameResult,
  TrafficBand,
} from '../../types/neuro';
import { playCelebrationChord, playGentleSuccess, playSoftTap } from '../../utils/gentleAudio';

interface FocusCheckFlowProps {
  standalone?: boolean;
  onBack: () => void;
  onJumpToFocusWorld: () => void;
}

const RATING_OPTIONS = [
  { value: 0, label: '0 · Not at all' },
  { value: 1, label: '1 · Just a little' },
  { value: 2, label: '2 · Quite a bit' },
  { value: 3, label: '3 · Very much' },
] as const;

// 18 original plain-language items: 9 inattention (0..8) + 9 hyperactivity/impulsivity (9..17)
const INATTENTION_ITEMS = [
  'Has trouble keeping attention on tasks or play',
  'Often misses small details or makes quick slip-ups in schoolwork',
  'Seems to drift off when spoken to directly',
  'Starts assignments or chores but leaves them half-finished',
  'Finds it hard to organize folders, steps, or daily belongings',
  'Puts off tasks that require steady mental effort',
  'Often loses things needed for school, such as pencils or notebooks',
  'Is easily distracted by nearby sounds or movement',
  'Forgets everyday steps, instructions, or items in daily routines',
];

const HYPERACTIVITY_ITEMS = [
  'Fidgets with hands or feet or squirms in their seat',
  'Gets up from their seat when expected to stay seated',
  'Moves around, climbs, or feels restless when others sit still',
  'Finds it difficult to play or work quietly',
  'Often seems constantly in motion or on the go',
  'Talks much more than usual during lessons or conversations',
  'Blurts out an answer before a question is finished',
  'Has trouble waiting for their turn in lines or group games',
  'Interrupts or steps into others’ conversations or activities',
];

const ALL_ITEMS = [
  ...INATTENTION_ITEMS.map((text, idx) => ({ id: idx, group: 'Inattention' as const, text })),
  ...HYPERACTIVITY_ITEMS.map((text, idx) => ({
    id: idx + 9,
    group: 'Hyperactivity / Impulsivity' as const,
    text,
  })),
];

// Placeholder thresholds (indicative only): < 1.2 Green, 1.2 to < 1.8 Amber, >= 1.8 Red
function bandForFocusAvg(avg: number): TrafficBand {
  if (avg < 1.2) return 'Green';
  if (avg < 1.8) return 'Amber';
  return 'Red';
}

function bandBadgeClass(band: TrafficBand) {
  if (band === 'Green') return 'border-emerald-300 bg-emerald-50 text-emerald-900';
  if (band === 'Amber') return 'border-amber-300 bg-amber-50 text-amber-900';
  return 'border-rose-300 bg-rose-50 text-rose-900';
}

type StimulusType = 'star' | 'moon';

interface TrialSpec {
  id: number;
  type: StimulusType;
}

// 42 balanced stimuli (~2 min total: 2.1s visible + 0.75s blank pause per item)
function buildStimulusDeck(): TrialSpec[] {
  const deck: StimulusType[] = [
    ...Array.from({ length: 27 }, () => 'star' as const),
    ...Array.from({ length: 15 }, () => 'moon' as const),
  ];
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = deck[i];
    deck[i] = deck[j];
    deck[j] = tmp;
  }
  return deck.map((type, id) => ({ id, type }));
}

function calcSd(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((acc, v) => acc + (v - mean) ** 2, 0) / values.length;
  return Math.round(Math.sqrt(variance));
}

export const FocusCheckFlow: React.FC<FocusCheckFlowProps> = ({
  standalone = false,
  onBack,
  onJumpToFocusWorld,
}) => {
  const {
    activeRole,
    activeStudent,
    focusCheckResults,
    saveFocusQuestionnaire,
    saveStarMoonResult,
    updateCheckStatus,
    soundEnabled,
    prefersReducedMotion,
    logStudentActivity,
  } = useAppData();

  const isAdultPortal = !standalone && (activeRole === 'parent' || activeRole === 'school');
  const existing = focusCheckResults[activeStudent.id];

  const [tab, setTab] = useState<'questionnaire' | 'game'>(
    isAdultPortal ? 'questionnaire' : 'game'
  );

  // Part 1: Questionnaire state
  const [ratings, setRatings] = useState<(number | null)[]>(() =>
    existing?.questionnaire?.ratings
      ? [...existing.questionnaire.ratings]
      : Array.from({ length: 18 }, () => null)
  );
  const [qError, setQError] = useState('');
  const [qSavedBanner, setQSavedBanner] = useState(false);

  useEffect(() => {
    const rec = focusCheckResults[activeStudent.id]?.questionnaire;
    setRatings(rec?.ratings ? [...rec.ratings] : Array.from({ length: 18 }, () => null));
    setQError('');
    setQSavedBanner(false);
  }, [activeStudent.id, focusCheckResults]);

  const answeredCount = ratings.filter((r) => r !== null).length;

  const handleSubmitQuestionnaire = (e: React.FormEvent) => {
    e.preventDefault();
    if (ratings.some((r) => r === null)) {
      setQError(`Please rate all 18 items (${answeredCount}/18 completed).`);
      return;
    }
    setQError('');
    const numeric = ratings as number[];
    const inattSum = numeric.slice(0, 9).reduce((a, b) => a + b, 0);
    const hyperSum = numeric.slice(9, 18).reduce((a, b) => a + b, 0);
    const inattentionAvg = Number((inattSum / 9).toFixed(2));
    const hyperactivityAvg = Number((hyperSum / 9).toFixed(2));

    const result: FocusQuestionnaireResult = {
      ratings: numeric,
      inattentionAvg,
      hyperactivityAvg,
      inattentionBand: bandForFocusAvg(inattentionAvg),
      hyperactivityBand: bandForFocusAvg(hyperactivityAvg),
      respondentRole: activeRole === 'parent' ? 'parent' : 'school',
      completedAt: new Date().toISOString().slice(0, 10),
    };
    saveFocusQuestionnaire(activeStudent.id, result);
    setQSavedBanner(true);
  };

  // Part 2: Star and Moon game state
  const [gamePhase, setGamePhase] = useState<'intro' | 'playing' | 'done'>('intro');
  const [deck, setDeck] = useState<TrialSpec[]>([]);
  const [trialIndex, setTrialIndex] = useState<number>(0);
  const [stimulusVisible, setStimulusVisible] = useState<boolean>(false);
  const [tappedThisTrial, setTappedThisTrial] = useState<boolean>(false);
  const [tapFeedback, setTapFeedback] = useState<string>('');

  const shownAtRef = useRef<number>(0);
  const tappedRef = useRef<boolean>(false);
  const missedStarsRef = useRef<number>(0);
  const wrongMoonsRef = useRef<number>(0);
  const starsHitRef = useRef<number>(0);
  const reactionTimesRef = useRef<number[]>([]);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  useEffect(() => {
    return () => clearTimers();
  }, []);

  const finishGame = (finalDeck: TrialSpec[], trialsCompleted: number) => {
    clearTimers();
    const completedSlice = finalDeck.slice(0, trialsCompleted);
    const totalStars = completedSlice.filter((t) => t.type === 'star').length;
    const totalMoons = completedSlice.filter((t) => t.type === 'moon').length;

    const result: StarMoonGameResult = {
      missedStars: missedStarsRef.current,
      wrongMoonTaps: wrongMoonsRef.current,
      reactionTimeSdMs: calcSd(reactionTimesRef.current),
      starsHit: starsHitRef.current,
      totalStars,
      totalMoons,
      completedAt: new Date().toISOString().slice(0, 10),
    };

    saveStarMoonResult(activeStudent.id, result);
    playCelebrationChord(soundEnabled);
    logStudentActivity({
      studentId: activeStudent.id,
      module: 'Focus World',
      activityTitle: "Let's Check: Star and Moon Focus Activity",
      durationMinutes: 3,
      status: 'Completed',
      studentFeedback: 'Completed the Star and Moon focus activity.',
      feelingTag: 'Steady',
      achievementTitle: 'Star Spotter',
      achievementDescription: 'Completed the Star and Moon focus check.',
    });
    setGamePhase('done');
  };

  const runTrial = (currentDeck: TrialSpec[], idx: number) => {
    if (idx >= currentDeck.length) {
      finishGame(currentDeck, currentDeck.length);
      return;
    }

    setTrialIndex(idx);
    setStimulusVisible(true);
    setTappedThisTrial(false);
    setTapFeedback('');
    tappedRef.current = false;
    shownAtRef.current = performance.now();

    const tHide = window.setTimeout(() => {
      if (currentDeck[idx].type === 'star' && !tappedRef.current) {
        missedStarsRef.current += 1;
      }
      setStimulusVisible(false);

      const tNext = window.setTimeout(() => {
        runTrial(currentDeck, idx + 1);
      }, 750);
      timersRef.current.push(tNext);
    }, 2100);

    timersRef.current.push(tHide);
  };

  const startStarMoonGame = () => {
    playSoftTap(soundEnabled);
    clearTimers();
    const newDeck = buildStimulusDeck();
    setDeck(newDeck);
    missedStarsRef.current = 0;
    wrongMoonsRef.current = 0;
    starsHitRef.current = 0;
    reactionTimesRef.current = [];
    updateCheckStatus(activeStudent.id, 'focus', 'In progress');
    setGamePhase('playing');
    runTrial(newDeck, 0);
  };

  const handleStimulusTap = () => {
    if (gamePhase !== 'playing' || !stimulusVisible || tappedRef.current) return;
    tappedRef.current = true;
    setTappedThisTrial(true);
    const current = deck[trialIndex];
    const rt = Math.round(performance.now() - shownAtRef.current);

    if (current?.type === 'star') {
      starsHitRef.current += 1;
      reactionTimesRef.current.push(rt);
      playGentleSuccess(soundEnabled);
      setTapFeedback('Nice tap!');
    } else if (current?.type === 'moon') {
      wrongMoonsRef.current += 1;
      setTapFeedback('Moon — hold off next time');
    }
  };

  const currentStimulus = deck[trialIndex];
  const savedStarMoon = existing?.starMoonGame;
  const savedQ = existing?.questionnaire;

  const focusEtaMinutes = useMemo(() => {
    const remainingSec = Math.max(0, (deck.length - trialIndex) * 2.85);
    return Math.max(1, Math.ceil(remainingSec / 60));
  }, [deck.length, trialIndex]);

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => {
            clearTimers();
            onBack();
          }}
          className="inline-flex items-center gap-1.5 rounded-2xl border-2 border-slate-300 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-50 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Let&apos;s Check
        </button>

        {isAdultPortal && (
          <div className="flex items-center gap-1 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                clearTimers();
                setTab('questionnaire');
              }}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold cursor-pointer ${
                tab === 'questionnaire'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Part 1: Parent / Teacher Form
            </button>
            <button
              type="button"
              onClick={() => setTab('game')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold cursor-pointer ${
                tab === 'game'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Part 2: Star &amp; Moon Game
            </button>
          </div>
        )}
      </div>

      {/* PART 1: PARENT / TEACHER QUESTIONNAIRE (Parent and School views only) */}
      {isAdultPortal && tab === 'questionnaire' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-700">
                  <ClipboardList className="h-4 w-4" aria-hidden="true" />
                  <span>Focus Check · Part 1 (Parent / Teacher Questionnaire)</span>
                </div>
                <h2 className="mt-1 font-display text-xl sm:text-2xl font-bold text-slate-900">
                  Everyday Attention &amp; Activity Check for {activeStudent.name}
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-600">
                  Rate how often each everyday behaviour has been noticed over recent weeks (18
                  items: 9 Inattention, 9 Hyperactivity / Impulsivity).
                </p>
              </div>
              <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg px-3 py-1.5 tabular-nums">
                {answeredCount} / 18 rated
              </span>
            </div>

            {savedQ && (
              <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-display text-base font-bold text-slate-900">
                    Recorded Questionnaire Summary ({savedQ.respondentRole})
                  </h3>
                  <span className="text-xs font-medium text-slate-600">
                    Indicative results
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-600">
                        Inattention Average (9 items)
                      </span>
                      <span
                        className={`rounded-md border px-2.5 py-0.5 text-xs font-bold ${bandBadgeClass(
                          savedQ.inattentionBand
                        )}`}
                      >
                        Indicative result: {savedQ.inattentionBand}
                      </span>
                    </div>
                    <p className="mt-2 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                      {savedQ.inattentionAvg.toFixed(2)} / 3.00
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-600">
                        Hyperactivity / Impulsivity Average (9 items)
                      </span>
                      <span
                        className={`rounded-md border px-2.5 py-0.5 text-xs font-bold ${bandBadgeClass(
                          savedQ.hyperactivityBand
                        )}`}
                      >
                        Indicative result: {savedQ.hyperactivityBand}
                      </span>
                    </div>
                    <p className="mt-2 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                      {savedQ.hyperactivityAvg.toFixed(2)} / 3.00
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200 text-xs text-slate-600">
                  <span>Screening support tool. Results are not a medical diagnosis.</span>
                  <button
                    type="button"
                    onClick={onJumpToFocusWorld}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B1D3A] px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
                  >
                    Open Focus World
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmitQuestionnaire} className="space-y-6">
              {(['Inattention', 'Hyperactivity / Impulsivity'] as const).map((groupName) => {
                const items = ALL_ITEMS.filter((it) => it.group === groupName);
                return (
                  <div key={groupName} className="space-y-3">
                    <h3 className="font-display text-base font-bold text-slate-900 border-b border-slate-200 pb-2">
                      {groupName} (9 items)
                    </h3>
                    <div className="space-y-3">
                      {items.map((item, idx) => (
                        <div
                          key={item.id}
                          className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3"
                        >
                          <p className="text-sm font-medium text-slate-900">
                            <span className="font-mono text-xs text-slate-500 mr-2 tabular-nums">
                              {String(idx + 1).padStart(2, '0')}.
                            </span>
                            {item.text}
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 shrink-0">
                            {RATING_OPTIONS.map((opt) => {
                              const selected = ratings[item.id] === opt.value;
                              return (
                                <button
                                  key={opt.value}
                                  type="button"
                                  onClick={() =>
                                    setRatings((prev) =>
                                      prev.map((v, i) => (i === item.id ? opt.value : v))
                                    )
                                  }
                                  className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                                    selected
                                      ? 'border-blue-700 bg-blue-700 text-white'
                                      : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100'
                                  }`}
                                >
                                  {opt.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {qError && (
                <div
                  role="alert"
                  className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-800"
                >
                  {qError}
                </div>
              )}

              {qSavedBanner && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-900">
                  Focus Check Part 1 scores saved for {activeStudent.name}.
                </div>
              )}

              <div className="flex flex-wrap items-center justify-end gap-3 pt-2 border-t border-slate-200">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0B1D3A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  Calculate &amp; Save Questionnaire
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PART 2: STAR AND MOON GAME (Child-facing + Adult informational readout) */}
      {(!isAdultPortal || tab === 'game') && (
        <div className="space-y-6">
          {gamePhase === 'intro' && (
            <div className="rounded-3xl border-2 border-rose-200 bg-[#FFFDF7] p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-rose-800 uppercase tracking-wide">
                    Focus Check · Star and Moon Game (2–3 minutes)
                  </p>
                  <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold text-slate-900">
                    Tap the Star, Skip the Moon
                  </h2>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border-2 border-amber-200 bg-[#FEF9C3] px-4 py-2.5">
                  <Star className="h-6 w-6 fill-amber-400 text-amber-600" aria-hidden="true" />
                  <span className="text-xs font-bold text-slate-800">Tap Stars</span>
                  <Moon className="h-6 w-6 text-indigo-700 ml-2" aria-hidden="true" />
                  <span className="text-xs font-bold text-slate-800">Let Moons Pass</span>
                </div>
              </div>

              <p className="text-sm sm:text-base text-slate-700 leading-relaxed max-w-2xl">
                Stars and moons will appear one at a time in the sky box. Tap only when you see a
                bright star. Let the moons drift by without tapping. There is no flashing and no
                loud sound.
              </p>

              <button
                type="button"
                onClick={startStarMoonGame}
                className="inline-flex items-center gap-2 rounded-2xl bg-rose-700 px-6 py-3.5 text-sm sm:text-base font-bold text-white hover:bg-rose-800 cursor-pointer"
              >
                <Play className="h-5 w-5" aria-hidden="true" />
                Start Star &amp; Moon Game
              </button>

              {/* Adult-only saved Star & Moon summary */}
              {isAdultPortal && savedStarMoon && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-display text-base font-bold text-slate-900">
                      Recorded Star &amp; Moon Metrics ({activeStudent.name})
                    </h3>
                    <span className="text-xs font-medium text-slate-600">
                      Shown for information; no score or label is given for this game.
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-3.5">
                      <p className="text-xs text-slate-600">Missed stars</p>
                      <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                        {savedStarMoon.missedStars}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-3.5">
                      <p className="text-xs text-slate-600">Wrong taps on moons</p>
                      <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                        {savedStarMoon.wrongMoonTaps}
                      </p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-3.5">
                      <p className="text-xs text-slate-600">Reaction-time variation (SD)</p>
                      <p className="mt-1 font-mono text-2xl font-bold text-slate-900 tabular-nums">
                        {savedStarMoon.reactionTimeSdMs} ms
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    Screening support tool. Results are not a medical diagnosis.
                  </p>
                </div>
              )}
            </div>
          )}

          {gamePhase === 'playing' && (
            <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 rounded-xl px-3 py-1.5 tabular-nums">
                  Shape {trialIndex + 1} of {deck.length} · ~{focusEtaMinutes} min left
                </span>
                <button
                  type="button"
                  onClick={() => finishGame(deck, trialIndex + 1)}
                  className="rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Finish Game
                </button>
              </div>

              <div className="w-full h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-rose-600 transition-all duration-300"
                  style={{ width: `${((trialIndex + 1) / Math.max(1, deck.length)) * 100}%` }}
                />
              </div>

              {/* Sky arena — high-contrast navy, smooth appearance, zero flashing */}
              <div className="rounded-3xl bg-[#0B1D3A] p-8 sm:p-12 flex flex-col items-center justify-center min-h-[290px]">
                {stimulusVisible && currentStimulus ? (
                  <motion.button
                    key={currentStimulus.id}
                    type="button"
                    initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.2 }}
                    onClick={handleStimulusTap}
                    aria-label={
                      currentStimulus.type === 'star'
                        ? 'Star — tap now'
                        : 'Moon — do not tap'
                    }
                    className={`h-40 w-40 rounded-3xl border-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors ${
                      tappedThisTrial
                        ? 'border-sky-300 bg-white/15'
                        : 'border-white/25 bg-white/10 hover:bg-white/15'
                    }`}
                  >
                    {currentStimulus.type === 'star' ? (
                      <Star
                        className="h-20 w-20 fill-amber-300 text-amber-300"
                        aria-hidden="true"
                      />
                    ) : (
                      <Moon
                        className="h-20 w-20 fill-sky-200 text-sky-200"
                        aria-hidden="true"
                      />
                    )}
                    <span className="text-xs font-bold text-white/90">
                      {currentStimulus.type === 'star' ? 'STAR' : 'MOON'}
                    </span>
                  </motion.button>
                ) : (
                  <div className="h-40 flex items-center justify-center text-sm font-medium text-slate-300">
                    Next shape coming up...
                  </div>
                )}

                <p className="mt-5 h-5 text-sm font-bold text-amber-200">
                  {tapFeedback || 'Tap only when a Star appears'}
                </p>
              </div>
            </div>
          )}

          {gamePhase === 'done' && (
            <motion.div
              initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.35 }}
              className="rounded-3xl border-2 border-amber-300 bg-[#FFFDF7] p-7 sm:p-10 text-center space-y-5"
            >
              <div className="flex justify-center gap-3">
                {[0, 1, 2].map((starIdx) => (
                  <motion.div
                    key={starIdx}
                    initial={prefersReducedMotion ? false : { scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : { delay: starIdx * 0.14, duration: 0.4 }
                    }
                    className="rounded-2xl border-2 border-amber-300 bg-[#FEF9C3] p-3.5"
                  >
                    <Star className="h-8 w-8 fill-amber-400 text-amber-600" aria-hidden="true" />
                  </motion.div>
                ))}
              </div>

              <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                Great focus!
              </h2>

              {!isAdultPortal ? (
                <p className="mx-auto max-w-md text-sm sm:text-base text-slate-700">
                  Awesome job watching for every bright star! Ready to play in Focus World or try
                  another activity?
                </p>
              ) : (
                savedStarMoon && (
                  <div className="mx-auto max-w-2xl rounded-2xl border border-slate-200 bg-white p-5 text-left space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h3 className="font-display text-base font-bold text-slate-900">
                        Star &amp; Moon Session Metrics
                      </h3>
                      <span className="text-xs font-medium text-slate-600">
                        Shown for information; no score or label is given for this game.
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-3">
                        <p className="text-xs text-slate-600">Missed stars</p>
                        <p className="mt-1 font-mono text-xl font-bold text-slate-900 tabular-nums">
                          {savedStarMoon.missedStars}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-3">
                        <p className="text-xs text-slate-600">Wrong taps on moons</p>
                        <p className="mt-1 font-mono text-xl font-bold text-slate-900 tabular-nums">
                          {savedStarMoon.wrongMoonTaps}
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-3">
                        <p className="text-xs text-slate-600">Reaction-time variation (SD)</p>
                        <p className="mt-1 font-mono text-xl font-bold text-slate-900 tabular-nums">
                          {savedStarMoon.reactionTimeSdMs} ms
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500">
                      Screening support tool. Results are not a medical diagnosis.
                    </p>
                  </div>
                )
              )}

              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onJumpToFocusWorld}
                  className="inline-flex items-center gap-2 rounded-2xl bg-rose-700 px-6 py-3 text-sm font-bold text-white hover:bg-rose-800 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                  Open Focus World
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
      )}
    </div>
  );
};
