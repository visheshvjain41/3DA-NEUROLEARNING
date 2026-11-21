import React from 'react';
import {
  ArrowRight,
  BookOpen,
  Calculator,
  PenTool,
  Printer,
  Timer,
  Trash2,
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import type {
  CheckType,
  NumberTaskMetrics,
  ReadingGameMetrics,
  StudentRecord,
  TrafficBand,
} from '../../types/neuro';

interface CheckResultsSummaryProps {
  student: StudentRecord;
  onNextStepWorld: (world: CheckType) => void;
  onStartOrOpenCheck?: (check: CheckType) => void;
}

function bandClasses(band: TrafficBand) {
  if (band === 'Green') return 'border-emerald-300 bg-emerald-50 text-emerald-900';
  if (band === 'Amber') return 'border-amber-300 bg-amber-50 text-amber-900';
  return 'border-rose-300 bg-rose-50 text-rose-900';
}

function worstBand(bands: TrafficBand[]): TrafficBand | null {
  if (bands.length === 0) return null;
  if (bands.includes('Red')) return 'Red';
  if (bands.includes('Amber')) return 'Amber';
  return 'Green';
}

function readingPlainSummary(games: ReadingGameMetrics[]): string {
  if (games.length === 0) {
    return 'No Reading Check sessions recorded yet for this student.';
  }
  const overall = worstBand(games.map((g) => g.band));
  const notedErrors = Array.from(new Set(games.flatMap((g) => g.errorTypes)));
  const errorNote =
    notedErrors.length > 0
      ? ` Patterns noticed include: ${notedErrors.slice(0, 3).join(', ')}.`
      : '';
  if (overall === 'Green') {
    return `Strong accuracy across phonological, letter-sound, spelling, and sequence tasks.${errorNote}`;
  }
  if (overall === 'Amber') {
    return `Some tasks showed mixed accuracy or extra thinking time.${errorNote} Guided audio-supported reading practice may help.`;
  }
  return `Several sound, letter, or decoding tasks needed extra effort.${errorNote} Multi-sensory reading tools and slow-paced audio support may help.`;
}

function numberPlainSummary(tasks: NumberTaskMetrics[]): string {
  if (tasks.length === 0) {
    return 'No Number Check sessions recorded yet for this student.';
  }
  const overall = worstBand(tasks.map((t) => t.band));
  if (overall === 'Green') {
    return 'Consistent accuracy and fluent pace across dot quantity, written number, and quick sum tasks.';
  }
  if (overall === 'Amber') {
    return 'Mixed accuracy across quantity comparison or quick sums; visual number lines and concrete counters may help.';
  }
  return 'Number comparison or quick arithmetic tasks needed extra effort; step-by-step visual math tools may help.';
}

function focusPlainSummary(
  inattentionBand?: TrafficBand,
  hyperactivityBand?: TrafficBand,
  hasGame?: boolean
): string {
  if (!inattentionBand && !hyperactivityBand && !hasGame) {
    return 'No Focus Check questionnaire or Star & Moon session recorded yet.';
  }
  const overall = worstBand(
    [inattentionBand, hyperactivityBand].filter(Boolean) as TrafficBand[]
  );
  if (!overall) {
    return 'Star & Moon game activity recorded. Pair with the parent or teacher questionnaire for a fuller picture.';
  }
  if (overall === 'Green') {
    return 'Everyday ratings fall in a steady range across attention and activity items.';
  }
  if (overall === 'Amber') {
    return 'Some attention or restlessness behaviours were noted often enough to explore structured breaks and chunked tasks.';
  }
  return 'Frequent attention or activity patterns were rated; visual timers, short task chunks, and movement breaks may support focus.';
}

export const CheckResultsSummary: React.FC<CheckResultsSummaryProps> = ({
  student,
  onNextStepWorld,
  onStartOrOpenCheck,
}) => {
  const {
    focusCheckResults,
    numberCheckResults,
    readingCheckResults,
    writingCheckResults,
    clearStudentCheckData,
  } = useAppData();

  const readingRes = readingCheckResults[student.id];
  const readingGames = readingRes
    ? ([
        readingRes.sound,
        readingRes['letter-sound'],
        readingRes.nonword,
        readingRes.spelling,
        readingRes.memory,
      ].filter(Boolean) as ReadingGameMetrics[])
    : [];
  const readingOverallBand = worstBand(readingGames.map((g) => g.band));

  const numberRes = numberCheckResults[student.id];
  const numberTasks = numberRes
    ? ([numberRes.dots, numberRes.numbers, numberRes.sums].filter(
        Boolean
      ) as NumberTaskMetrics[])
    : [];
  const numberOverallBand = worstBand(numberTasks.map((t) => t.band));

  const writingRes = writingCheckResults[student.id];

  const focusRes = focusCheckResults[student.id];
  const focusOverallBand = worstBand(
    [
      focusRes?.questionnaire?.inattentionBand,
      focusRes?.questionnaire?.hyperactivityBand,
    ].filter(Boolean) as TrafficBand[]
  );

  const hasAnyData =
    readingGames.length > 0 ||
    numberTasks.length > 0 ||
    Boolean(writingRes) ||
    Boolean(focusRes?.questionnaire || focusRes?.starMoonGame);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6">
      {/* Header + Print / Clear Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Parent &amp; School Summary
          </p>
          <h2 className="font-display text-xl font-bold text-[#0B1D3A]">
            Let&apos;s Check Results · {student.name} ({student.className})
          </h2>
        </div>

        <div className="no-print flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-50 cursor-pointer"
          >
            <Printer className="h-4 w-4" aria-hidden="true" />
            Print Summary
          </button>

          <button
            type="button"
            disabled={!hasAnyData}
            onClick={() => clearStudentCheckData(student.id)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-900 hover:bg-rose-100 disabled:opacity-45 disabled:cursor-not-allowed cursor-pointer"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            Clear this child&apos;s check data
          </button>
        </div>
      </div>

      {/* 4 Check Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* 1. READING CHECK CARD */}
        <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-5 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-sky-700" aria-hidden="true" />
                <h3 className="font-display text-base font-bold text-slate-900">
                  Reading Check
                </h3>
              </div>
              {readingOverallBand ? (
                <span
                  className={`rounded-md border px-2.5 py-0.5 text-xs font-bold ${bandClasses(
                    readingOverallBand
                  )}`}
                >
                  Indicative result: {readingOverallBand}
                </span>
              ) : (
                <span className="text-xs font-medium text-slate-500">Not recorded yet</span>
              )}
            </div>

            {readingGames.length > 0 && (
              <div className="space-y-2">
                {readingGames.map((g) => (
                  <div
                    key={g.gameId}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs flex flex-wrap items-center justify-between gap-2"
                  >
                    <div>
                      <span className="font-bold text-slate-900">{g.title}</span>
                      {g.errorTypes.length > 0 && (
                        <p className="text-[11px] text-slate-600">
                          {g.errorTypes.join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 font-mono tabular-nums">
                      <span className="text-slate-800">{g.accuracyPct}%</span>
                      <span className="text-slate-500">
                        {(g.medianRtMs / 1000).toFixed(2)}s
                      </span>
                      <span
                        className={`rounded border px-1.5 py-0.5 text-[11px] font-bold ${bandClasses(
                          g.band
                        )}`}
                      >
                        Indicative: {g.band}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-slate-700 leading-relaxed">
              {readingPlainSummary(readingGames)}
            </p>
          </div>

          <div className="no-print flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => onNextStepWorld('reading')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B1D3A] px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
            >
              Next step: Reading World
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            {onStartOrOpenCheck && readingGames.length === 0 && (
              <button
                type="button"
                onClick={() => onStartOrOpenCheck('reading')}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Open Reading Check
              </button>
            )}
          </div>
        </div>

        {/* 2. NUMBER CHECK CARD */}
        <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-5 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-emerald-700" aria-hidden="true" />
                <h3 className="font-display text-base font-bold text-slate-900">
                  Number Check
                </h3>
              </div>
              {numberOverallBand ? (
                <span
                  className={`rounded-md border px-2.5 py-0.5 text-xs font-bold ${bandClasses(
                    numberOverallBand
                  )}`}
                >
                  Indicative result: {numberOverallBand}
                </span>
              ) : (
                <span className="text-xs font-medium text-slate-500">Not recorded yet</span>
              )}
            </div>

            {numberTasks.length > 0 && (
              <div className="space-y-2">
                {numberTasks.map((t) => (
                  <div
                    key={t.taskId}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs flex flex-wrap items-center justify-between gap-2"
                  >
                    <span className="font-bold text-slate-900">{t.title}</span>
                    <div className="flex items-center gap-2 font-mono tabular-nums">
                      <span className="text-slate-800">{t.accuracyPct}%</span>
                      <span className="text-slate-500">
                        Median {(t.medianRtMs / 1000).toFixed(2)}s
                      </span>
                      <span
                        className={`rounded border px-1.5 py-0.5 text-[11px] font-bold ${bandClasses(
                          t.band
                        )}`}
                      >
                        Indicative: {t.band}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-slate-700 leading-relaxed">
              {numberPlainSummary(numberTasks)}
            </p>
          </div>

          <div className="no-print flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => onNextStepWorld('number')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B1D3A] px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
            >
              Next step: Number World
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            {onStartOrOpenCheck && numberTasks.length === 0 && (
              <button
                type="button"
                onClick={() => onStartOrOpenCheck('number')}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Open Number Check
              </button>
            )}
          </div>
        </div>

        {/* 3. WRITING CHECK CARD (No traffic light — For a teacher or therapist to review) */}
        <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-5 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <PenTool className="h-5 w-5 text-amber-700" aria-hidden="true" />
                <h3 className="font-display text-base font-bold text-slate-900">
                  Writing Check
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-700">
                {writingRes ? 'For a teacher or therapist to review' : 'Not recorded yet'}
              </span>
            </div>

            {writingRes && (
              <>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                    <span className="text-slate-600 block">Pen lifts</span>
                    <span className="font-mono text-base font-bold text-slate-900 tabular-nums">
                      {writingRes.penLifts}
                    </span>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                    <span className="text-slate-600 block">Stroke pause</span>
                    <span className="font-mono text-base font-bold text-slate-900 tabular-nums">
                      {writingRes.avgInterStrokeMs} ms
                    </span>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                    <span className="text-slate-600 block">Speed variation</span>
                    <span className="font-mono text-base font-bold text-slate-900 tabular-nums">
                      {writingRes.speedVariationPct}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {writingRes.drawings.map((d) => (
                    <div
                      key={d.taskId}
                      className="rounded-lg border border-slate-200 bg-white p-1.5 space-y-1"
                    >
                      <p className="text-[10px] font-bold text-slate-700 truncate">{d.title}</p>
                      <img
                        src={d.imageDataUrl}
                        alt={`${student.name} ${d.title}`}
                        className="w-full rounded border border-slate-100 bg-white"
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            <p className="text-xs text-slate-700 leading-relaxed">
              {writingRes
                ? 'Handwriting samples and stroke timing captured for visual review alongside classroom writing work.'
                : 'No Writing Check canvas tasks recorded yet for this student.'}
            </p>
          </div>

          <div className="no-print flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => onNextStepWorld('writing')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B1D3A] px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
            >
              Next step: Writing World
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            {onStartOrOpenCheck && !writingRes && (
              <button
                type="button"
                onClick={() => onStartOrOpenCheck('writing')}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Open Writing Check
              </button>
            )}
          </div>
        </div>

        {/* 4. FOCUS CHECK CARD */}
        <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-5 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Timer className="h-5 w-5 text-rose-700" aria-hidden="true" />
                <h3 className="font-display text-base font-bold text-slate-900">
                  Focus Check
                </h3>
              </div>
              {focusOverallBand ? (
                <span
                  className={`rounded-md border px-2.5 py-0.5 text-xs font-bold ${bandClasses(
                    focusOverallBand
                  )}`}
                >
                  Indicative result: {focusOverallBand}
                </span>
              ) : (
                <span className="text-xs font-medium text-slate-500">
                  {focusRes?.starMoonGame ? 'Activity metrics recorded' : 'Not recorded yet'}
                </span>
              )}
            </div>

            {focusRes?.questionnaire && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="rounded-lg border border-slate-200 bg-white p-2.5 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-slate-600 block">Inattention avg</span>
                    <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                      {focusRes.questionnaire.inattentionAvg.toFixed(2)} / 3.00
                    </span>
                  </div>
                  <span
                    className={`rounded border px-2 py-0.5 text-[11px] font-bold ${bandClasses(
                      focusRes.questionnaire.inattentionBand
                    )}`}
                  >
                    Indicative: {focusRes.questionnaire.inattentionBand}
                  </span>
                </div>

                <div className="rounded-lg border border-slate-200 bg-white p-2.5 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-slate-600 block">Hyperactivity avg</span>
                    <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                      {focusRes.questionnaire.hyperactivityAvg.toFixed(2)} / 3.00
                    </span>
                  </div>
                  <span
                    className={`rounded border px-2 py-0.5 text-[11px] font-bold ${bandClasses(
                      focusRes.questionnaire.hyperactivityBand
                    )}`}
                  >
                    Indicative: {focusRes.questionnaire.hyperactivityBand}
                  </span>
                </div>
              </div>
            )}

            {focusRes?.starMoonGame && (
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                  <span className="text-slate-600 block">Missed stars</span>
                  <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                    {focusRes.starMoonGame.missedStars}
                  </span>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                  <span className="text-slate-600 block">Moon taps</span>
                  <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                    {focusRes.starMoonGame.wrongMoonTaps}
                  </span>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-2.5">
                  <span className="text-slate-600 block">RT variation</span>
                  <span className="font-mono text-sm font-bold text-slate-900 tabular-nums">
                    {focusRes.starMoonGame.reactionTimeSdMs} ms
                  </span>
                </div>
              </div>
            )}

            <p className="text-xs text-slate-700 leading-relaxed">
              {focusPlainSummary(
                focusRes?.questionnaire?.inattentionBand,
                focusRes?.questionnaire?.hyperactivityBand,
                Boolean(focusRes?.starMoonGame)
              )}
            </p>
          </div>

          <div className="no-print flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
            <button
              type="button"
              onClick={() => onNextStepWorld('focus')}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B1D3A] px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer"
            >
              Next step: Focus World
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
            {onStartOrOpenCheck && !focusRes?.questionnaire && (
              <button
                type="button"
                onClick={() => onStartOrOpenCheck('focus')}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Open Focus Check
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Next steps & Single Disclaimer */}
      <div className="rounded-xl border border-slate-200 bg-[#F8FAFC] p-4 space-y-2">
        <h4 className="font-display text-sm font-bold text-[#0B1D3A]">Next steps</h4>
        <p className="text-xs sm:text-sm text-slate-700">
          For school accommodations and exam concessions, an assessment from an authorised
          professional is needed.
        </p>
        <p className="text-xs text-slate-500 pt-1 border-t border-slate-200">
          Screening support tool. Results are not a medical diagnosis.
        </p>
      </div>
    </section>
  );
};
