import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, ArrowRight, PenTool, Play, RotateCcw, Sparkles, Star } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import type { WritingCheckResult, WritingTaskDrawing, WritingTaskId } from '../../types/neuro';
import { playCelebrationChord, playGentleSuccess, playSoftTap } from '../../utils/gentleAudio';

interface WritingCheckFlowProps {
  standalone?: boolean;
  onBack: () => void;
  onJumpToWritingWorld: () => void;
}

interface WritingTaskSpec {
  id: WritingTaskId;
  title: string;
  heading: string;
  prompt: string;
  modelText?: string;
}

const WRITING_TASKS: WritingTaskSpec[] = [
  {
    id: 'sentence',
    title: 'Task 1 · Copy Sentence',
    heading: 'Copy this short sentence carefully',
    prompt: 'Write the sentence on the lines below using a stylus or finger.',
    modelText: 'The sun shines on bright hills.',
  },
  {
    id: 'digits',
    title: 'Task 2 · Write Digits 0 to 9',
    heading: 'Write the numbers 0 to 9',
    prompt: 'Write 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 in order across the box.',
    modelText: '0  1  2  3  4  5  6  7  8  9',
  },
  {
    id: 'trace',
    title: 'Task 3 · Trace Shapes',
    heading: 'Trace the spiral, the circle, and the straight line',
    prompt: 'Follow the dotted paths slowly and smoothly from left to right.',
  },
];

const CANVAS_W = 760;
const CANVAS_H = 300;

function drawTaskBackground(ctx: CanvasRenderingContext2D, taskId: WritingTaskId) {
  ctx.save();
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  ctx.strokeStyle = '#CBD5E1';
  ctx.fillStyle = '#64748B';
  ctx.lineWidth = 2;

  if (taskId === 'sentence') {
    // Primary ruled lines
    const lineYs = [95, 165, 235];
    lineYs.forEach((y) => {
      ctx.beginPath();
      ctx.setLineDash([]);
      ctx.moveTo(32, y);
      ctx.lineTo(CANVAS_W - 32, y);
      ctx.stroke();

      ctx.beginPath();
      ctx.setLineDash([6, 6]);
      ctx.strokeStyle = '#E2E8F0';
      ctx.moveTo(32, y - 34);
      ctx.lineTo(CANVAS_W - 32, y - 34);
      ctx.stroke();
      ctx.strokeStyle = '#CBD5E1';
    });
  } else if (taskId === 'digits') {
    // 10 faint guide cells for 0..9 (2 rows of 5)
    ctx.setLineDash([5, 5]);
    const cols = 5;
    const cellW = (CANVAS_W - 80) / cols;
    const cellH = 108;
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < cols; c++) {
        const x = 40 + c * cellW + 6;
        const y = 32 + r * (cellH + 20);
        ctx.strokeRect(x, y, cellW - 12, cellH);
      }
    }
  } else if (taskId === 'trace') {
    ctx.setLineDash([7, 7]);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#94A3B8';

    // 1. Spiral on the left (center 145, 150)
    ctx.beginPath();
    const cxSpiral = 145;
    const cySpiral = 152;
    const turns = 3.0;
    const steps = 160;
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * turns * Math.PI * 2;
      const radius = 8 + (i / steps) * 82;
      const x = cxSpiral + Math.cos(t) * radius;
      const y = cySpiral + Math.sin(t) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 2. Circle in the middle (center 390, 152, radius 82)
    ctx.beginPath();
    ctx.arc(390, 152, 82, 0, Math.PI * 2);
    ctx.stroke();

    // 3. Straight line on the right
    ctx.beginPath();
    ctx.moveTo(535, 152);
    ctx.lineTo(720, 152);
    ctx.stroke();

    // Labels under shapes
    ctx.setLineDash([]);
    ctx.font = '600 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Spiral', 145, 272);
    ctx.fillText('Circle', 390, 272);
    ctx.fillText('Straight line', 628, 272);
  }
  ctx.restore();
}

function calcSpeedVariationPct(speeds: number[]): number {
  if (speeds.length < 3) return 0;
  const mean = speeds.reduce((a, b) => a + b, 0) / speeds.length;
  if (mean <= 0) return 0;
  const variance = speeds.reduce((acc, v) => acc + (v - mean) ** 2, 0) / speeds.length;
  const sd = Math.sqrt(variance);
  return Math.round((sd / mean) * 100);
}

