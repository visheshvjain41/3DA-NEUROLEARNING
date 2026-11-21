import React, { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Timer,
  Wind,
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';

interface FocusWorldProps {
  onActivityLogged: (msg: string) => void;
}

const PATTERN_TILES = [
  { id: 0, label: 'Sky', color: 'bg-sky-500 text-white', symbol: '☁' },
  { id: 1, label: 'Leaf', color: 'bg-teal-600 text-white', symbol: '✿' },
  { id: 2, label: 'Sun', color: 'bg-amber-500 text-white', symbol: '☀' },
  { id: 3, label: 'Star', color: 'bg-rose-500 text-white', symbol: '★' },
];

export const FocusWorld: React.FC<FocusWorldProps> = ({ onActivityLogged }) => {
  const { activeStudent, logStudentActivity, accessibilityPrefs } = useAppData();

  // 1. Focus Timer
  const [presetSeconds, setPresetSeconds] = useState(300); // 5 min default
  const [secondsLeft, setSecondsLeft] = useState(300);
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    if (!timerRunning) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [timerRunning]);

  const handleSelectPreset = (sec: number) => {
    setTimerRunning(false);
    setPresetSeconds(sec);
    setSecondsLeft(sec);
  };

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const pctRemaining = presetSeconds > 0 ? (secondsLeft / presetSeconds) * 100 : 0;

  // 2. Start Now Micro-Steps
  const [taskInput, setTaskInput] = useState('Finish 5 math questions for homework');
  const [microSteps, setMicroSteps] = useState([
    { id: 'm1', text: 'Open notebook and put one pencil on the desk (30 sec)', done: false },
    { id: 'm2', text: 'Read ONLY question #1—ignore #2 to #5 for now', done: false },
    { id: 'm3', text: 'Try just the first step of question #1', done: false },
    { id: 'm4', text: 'Take a sip of water before question #2', done: false },
  ]);

  const handleGenerateTinySteps = (e: React.FormEvent) => {
    e.preventDefault();
    const t = taskInput.trim() || 'My task';
    setMicroSteps([
      { id: `${Date.now()}-1`, text: `Clear desk space for "${t}" (30 seconds)`, done: false },
      { id: `${Date.now()}-2`, text: 'Look at only the very first small piece', done: false },
      { id: `${Date.now()}-3`, text: 'Work steadily for 3 minutes without checking the clock', done: false },
      { id: `${Date.now()}-4`, text: 'Pause, stretch arms, and mark this piece done', done: false },
    ]);
  };

  // 3. 60-Second Reset
  const [resetActive, setResetActive] = useState(false);
  const [resetSeconds, setResetSeconds] = useState(60);

  useEffect(() => {
    if (!resetActive) return;
    const id = window.setInterval(() => {
      setResetSeconds((prev) => {
        if (prev <= 1) {
          setResetActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [resetActive]);

  const breathPhase =
    resetSeconds % 10 >= 6
      ? 'Breathe in slowly (4s)'
      : resetSeconds % 10 >= 4
        ? 'Hold softly (2s)'
        : 'Breathe out slowly (4s)';

  // 4. Brain & Focus Pattern Game
  const [sequence, setSequence] = useState<number[]>([0, 2, 1]);
  const [userSeq, setUserSeq] = useState<number[]>([]);
  const [litTile, setLitTile] = useState<number | null>(null);
  const [gameStatus, setGameStatus] = useState<'idle' | 'showing' | 'playing' | 'won' | 'retry'>(
    'idle'
  );
  const timeoutRefs = useRef<number[]>([]);

  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  const playSequence = (seqToPlay: number[]) => {
    timeoutRefs.current.forEach((t) => window.clearTimeout(t));
    timeoutRefs.current = [];
    setGameStatus('showing');
    setUserSeq([]);

    seqToPlay.forEach((tileId, idx) => {
      const t1 = window.setTimeout(() => setLitTile(tileId), idx * 700 + 150);
      const t2 = window.setTimeout(() => setLitTile(null), idx * 700 + 550);
      timeoutRefs.current.push(t1, t2);
    });

    const tEnd = window.setTimeout(
      () => setGameStatus('playing'),
      seqToPlay.length * 700 + 200
    );
    timeoutRefs.current.push(tEnd);
  };

  const handleTileTap = (tileId: number) => {
    if (gameStatus !== 'playing') return;
    const next = [...userSeq, tileId];
    setUserSeq(next);
    const stepIdx = next.length - 1;
    if (sequence[stepIdx] !== tileId) {
      setGameStatus('retry');
      return;
    }
    if (next.length === sequence.length) {
      setGameStatus('won');
    }
  };

  const handleNextRound = () => {
    const nextSeq = [...sequence, Math.floor(Math.random() * 4)];
    setSequence(nextSeq);
    playSequence(nextSeq);
  };

  const handleLogFocusActivity = (title: string, duration: number, achievementTitle?: string) => {
    logStudentActivity({
      studentId: activeStudent.id,
      module: 'Focus World',
      activityTitle: title,
      durationMinutes: duration,
      status: 'Completed',
      studentFeedback: 'Practiced steady focus and step-by-step pacing.',
      feelingTag: 'Steady',
      achievementTitle,
      achievementDescription: achievementTitle
        ? `Completed ${title} in Focus World.`
        : undefined,
    });
    onActivityLogged(`${title} saved to your shared activity timeline!`);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="rounded-xl bg-rose-50 border border-rose-200 p-2.5 text-rose-700">
            <Timer className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              Focus World · ADHD Support
            </h2>
            <p className="text-xs text-slate-500">
              Educational focus tools &amp; breathing resets—never a test or pressure.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. FOCUS TIMER */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-semibold text-slate-900">
              1. Visual Focus Timer
            </h3>
            <div className="flex gap-1.5">
              {[
                { label: '30s Quick', sec: 30 },
                { label: '5m', sec: 300 },
                { label: '10m', sec: 600 },
                { label: '15m', sec: 900 },
              ].map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleSelectPreset(p.sec)}
                  className={`rounded-lg px-2.5 py-1 text-xs font-semibold cursor-pointer ${
                    presetSeconds === p.sec
                      ? 'bg-rose-600 text-white'
                      : 'border border-slate-200 bg-[#FAF9F6] text-slate-700'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center py-2">
            <div className="relative h-36 w-36 flex items-center justify-center">
              <svg className="h-36 w-36 -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="#F1F5F9"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="52"
                  fill="none"
                  stroke="#E11D48"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={326.7}
                  strokeDashoffset={326.7 * (1 - pctRemaining / 100)}
                />
              </svg>
              <span className="absolute font-mono text-2xl font-bold text-slate-900 tabular-nums">
                {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
              </span>
            </div>

            <div className="mt-4 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setTimerRunning((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-700 cursor-pointer"
              >
                {timerRunning ? (
                  <>
                    <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5" aria-hidden="true" />
                    Start
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setTimerRunning(false);
                  setSecondsLeft(presetSeconds);
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                Reset
              </button>
              <button
                type="button"
                onClick={() =>
                  handleLogFocusActivity(
                    'Focus Timer: Steady Sprint',
                    Math.max(1, Math.round(presetSeconds / 60)),
                    'Steady Sprint Starter'
                  )
                }
                className="inline-flex items-center gap-1 rounded-lg bg-teal-600 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700 cursor-pointer"
              >
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                Log Session
              </button>
            </div>
          </div>
        </div>

        {/* 2. START NOW TINY-STEP CHECKLIST */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <h3 className="font-display text-lg font-semibold text-slate-900">
            2. Start Now · Beat Task Freeze
          </h3>
          <form onSubmit={handleGenerateTinySteps} className="flex gap-2">
            <input
              type="text"
              aria-label="Task to break down"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              placeholder="Enter any task..."
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs"
            />
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 cursor-pointer shrink-0"
            >
              Tiny Steps
            </button>
          </form>

          <div className="space-y-2">
            {microSteps.map((step) => (
              <label
                key={step.id}
                className={`flex items-center gap-2.5 rounded-xl border p-3 cursor-pointer text-xs ${
                  step.done
                    ? 'border-teal-200 bg-teal-50/70 text-slate-500 line-through'
                    : 'border-slate-200 bg-[#FAF9F6] text-slate-800'
                }`}
              >
                <input
                  type="checkbox"
                  checked={step.done}
                  onChange={() =>
                    setMicroSteps((prev) =>
                      prev.map((s) => (s.id === step.id ? { ...s, done: !s.done } : s))
                    )
                  }
                  className="h-4 w-4 accent-teal-600"
                />
                <span>{step.text}</span>
              </label>
            ))}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => handleLogFocusActivity('Start Now: Tiny-Step Task Starter', 6)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-teal-700 cursor-pointer"
            >
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              Save Checklist Progress
            </button>
          </div>
        </div>

        {/* 3. 60-SECOND RESET */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wind className="h-4 w-4 text-teal-700" aria-hidden="true" />
              <h3 className="font-display text-lg font-semibold text-slate-900">
                3. 60-Second Reset
              </h3>
            </div>
            <span className="font-mono text-xs font-semibold text-slate-600 tabular-nums">
              {resetSeconds}s
            </span>
          </div>

          {accessibilityPrefs.reducedMotion ? (
            <div className="rounded-xl border border-teal-200 bg-[#F0F7F4] p-5 space-y-2 text-sm text-slate-800">
              <p className="font-semibold text-teal-900">
                Reduced-Motion Grounding Guide (Static)
              </p>
              <p className="text-xs leading-relaxed">
                Notice 3 steady things around your desk · Unclench your shoulders · Take 3 slow
                breaths at your own pace.
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-teal-200 bg-[#F0F7F4] p-6 flex flex-col items-center text-center">
              <div
                className={`h-24 w-24 rounded-full border-4 border-teal-500 bg-white flex items-center justify-center font-display text-xs font-semibold text-teal-900 transition-transform duration-1000 ${
                  resetActive && resetSeconds % 10 >= 6 ? 'scale-115' : 'scale-95'
                }`}
              >
                {resetActive ? `${resetSeconds}s` : 'Ready'}
              </div>
              <p className="mt-3 text-sm font-semibold text-teal-900">
                {resetActive ? breathPhase : 'Take 60 seconds to settle your mind'}
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (resetSeconds === 0) setResetSeconds(60);
                  setResetActive((v) => !v);
                }}
                className="rounded-lg bg-teal-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-teal-700 cursor-pointer"
              >
                {resetActive ? 'Pause Reset' : 'Start 60s Reset'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setResetActive(false);
                  setResetSeconds(60);
                }}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Restart
              </button>
            </div>
            <button
              type="button"
              onClick={() => handleLogFocusActivity('60-Second Reset', 2)}
              className="text-xs font-semibold text-teal-700 hover:underline cursor-pointer"
            >
              Log Reset Pause
            </button>
          </div>
        </div>

        {/* 4. BRAIN & FOCUS PATTERN GAME */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold text-slate-900">
                4. Pattern Memory Game
              </h3>
              <p className="text-xs text-slate-500">
                Educational memory play · Length: {sequence.length} steps
              </p>
            </div>
            <button
              type="button"
              onClick={() => playSequence(sequence)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              {gameStatus === 'idle' ? 'Show Pattern' : 'Replay Pattern'}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PATTERN_TILES.map((tile) => {
              const isLit = litTile === tile.id;
              return (
                <button
                  key={tile.id}
                  type="button"
                  disabled={gameStatus !== 'playing'}
                  onClick={() => handleTileTap(tile.id)}
                  className={`rounded-xl py-5 font-display text-sm font-bold transition-transform cursor-pointer ${
                    tile.color
                  } ${isLit ? 'ring-4 ring-slate-900 scale-105' : 'opacity-90 hover:opacity-100'} ${
                    gameStatus !== 'playing' ? 'cursor-default' : ''
                  }`}
                >
                  <span className="block text-xl mb-1" aria-hidden="true">
                    {tile.symbol}
                  </span>
                  {tile.label}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-medium text-slate-700">
              {gameStatus === 'idle' && 'Click "Show Pattern" to watch the sequence.'}
              {gameStatus === 'showing' && 'Watch closely...'}
              {gameStatus === 'playing' &&
                `Your turn! Tap ${sequence.length - userSeq.length} more tile(s).`}
              {gameStatus === 'won' && 'Awesome pattern recall! Ready for a longer round?'}
              {gameStatus === 'retry' && 'Nice try! Click "Replay Pattern" to see it again.'}
            </span>

            <div className="flex gap-2">
              {gameStatus === 'won' && (
                <button
                  type="button"
                  onClick={handleNextRound}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 font-semibold text-white cursor-pointer"
                >
                  Next Round (+1)
                </button>
              )}
              <button
                type="button"
                onClick={() =>
                  handleLogFocusActivity(
                    'Focus World: Pattern Memory Game',
                    5,
                    'Pattern Explorer'
                  )
                }
                className="rounded-lg bg-teal-600 px-3 py-1.5 font-semibold text-white cursor-pointer"
              >
                Save Game Activity
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
