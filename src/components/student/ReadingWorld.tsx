import React, { useEffect, useRef, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Pause,
  Play,
  RotateCcw,
  Volume2,
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';

const PASSAGE_SENTENCES = [
  'High above the quiet coastal town stood an old wooden kite observatory.',
  'Every morning, Asha measured the sea breeze using three colored ribbon flags.',
  'When the teal ribbon fluttered steadily, her paper kite glided smoothly into the sky.',
  'She wrote down each gust in her notebook using simple sketches instead of long paragraphs.',
  'By afternoon, the whole neighbourhood watched the bright kite trace gentle arcs above the bay.',
];

const SOUND_CHALLENGES = [
  {
    word: 'observatory',
    chunks: ['ob', 'ser', 'va', 'to', 'ry'],
    hint: 'Clap out the 5 steady beats: ob · ser · va · to · ry.',
    rhymePrompt: 'Which word shares the same ending sound as "kite"?',
    options: ['bright', 'coat', 'boat'],
    answer: 'bright',
  },
  {
    word: 'wonderful',
    chunks: ['won', 'der', 'ful'],
    hint: 'Break it into 3 parts: won · der · ful.',
    rhymePrompt: 'Which word starts with the same gentle sound blend as "steady"?',
    options: ['star', 'cloud', 'breeze'],
    answer: 'star',
  },
];

interface ReadingWorldProps {
  onActivityLogged: (msg: string) => void;
}

export const ReadingWorld: React.FC<ReadingWorldProps> = ({ onActivityLogged }) => {
  const { activeStudent, logStudentActivity } = useAppData();
  const [subMode, setSubMode] = useState<'read-along' | 'sound-check'>('read-along');

  // Read-Along Studio state
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSentenceIdx, setActiveSentenceIdx] = useState<number>(0);
  const [fontSize, setFontSize] = useState<number>(18);
  const [lineHeight, setLineHeight] = useState<number>(1.8);
  const [paperTint, setPaperTint] = useState<'ivory' | 'sage' | 'sky'>('ivory');
  const [speed, setSpeed] = useState<0.75 | 1 | 1.25>(1);
  const [useSpeech, setUseSpeech] = useState<boolean>(false);
  const [compAnswer, setCompAnswer] = useState<string>('');
  const [compSubmitted, setCompSubmitted] = useState(false);
  const [reflection, setReflection] = useState('');

  // Word & Sound Check state
  const [challengeIdx, setChallengeIdx] = useState(0);
  const [revealedChunks, setRevealedChunks] = useState<number>(1);
  const [selectedRhyme, setSelectedRhyme] = useState<string>('');

  const timerRef = useRef<number | null>(null);

  const speechAvailable =
    typeof window !== 'undefined' && 'speechSynthesis' in window;

  const speakSentence = (text: string, rate: number) => {
    if (!useSpeech || !speechAvailable) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = rate;
      window.speechSynthesis.speak(utter);
    } catch {
      // Graceful fallback
    }
  };

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) window.clearInterval(timerRef.current);
      return;
    }

    speakSentence(PASSAGE_SENTENCES[activeSentenceIdx], speed);

    const intervalMs = Math.round(3400 / speed);
    timerRef.current = window.setInterval(() => {
      setActiveSentenceIdx((prev) => {
        const next = prev + 1;
        if (next >= PASSAGE_SENTENCES.length) {
          setIsPlaying(false);
          return prev;
        }
        speakSentence(PASSAGE_SENTENCES[next], speed);
        return next;
      });
    }, intervalMs);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [isPlaying, speed, useSpeech]);

  useEffect(() => {
    return () => {
      if (speechAvailable) window.speechSynthesis.cancel();
    };
  }, [speechAvailable]);

  const handleRestartReadAlong = () => {
    setIsPlaying(false);
    setActiveSentenceIdx(0);
    if (speechAvailable) window.speechSynthesis.cancel();
  };

  const handleSentenceClick = (idx: number) => {
    setActiveSentenceIdx(idx);
    speakSentence(PASSAGE_SENTENCES[idx], speed);
  };

  const handleCompleteReading = () => {
    logStudentActivity({
      studentId: activeStudent.id,
      module: 'Reading World',
      activityTitle: 'Read-Along Studio: The Paper Kite Observatory',
      durationMinutes: 10,
      status: 'Completed',
      studentFeedback:
        reflection.trim() || 'Practiced read-along with comfortable spacing and highlighting.',
      feelingTag: 'Calm',
      achievementTitle: 'Story Explorer',
      achievementDescription: 'Completed a calm Read-Along Studio session at your own pace.',
    });
    setReflection('');
    onActivityLogged('Read-Along session saved to your progress, Parent view, and School timeline!');
  };

  const handleCompleteSoundCheck = () => {
    logStudentActivity({
      studentId: activeStudent.id,
      module: 'Reading World',
      activityTitle: 'Word & Sound Check: Syllable Bridges',
      durationMinutes: 8,
      status: 'Completed',
      studentFeedback: 'Explored syllable chunks and sound patterns.',
      feelingTag: 'Curious',
    });
    onActivityLogged('Word & Sound Check activity saved!');
  };

  const tintClasses =
    paperTint === 'sage'
      ? 'bg-[#F0F7F4] border-teal-200'
      : paperTint === 'sky'
        ? 'bg-[#F0F6FA] border-sky-200'
        : 'bg-[#FFFDF7] border-amber-200/80';

  const currentSound = SOUND_CHALLENGES[challengeIdx];

  return (
    <div className="space-y-6">
      {/* Header & Mode Switch */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="rounded-xl bg-sky-50 border border-sky-200 p-2.5 text-sky-700">
            <BookOpen className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              Reading World · Dyslexia Support
            </h2>
            <p className="text-xs text-slate-500">
              Educational reading comfort tools—never a clinical reading test.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 self-start">
          <button
            type="button"
            onClick={() => setSubMode('read-along')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer ${
              subMode === 'read-along'
                ? 'bg-white text-sky-800 shadow-xs'
                : 'text-slate-600'
            }`}
          >
            Read-Along Studio
          </button>
          <button
            type="button"
            onClick={() => setSubMode('sound-check')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer ${
              subMode === 'sound-check'
                ? 'bg-white text-sky-800 shadow-xs'
                : 'text-slate-600'
            }`}
          >
            Word &amp; Sound Check
          </button>
        </div>
      </div>

      {subMode === 'read-along' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Interactive Reading Stage */}
          <div className="lg:col-span-8 space-y-5">
            <div className={`rounded-2xl border p-6 sm:p-8 transition-colors ${tintClasses}`}>
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200/70">
                <h3 className="font-display text-lg font-bold text-slate-900">
                  The Paper Kite Observatory
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsPlaying((v) => !v)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-sky-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-sky-800 cursor-pointer"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5" aria-hidden="true" />
                        Play Read-Along
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleRestartReadAlong}
                    aria-label="Restart passage"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                    Restart
                  </button>
                </div>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                Click any sentence to highlight it{speechAvailable ? ' or listen aloud' : ''}.
              </p>

              <div
                className="mt-4 space-y-3 tracking-wide text-slate-900"
                style={{ fontSize: `${fontSize}px`, lineHeight }}
              >
                {PASSAGE_SENTENCES.map((sentence, idx) => {
                  const active = idx === activeSentenceIdx;
                  return (
                    <button
                      key={sentence}
                      type="button"
                      onClick={() => handleSentenceClick(idx)}
                      className={`block w-full text-left rounded-xl px-3.5 py-2.5 transition-colors cursor-pointer ${
                        active
                          ? 'bg-amber-200/70 text-slate-950 font-medium ring-1 ring-amber-300'
                          : 'hover:bg-white/60 text-slate-700'
                      }`}
                    >
                      {sentence}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Gentle Comprehension Check */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
              <h3 className="font-display text-base font-semibold text-slate-900">
                Quick Story Check (No Grading!)
              </h3>
              <p className="text-sm text-slate-700">
                How did Asha tell when the sea breeze was steady enough for her kite?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {[
                  'By watching the teal ribbon flag flutter steadily',
                  'By checking a loud school bell',
                  'By waiting until midnight',
                ].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setCompAnswer(opt);
                      setCompSubmitted(true);
                    }}
                    className={`rounded-xl border p-3 text-left text-xs font-medium transition-colors cursor-pointer ${
                      compAnswer === opt
                        ? 'border-sky-600 bg-sky-50 text-sky-900'
                        : 'border-slate-200 bg-[#FAF9F6] text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
              {compSubmitted && (
                <div className="rounded-lg border border-teal-200 bg-teal-50 px-4 py-2.5 text-xs text-teal-900">
                  {compAnswer.includes('teal ribbon')
                    ? 'Spot on! The teal ribbon flag showed Asha when the sea breeze was steady.'
                    : 'Good try! Look back at sentence 3—the teal ribbon flag helped her watch the breeze.'}
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="Optional reflection: How did this reading pace feel?"
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs"
                />
                <button
                  type="button"
                  onClick={handleCompleteReading}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 cursor-pointer shrink-0"
                >
                  <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                  Complete &amp; Save Session
                </button>
              </div>
            </div>
          </div>

          {/* Reading Comfort Controls */}
          <div className="lg:col-span-4 rounded-2xl border border-slate-200 bg-white p-6 space-y-5 self-start">
            <h3 className="font-display text-base font-semibold text-slate-900">
              Comfort Controls
            </h3>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                <label htmlFor="rw-font">Text Size</label>
                <span className="font-mono tabular-nums">{fontSize}px</span>
              </div>
              <input
                id="rw-font"
                type="range"
                min={15}
                max={24}
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full accent-sky-700"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-700 mb-1.5">
                <label htmlFor="rw-space">Line Spacing</label>
                <span className="font-mono tabular-nums">{lineHeight.toFixed(1)}×</span>
              </div>
              <input
                id="rw-space"
                type="range"
                min={1.4}
                max={2.4}
                step={0.1}
                value={lineHeight}
                onChange={(e) => setLineHeight(Number(e.target.value))}
                className="w-full accent-sky-700"
              />
            </div>

            <div>
              <p className="text-xs font-medium text-slate-700 mb-2">Paper Background</p>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: 'ivory', label: 'Warm Ivory' },
                    { id: 'sage', label: 'Soft Sage' },
                    { id: 'sky', label: 'Calm Sky' },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setPaperTint(t.id)}
                    className={`rounded-lg border py-2 text-xs font-semibold cursor-pointer ${
                      paperTint === t.id
                        ? 'border-sky-600 bg-sky-50 text-sky-900'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-medium text-slate-700 mb-2">Reading Pace</p>
              <div className="grid grid-cols-3 gap-2">
                {([0.75, 1, 1.25] as const).map((sp) => (
                  <button
                    key={sp}
                    type="button"
                    onClick={() => setSpeed(sp)}
                    className={`rounded-lg border py-2 font-mono text-xs font-semibold cursor-pointer ${
                      speed === sp
                        ? 'border-sky-600 bg-sky-50 text-sky-900'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    {sp}×
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
                <Volume2 className="h-4 w-4 text-sky-700" aria-hidden="true" />
                <span>Voice Read-Aloud</span>
              </div>
              <button
                type="button"
                disabled={!speechAvailable}
                onClick={() => setUseSpeech((v) => !v)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                  !speechAvailable
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : useSpeech
                      ? 'bg-sky-700 text-white'
                      : 'border border-slate-300 bg-white text-slate-700'
                }`}
              >
                {!speechAvailable ? 'Visual Mode' : useSpeech ? 'Voice On' : 'Voice Off'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* WORD & SOUND CHECK */
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-lg font-semibold text-slate-900">
                Word &amp; Sound Check: Syllable Bridges
              </h3>
              <p className="text-xs text-slate-500">
                Break long words into friendly sound chunks. Educational play only—not a screening tool.
              </p>
            </div>
            <div className="flex gap-2">
              {SOUND_CHALLENGES.map((c, idx) => (
                <button
                  key={c.word}
                  type="button"
                  onClick={() => {
                    setChallengeIdx(idx);
                    setRevealedChunks(1);
                    setSelectedRhyme('');
                  }}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                    challengeIdx === idx
                      ? 'bg-sky-700 text-white'
                      : 'border border-slate-200 bg-[#FAF9F6] text-slate-700'
                  }`}
                >
                  Word {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-sky-200 bg-[#F0F6FA] p-6 text-center space-y-4">
            <p className="text-xs font-medium text-sky-800">Tap to reveal each syllable beat</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {currentSound.chunks.map((chunk, i) => (
                <span
                  key={chunk + i}
                  className={`rounded-xl border px-4 py-2.5 font-display text-xl font-bold transition-all ${
                    i < revealedChunks
                      ? 'border-sky-400 bg-white text-slate-900'
                      : 'border-dashed border-sky-300 bg-sky-100/50 text-transparent select-none'
                  }`}
                >
                  {chunk}
                </span>
              ))}
            </div>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() =>
                  setRevealedChunks((v) => Math.min(currentSound.chunks.length, v + 1))
                }
                className="rounded-lg bg-sky-700 px-4 py-2 text-xs font-semibold text-white hover:bg-sky-800 cursor-pointer"
              >
                Reveal Next Syllable ({revealedChunks}/{currentSound.chunks.length})
              </button>
              {speechAvailable && (
                <button
                  type="button"
                  onClick={() => {
                    const u = new SpeechSynthesisUtterance(currentSound.word);
                    u.rate = 0.85;
                    window.speechSynthesis.speak(u);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-sky-300 bg-white px-3.5 py-2 text-xs font-semibold text-sky-900 cursor-pointer"
                >
                  <Volume2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Hear Word
                </button>
              )}
            </div>
            <p className="text-xs text-slate-600">{currentSound.hint}</p>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-900">{currentSound.rhymePrompt}</p>
            <div className="flex flex-wrap gap-2.5">
              {currentSound.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setSelectedRhyme(opt)}
                  className={`rounded-lg border px-4 py-2 text-sm font-semibold cursor-pointer ${
                    selectedRhyme === opt
                      ? 'border-sky-600 bg-sky-50 text-sky-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
            {selectedRhyme && (
              <p className="text-xs font-medium text-teal-800">
                {selectedRhyme === currentSound.answer
                  ? `Nice ear! "${selectedRhyme}" matches the sound pattern.`
                  : `Good guess! Say both words slowly aloud—notice "${currentSound.answer}" matches!`}
              </p>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={handleCompleteSoundCheck}
              className="inline-flex items-center gap-1.5 rounded-lg bg-teal-600 px-4 py-2 text-xs font-semibold text-white hover:bg-teal-700 cursor-pointer"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              Save Word Check Activity
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
