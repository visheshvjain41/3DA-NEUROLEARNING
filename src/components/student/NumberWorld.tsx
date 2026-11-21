import React, { useState } from 'react';
import { Calculator, CheckCircle2, HelpCircle, RotateCcw } from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';

interface NumberWorldProps {
  onActivityLogged: (msg: string) => void;
}

const FRACTION_TILES = [
  { label: '1/2', value: 0.5, widthPct: 50, color: 'bg-teal-500 text-white' },
  { label: '1/3', value: 1 / 3, widthPct: 33.33, color: 'bg-indigo-500 text-white' },
  { label: '1/4', value: 0.25, widthPct: 25, color: 'bg-amber-500 text-white' },
  { label: '1/6', value: 1 / 6, widthPct: 16.66, color: 'bg-sky-600 text-white' },
];

export const NumberWorld: React.FC<NumberWorldProps> = ({ onActivityLogged }) => {
  const { activeStudent, logStudentActivity } = useAppData();
  const [subMode, setSubMode] = useState<'number-lab' | 'word-decoder'>('number-lab');

  // Visual Number Lab state
  const [startNum, setStartNum] = useState(5);
  const [jumpStep, setJumpStep] = useState(4);
  const [selectedFractions, setSelectedFractions] = useState<typeof FRACTION_TILES>([]);
  const [labHintOpen, setLabHintOpen] = useState(false);

  // Word-Problem Decoder state
  const [decoderStage, setDecoderStage] = useState<number>(1);
  const [userAnswer, setUserAnswer] = useState('');
  const [hintLevel, setHintLevel] = useState(0);
  const [decoderFeedback, setDecoderFeedback] = useState('');

  const targetSum = Math.min(20, Math.max(0, startNum + jumpStep));
  const totalFractionValue = selectedFractions.reduce((acc, t) => acc + t.value, 0);

  const handleAddFraction = (tile: (typeof FRACTION_TILES)[number]) => {
    if (totalFractionValue + tile.value > 1.02) return;
    setSelectedFractions((prev) => [...prev, tile]);
  };

  const handleCheckDecoder = (e: React.FormEvent) => {
    e.preventDefault();
    const numeric = Number(userAnswer.trim());
    if (numeric === 9) {
      setDecoderFeedback('Great visual thinking! 3/4 of 12 pots is 9 marigold pots.');
    } else {
      setDecoderFeedback(
        'Almost! Try grouping the 12 pots into 4 equal trays of 3, then count 3 of those trays.'
      );
    }
  };

  const handleLogNumberLab = () => {
    logStudentActivity({
      studentId: activeStudent.id,
      module: 'Number World',
      activityTitle: 'Visual Number Lab: Fraction Tiles & Line Jumps',
      durationMinutes: 11,
      status: 'Completed',
      studentFeedback: 'Used the interactive number line jumps and fraction bar builder.',
      feelingTag: 'Curious',
      achievementTitle: 'Visual Math Builder',
      achievementDescription: 'Explored number patterns with hands-on visual blocks.',
    });
    onActivityLogged('Visual Number Lab activity saved!');
  };

  const handleLogDecoder = () => {
    logStudentActivity({
      studentId: activeStudent.id,
      module: 'Number World',
      activityTitle: 'Word-Problem Decoder: Step-by-Step Garden Plot',
      durationMinutes: 9,
      status: 'Completed',
      studentFeedback: 'Broke the story problem into what is given and a visual model.',
      feelingTag: 'Proud',
    });
    onActivityLogged('Word-Problem Decoder activity saved!');
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="rounded-xl bg-teal-50 border border-teal-200 p-2.5 text-teal-700">
            <Calculator className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              Number World · Dyscalculia Support
            </h2>
            <p className="text-xs text-slate-500">
              See numbers as lengths, jumps, and blocks—no timed math drills.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 self-start">
          <button
            type="button"
            onClick={() => setSubMode('number-lab')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer ${
              subMode === 'number-lab' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            Visual Number Lab
          </button>
          <button
            type="button"
            onClick={() => setSubMode('word-decoder')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer ${
              subMode === 'word-decoder' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600'
            }`}
          >
            Word-Problem Decoder
          </button>
        </div>
      </div>

      {subMode === 'number-lab' ? (
        <div className="space-y-6">
          {/* Interactive Number Line */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-lg font-semibold text-slate-900">
                  Interactive Number Line (0–20)
                </h3>
                <p className="text-xs text-slate-500">
                  Move the sliders to watch how jumps add or subtract along the line.
                </p>
              </div>
              <div className="rounded-lg bg-teal-50 border border-teal-200 px-3.5 py-1.5 font-mono text-sm font-semibold text-teal-900 tabular-nums">
                {startNum} {jumpStep >= 0 ? `+ ${jumpStep}` : `- ${Math.abs(jumpStep)}`} = {targetSum}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <label htmlFor="nl-start">Start Position</label>
                  <span className="font-mono tabular-nums">{startNum}</span>
                </div>
                <input
                  id="nl-start"
                  type="range"
                  min={0}
                  max={15}
                  value={startNum}
                  onChange={(e) => setStartNum(Number(e.target.value))}
                  className="w-full accent-teal-600"
                />
              </div>
              <div>
                <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                  <label htmlFor="nl-jump">Jump Steps</label>
                  <span className="font-mono tabular-nums">
                    {jumpStep >= 0 ? `+${jumpStep}` : jumpStep}
                  </span>
                </div>
                <input
                  id="nl-jump"
                  type="range"
                  min={-5}
                  max={8}
                  value={jumpStep}
                  onChange={(e) => setJumpStep(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>

            {/* Number Line Bar */}
            <div className="overflow-x-auto pb-2">
              <div className="min-w-[560px] pt-4">
                <div className="grid grid-cols-21 gap-1">
                  {Array.from({ length: 21 }).map((_, n) => {
                    const isStart = n === startNum;
                    const isEnd = n === targetSum;
                    const inJump =
                      (n > Math.min(startNum, targetSum) && n < Math.max(startNum, targetSum)) ||
                      isEnd;
                    return (
                      <div key={n} className="flex flex-col items-center">
                        <div
                          className={`h-8 w-full rounded-md flex items-center justify-center font-mono text-xs font-semibold tabular-nums border transition-colors ${
                            isEnd
                              ? 'bg-teal-600 text-white border-teal-700'
                              : isStart
                                ? 'bg-indigo-600 text-white border-indigo-700'
                                : inJump
                                  ? 'bg-teal-100 text-teal-900 border-teal-300'
                                  : 'bg-[#FAF9F6] text-slate-600 border-slate-200'
                          }`}
                        >
                          {n}
                        </div>
                        <span className="mt-1 text-[10px] font-medium text-slate-500 h-3">
                          {isStart && isEnd ? 'Same' : isStart ? 'Start' : isEnd ? 'Land' : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Fraction Bar Explorer */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-display text-lg font-semibold text-slate-900">
                  Tactile Fraction Bar Lab
                </h3>
                <p className="text-xs text-slate-500">
                  Challenge: Can you combine fraction blocks to build exactly 1 whole?
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLabHintOpen((v) => !v)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-[#FAF9F6] px-3 py-1.5 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  <HelpCircle className="h-3.5 w-3.5 text-teal-700" aria-hidden="true" />
                  {labHintOpen ? 'Hide Hint' : 'Hint'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedFractions([])}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  Clear
                </button>
              </div>
            </div>

            {labHintOpen && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-900">
                Try snapping one <span className="font-mono font-semibold">1/2</span> tile together
                with two <span className="font-mono font-semibold">1/4</span> tiles—watch how they
                fill the exact same length as 1 whole!
              </div>
            )}

            {/* 1 Whole Reference */}
            <div className="space-y-2">
              <div className="w-full rounded-xl bg-slate-800 py-2.5 text-center font-mono text-xs font-semibold text-white">
                1 Whole (Reference Bar)
              </div>

              <div className="w-full min-h-[46px] rounded-xl border border-dashed border-slate-300 bg-[#FAF9F6] p-1 flex items-center gap-1">
                {selectedFractions.length === 0 ? (
                  <span className="mx-auto text-xs text-slate-400">
                    Tap fraction tiles below to place them here
                  </span>
                ) : (
                  selectedFractions.map((tile, idx) => (
                    <div
                      key={`${tile.label}-${idx}`}
                      style={{ width: `${tile.widthPct}%` }}
                      className={`rounded-lg py-2 text-center font-mono text-xs font-bold ${tile.color}`}
                    >
                      {tile.label}
                    </div>
                  ))
                )}
              </div>

              <p className="text-xs font-mono text-slate-600 tabular-nums">
                Filled: {Math.round(totalFractionValue * 100)}% of 1 whole
                {Math.abs(totalFractionValue - 1) < 0.02 && (
                  <span className="ml-2 font-sans font-semibold text-teal-700">
                    — Exact 1 whole built!
                  </span>
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap gap-2">
                {FRACTION_TILES.map((tile) => (
                  <button
                    key={tile.label}
                    type="button"
                    onClick={() => handleAddFraction(tile)}
                    className={`rounded-lg px-4 py-2 font-mono text-xs font-bold cursor-pointer ${tile.color} hover:opacity-90`}
                  >
                    + {tile.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleLogNumberLab}
                className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 cursor-pointer"
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                Save Number Lab Session
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* WORD-PROBLEM DECODER */
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6">
          <div>
            <p className="text-xs font-medium text-teal-700 mb-1">
              Step-by-Step Story Math · Progressive Hints
            </p>
            <h3 className="font-display text-lg font-semibold text-slate-900">
              “Maya has 12 marigold pots arranged in 4 equal trays. She waters 3 of the trays before
              lunch. How many pots did she water?”
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { step: 1, label: '1. What is given?' },
              { step: 2, label: '2. What is asked?' },
              { step: 3, label: '3. Visual model' },
              { step: 4, label: '4. Try a solution' },
            ].map((s) => (
              <button
                key={s.step}
                type="button"
                onClick={() => setDecoderStage(s.step)}
                className={`rounded-lg px-3.5 py-2 text-xs font-semibold cursor-pointer ${
                  decoderStage === s.step
                    ? 'bg-teal-700 text-white'
                    : 'border border-slate-200 bg-[#FAF9F6] text-slate-700'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="rounded-xl border border-slate-200 bg-[#FAF9F6] p-5 space-y-4">
            {decoderStage === 1 && (
              <div>
                <h4 className="font-semibold text-sm text-slate-900">What is given?</h4>
                <ul className="mt-2 list-disc pl-5 text-sm text-slate-700 space-y-1">
                  <li>Total marigold pots = 12</li>
                  <li>Grouped equally into 4 trays</li>
                  <li>3 trays are watered before lunch</li>
                </ul>
              </div>
            )}

            {decoderStage === 2 && (
              <div>
                <h4 className="font-semibold text-sm text-slate-900">What is asked?</h4>
                <p className="mt-2 text-sm text-slate-700">
                  We want to find the number of pots inside those 3 watered trays.
                </p>
              </div>
            )}

            {decoderStage === 3 && (
              <div>
                <h4 className="font-semibold text-sm text-slate-900">Visual Model (4 Trays)</h4>
                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[1, 2, 3, 4].map((tray) => (
                    <div
                      key={tray}
                      className={`rounded-xl border p-3 text-center ${
                        tray <= 3
                          ? 'border-teal-400 bg-teal-50 text-teal-900'
                          : 'border-slate-200 bg-white text-slate-500'
                      }`}
                    >
                      <p className="text-xs font-semibold">
                        Tray {tray} {tray <= 3 ? '(Watered)' : '(Later)'}
                      </p>
                      <p className="mt-1.5 font-mono text-sm font-bold">● ● ● (3)</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {decoderStage === 4 && (
              <form onSubmit={handleCheckDecoder} className="space-y-4">
                <div>
                  <label
                    htmlFor="decoder-ans"
                    className="block text-sm font-semibold text-slate-900 mb-1.5"
                  >
                    How many pots did Maya water?
                  </label>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <input
                      id="decoder-ans"
                      type="number"
                      value={userAnswer}
                      onChange={(e) => setUserAnswer(e.target.value)}
                      placeholder="Type number..."
                      className="w-36 rounded-lg border border-slate-300 bg-white px-3 py-2 font-mono text-sm"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-teal-700 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-800 cursor-pointer"
                    >
                      Check Thinking
                    </button>
                    <button
                      type="button"
                      onClick={() => setHintLevel((h) => Math.min(2, h + 1))}
                      className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 cursor-pointer"
                    >
                      Show Hint ({hintLevel}/2)
                    </button>
                  </div>
                </div>

                {hintLevel >= 1 && (
                  <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    Hint 1: 12 pots split evenly into 4 trays means each tray holds 3 pots.
                  </p>
                )}
                {hintLevel >= 2 && (
                  <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    Hint 2: Count 3 trays of 3 pots each: 3 + 3 + 3.
                  </p>
                )}
                {decoderFeedback && (
                  <p className="text-xs font-semibold text-teal-800">{decoderFeedback}</p>
                )}
              </form>
            )}
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => setDecoderStage((s) => Math.min(4, s + 1))}
              className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer"
            >
              Next Step
            </button>
            <button
              type="button"
              onClick={handleLogDecoder}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Save Decoder Activity
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