export const WritingCheckFlow: React.FC<WritingCheckFlowProps> = ({
  standalone = false,
  onBack,
  onJumpToWritingWorld,
}) => {
  const {
    activeRole,
    activeStudent,
    writingCheckResults,
    saveWritingCheckResult,
    updateCheckStatus,
    soundEnabled,
    prefersReducedMotion,
    logStudentActivity,
  } = useAppData();

  const isAdultPortal = !standalone && (activeRole === 'parent' || activeRole === 'school');
  const existing = writingCheckResults[activeStudent.id];

  const [stage, setStage] = useState<'overview' | 'draw' | 'finished'>('overview');
  const [taskIdx, setTaskIdx] = useState(0);
  const [hasInk, setHasInk] = useState(false);
  const [completedDrawings, setCompletedDrawings] = useState<WritingTaskDrawing[]>([]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number; t: number } | null>(null);
  const lastStrokeEndRef = useRef<number | null>(null);

  // Per-task kinematic counters
  const penLiftsRef = useRef(0);
  const interStrokeGapsRef = useRef<number[]>([]);
  const segmentSpeedsRef = useRef<number[]>([]);

  const currentTask = WRITING_TASKS[taskIdx];

  const initCanvas = useCallback((taskId: WritingTaskId) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawTaskBackground(ctx, taskId);
    penLiftsRef.current = 0;
    interStrokeGapsRef.current = [];
    segmentSpeedsRef.current = [];
    lastPointRef.current = null;
    lastStrokeEndRef.current = null;
    isDrawingRef.current = false;
    setHasInk(false);
  }, []);

  useEffect(() => {
    if (stage === 'draw' && currentTask) {
      initCanvas(currentTask.id);
    }
  }, [stage, taskIdx, currentTask, initCanvas]);

  const getCanvasPoint = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0, t: performance.now() };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / Math.max(1, rect.width);
    const scaleY = canvas.height / Math.max(1, rect.height);
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
      t: performance.now(),
    };
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    e.currentTarget.setPointerCapture(e.pointerId);

    const pt = getCanvasPoint(e);
    if (lastStrokeEndRef.current !== null) {
      const gap = Math.round(pt.t - lastStrokeEndRef.current);
      if (gap >= 15 && gap < 30000) {
        interStrokeGapsRef.current.push(gap);
      }
    }

    isDrawingRef.current = true;
    lastPointRef.current = pt;
    setHasInk(true);

    ctx.save();
    ctx.fillStyle = '#0B1D3A';
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const prev = lastPointRef.current;
    if (!canvas || !ctx || !prev) return;

    const pt = getCanvasPoint(e);
    const dx = pt.x - prev.x;
    const dy = pt.y - prev.y;
    const dist = Math.hypot(dx, dy);
    const dt = pt.t - prev.t;

    if (dt >= 8 && dist > 0.5) {
      const speedPxPerSec = (dist / dt) * 1000;
      segmentSpeedsRef.current.push(speedPxPerSec);
    }

    ctx.save();
    ctx.strokeStyle = '#0B1D3A';
    ctx.lineWidth = 3.6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.stroke();
    ctx.restore();

    lastPointRef.current = pt;
  };

  const endStroke = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    penLiftsRef.current += 1;
    lastStrokeEndRef.current = performance.now();
    lastPointRef.current = null;
  };

  const handleStartWriting = () => {
    playSoftTap(soundEnabled);
    updateCheckStatus(activeStudent.id, 'writing', 'In progress');
    setCompletedDrawings([]);
    setTaskIdx(0);
    setStage('draw');
  };

  const handleSaveAndNextTask = () => {
    const canvas = canvasRef.current;
    if (!canvas || !currentTask) return;

    const imageDataUrl = canvas.toDataURL('image/png');
    const avgGap =
      interStrokeGapsRef.current.length > 0
        ? Math.round(
            interStrokeGapsRef.current.reduce((a, b) => a + b, 0) /
              interStrokeGapsRef.current.length
          )
        : 0;
    const speedVar = calcSpeedVariationPct(segmentSpeedsRef.current);

    const taskDrawing: WritingTaskDrawing = {
      taskId: currentTask.id,
      title: currentTask.title,
      imageDataUrl,
      penLifts: penLiftsRef.current,
      avgInterStrokeMs: avgGap,
      speedVariationPct: speedVar,
      completedAt: new Date().toISOString().slice(0, 10),
    };

    const nextDrawings = [...completedDrawings, taskDrawing];
    setCompletedDrawings(nextDrawings);

    if (taskIdx + 1 < WRITING_TASKS.length) {
      playGentleSuccess(soundEnabled);
      setTaskIdx((idx) => idx + 1);
    } else {
      const totalLifts = nextDrawings.reduce((acc, d) => acc + d.penLifts, 0);
      const validGaps = nextDrawings.filter((d) => d.avgInterStrokeMs > 0);
      const meanInterStroke =
        validGaps.length > 0
          ? Math.round(
              validGaps.reduce((acc, d) => acc + d.avgInterStrokeMs, 0) / validGaps.length
            )
          : 0;
      const meanSpeedVar = Math.round(
        nextDrawings.reduce((acc, d) => acc + d.speedVariationPct, 0) / nextDrawings.length
      );

      const finalResult: WritingCheckResult = {
        penLifts: totalLifts,
        avgInterStrokeMs: meanInterStroke,
        speedVariationPct: meanSpeedVar,
        drawings: nextDrawings,
        completedAt: new Date().toISOString().slice(0, 10),
      };

      saveWritingCheckResult(activeStudent.id, finalResult);
      playCelebrationChord(soundEnabled);
      logStudentActivity({
        studentId: activeStudent.id,
        module: 'Writing World',
        activityTitle: "Let's Check: Writing Check Canvas Tasks",
        durationMinutes: 5,
        status: 'Completed',
        studentFeedback: 'Completed sentence copying, digit writing, and shape tracing.',
        feelingTag: 'Proud',
        achievementTitle: 'Steady Stylus',
        achievementDescription: 'Completed all three Writing Check drawing tasks.',
      });
      setStage('finished');
    }
  };

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
          <div className="rounded-3xl border-2 border-amber-300 bg-[#FEF9C3]/65 p-6 sm:p-8 space-y-5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <PenTool className="h-5 w-5" aria-hidden="true" />
              <span>Writing Check · 4–6 minutes</span>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              Three Handwriting &amp; Tracing Tasks
            </h2>

            <div className="rounded-2xl border border-amber-300 bg-white px-4 py-3 text-xs sm:text-sm font-semibold text-amber-950">
              Works best on a tablet with a stylus. Finger writing on a phone has not been
              validated.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="rounded-2xl border border-amber-200 bg-white p-4">
                <p className="font-bold text-slate-900">1. Copy a short sentence</p>
                <p className="mt-1 text-slate-600">Write one short sentence on ruled lines.</p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-white p-4">
                <p className="font-bold text-slate-900">2. Write digits 0 to 9</p>
                <p className="mt-1 text-slate-600">Write all ten numbers inside the boxes.</p>
              </div>
              <div className="rounded-2xl border border-amber-200 bg-white p-4">
                <p className="font-bold text-slate-900">3. Trace shapes</p>
                <p className="mt-1 text-slate-600">Trace a spiral, a circle, and a straight line.</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={handleStartWriting}
                className="inline-flex items-center gap-2 rounded-2xl bg-amber-700 px-6 py-3.5 text-sm sm:text-base font-bold text-white hover:bg-amber-800 cursor-pointer"
              >
                <Play className="h-5 w-5" aria-hidden="true" />
                Start Writing Check
              </button>
              <button
                type="button"
                onClick={onJumpToWritingWorld}
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 hover:bg-slate-50 cursor-pointer"
              >
                Try the Writing World
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          {isAdultPortal && existing && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Writing Check Samples ({activeStudent.name})
                </h3>
                <span className="text-xs font-semibold text-slate-700">
                  For a teacher or therapist to review
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-3.5">
                  <span className="text-slate-600">Total pen lifts</span>
                  <p className="mt-1 font-mono text-xl font-bold text-slate-900 tabular-nums">
                    {existing.penLifts}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-3.5">
                  <span className="text-slate-600">Average time between strokes</span>
                  <p className="mt-1 font-mono text-xl font-bold text-slate-900 tabular-nums">
                    {existing.avgInterStrokeMs} ms
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-3.5">
                  <span className="text-slate-600">Variation in writing speed</span>
                  <p className="mt-1 font-mono text-xl font-bold text-slate-900 tabular-nums">
                    {existing.speedVariationPct}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {existing.drawings.map((d) => (
                  <div
                    key={d.taskId}
                    className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-3 space-y-2"
                  >
                    <p className="text-xs font-bold text-slate-800">{d.title}</p>
                    <img
                      src={d.imageDataUrl}
                      alt={`${activeStudent.name} ${d.title}`}
                      className="w-full rounded-lg border border-slate-200 bg-white"
                    />
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

      {stage === 'draw' && currentTask && (
        <div className="rounded-3xl border-2 border-amber-300 bg-[#FFFDF7] p-6 sm:p-8 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-slate-700">
              {currentTask.title} ({taskIdx + 1} of {WRITING_TASKS.length})
            </span>
            <button
              type="button"
              onClick={() => initCanvas(currentTask.id)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Clear Box
            </button>
          </div>

          <div className="space-y-1">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">
              {currentTask.heading}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">{currentTask.prompt}</p>
          </div>

          {currentTask.modelText && (
            <div className="rounded-2xl border-2 border-amber-200 bg-white px-5 py-3.5 text-center">
              <p className="font-display text-xl sm:text-2xl font-bold tracking-wide text-[#0B1D3A]">
                {currentTask.modelText}
              </p>
            </div>
          )}

          <div className="rounded-2xl border-2 border-slate-300 bg-white overflow-hidden">
            <canvas
              ref={canvasRef}
              width={CANVAS_W}
              height={CANVAS_H}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={endStroke}
              onPointerCancel={endStroke}
              className="w-full h-auto block touch-none cursor-crosshair bg-white"
              aria-label={currentTask.heading}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-500">
              Use a stylus, trackpad, mouse, or finger inside the white box.
            </span>
            <button
              type="button"
              disabled={!hasInk}
              onClick={handleSaveAndNextTask}
              className="inline-flex items-center gap-2 rounded-2xl bg-amber-700 px-6 py-3 text-sm font-bold text-white hover:bg-amber-800 disabled:opacity-45 cursor-pointer"
            >
              {taskIdx + 1 < WRITING_TASKS.length ? 'Save & Next Task' : 'Finish Writing Check'}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {stage === 'finished' && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.35 }}
          className="rounded-3xl border-2 border-amber-300 bg-[#FFFDF7] p-7 sm:p-10 space-y-6"
        >
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <motion.div
                initial={prefersReducedMotion ? false : { scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.45 }}
                className="rounded-2xl border-2 border-amber-300 bg-[#FEF9C3] p-4"
              >
                <Star className="h-10 w-10 fill-amber-400 text-amber-600" aria-hidden="true" />
              </motion.div>
            </div>

            <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
              Lovely writing!
            </h2>

            {!isAdultPortal && (
              <p className="mx-auto max-w-md text-sm sm:text-base text-slate-700">
                Thank you for sharing your sentences, numbers, and shapes! Ready to explore
                Writing World?
              </p>
            )}
          </div>

          {isAdultPortal && existing && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-display text-lg font-bold text-slate-900">
                  Writing Check Summary ({activeStudent.name})
                </h3>
                <span className="text-xs font-semibold text-slate-700">
                  For a teacher or therapist to review
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                  <span className="text-slate-600">Number of pen lifts</span>
                  <p className="mt-1 font-mono text-xl font-bold text-slate-900 tabular-nums">
                    {existing.penLifts}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                  <span className="text-slate-600">Time between strokes</span>
                  <p className="mt-1 font-mono text-xl font-bold text-slate-900 tabular-nums">
                    {existing.avgInterStrokeMs} ms
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3.5">
                  <span className="text-slate-600">Variation in writing speed</span>
                  <p className="mt-1 font-mono text-xl font-bold text-slate-900 tabular-nums">
                    {existing.speedVariationPct}%
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {existing.drawings.map((d) => (
                  <div
                    key={d.taskId}
                    className="rounded-xl border border-slate-200 bg-white p-3 space-y-2"
                  >
                    <p className="text-xs font-bold text-slate-800">{d.title}</p>
                    <img
                      src={d.imageDataUrl}
                      alt={`${activeStudent.name} ${d.title}`}
                      className="w-full rounded-lg border border-slate-200 bg-white"
                    />
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
              onClick={onJumpToWritingWorld}
              className="inline-flex items-center gap-2 rounded-2xl bg-amber-700 px-6 py-3 text-sm font-bold text-white hover:bg-amber-800 cursor-pointer"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Try the Writing World
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
