import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Calculator,
  CheckCircle2,
  Compass,
  PenTool,
  Search,
  Sparkles,
  Timer,
  TrendingUp,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import type { DailyActivity } from '../../types/neuro';
import { playSoftTap } from '../../utils/gentleAudio';
import { CheckHub } from '../check/CheckHub';
import { LumiGuide } from '../check/LumiGuide';
import { PortalShell, type NavItem } from '../PortalShell';
import { AiBuddyView } from './AiBuddyView';
import { FocusWorld } from './FocusWorld';
import { NumberWorld } from './NumberWorld';
import { ReadingWorld } from './ReadingWorld';
import { WritingWorld } from './WritingWorld';

type StudentSection = 'worlds' | 'progress' | 'achievements' | 'ai-buddy' | 'check';
type ActiveWorld = null | 'reading' | 'number' | 'writing' | 'focus';

const NAV_ITEMS: NavItem[] = [
  { id: 'worlds', label: 'My Learning Worlds', icon: <Compass className="h-4 w-4 shrink-0" /> },
  { id: 'progress', label: 'My Progress', icon: <TrendingUp className="h-4 w-4 shrink-0" /> },
  { id: 'achievements', label: 'Achievements', icon: <Award className="h-4 w-4 shrink-0" /> },
  { id: 'ai-buddy', label: 'AI Buddy', icon: <Sparkles className="h-4 w-4 shrink-0" /> },
  { id: 'check', label: "Let's Check", icon: <Search className="h-4 w-4 shrink-0" /> },
];

export const StudentPortal: React.FC = () => {
  const {
    state,
    activeStudent,
    activeStudentId,
    setActiveStudentId,
    submitStudentFeedback,
    accessibilityPrefs,
    setAccessibilityPrefs,
    requestedWorld,
    setRequestedWorld,
    soundEnabled,
    setSoundEnabled,
    prefersReducedMotion,
  } = useAppData();

  const [section, setSection] = useState<StudentSection>('worlds');
  const [activeWorld, setActiveWorld] = useState<ActiveWorld>(null);
  const [activityToast, setActivityToast] = useState<string>('');

  useEffect(() => {
    if (requestedWorld) {
      setSection('worlds');
      setActiveWorld(requestedWorld);
      setRequestedWorld(null);
    }
  }, [requestedWorld, setRequestedWorld]);

  // Quick feedback form on My Progress
  const [feedbackTargetId, setFeedbackTargetId] = useState<string>('');
  const [feedbackText, setFeedbackText] = useState('');
  const [feelingTag, setFeelingTag] = useState<DailyActivity['feelingTag']>('Steady');
  const [feedbackSaved, setFeedbackSaved] = useState(false);

  const studentActivities = useMemo(
    () => state.activities.filter((a) => a.studentId === activeStudent.id),
    [state.activities, activeStudent.id]
  );

  const firstName = activeStudent.name.split(' ')[0];

  const handleActivityLogged = (msg: string) => {
    setActivityToast(msg);
    setTimeout(() => setActivityToast(''), 4000);
  };

  const handleNavSelect = (id: string) => {
    setActiveWorld(null);
    setSection(id as StudentSection);
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetId = feedbackTargetId || studentActivities[0]?.id;
    if (!targetId || !feedbackText.trim()) return;
    submitStudentFeedback(activeStudent.id, targetId, feedbackText.trim(), feelingTag);
    setFeedbackText('');
    setFeedbackSaved(true);
    setTimeout(() => setFeedbackSaved(false), 3000);
  };

  const studentSelector = (
    <select
      aria-label="Switch student profile"
      value={activeStudentId}
      onChange={(e) => {
        setActiveStudentId(e.target.value);
        setActiveWorld(null);
      }}
      className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 max-w-[190px] truncate"
    >
      {state.students.map((st) => (
        <option key={st.id} value={st.id}>
          {st.name} ({st.supportProfile})
        </option>
      ))}
    </select>
  );

  const breadcrumb = activeWorld
    ? `Student Playground / ${activeWorld.charAt(0).toUpperCase() + activeWorld.slice(1)} World`
    : `Student Playground / ${NAV_ITEMS.find((n) => n.id === section)?.label ?? 'Learning Worlds'}`;

  return (
    <PortalShell
      roleLabel={`Student Playground · ${activeStudent.name}`}
      navItems={NAV_ITEMS}
      activeNavId={section}
      onSelectNav={handleNavSelect}
      breadcrumb={breadcrumb}
      headerRightExtra={studentSelector}
    >
      {activityToast && (
        <div
          role="status"
          className="mb-5 rounded-xl border border-teal-300 bg-teal-50 px-4 py-3 flex items-center justify-between gap-3 text-sm font-medium text-teal-900"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-teal-700 shrink-0" aria-hidden="true" />
            <span>{activityToast}</span>
          </div>
          <button
            type="button"
            onClick={() => setActivityToast('')}
            className="text-xs font-semibold text-teal-800 hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* SECTION: MY LEARNING WORLDS */}
      {section === 'worlds' && (
        <AnimatePresence mode="wait">
          {activeWorld ? (
            <motion.div
              key={`world-${activeWorld}`}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25 }}
              className="space-y-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => {
                    playSoftTap(soundEnabled);
                    setActiveWorld(null);
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl border-2 border-slate-300 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-slate-800 hover:bg-slate-50 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  All Learning Worlds
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSoundEnabled((s) => !s)}
                    className={`inline-flex items-center gap-1.5 rounded-2xl border-2 px-3 py-2 text-xs font-bold cursor-pointer ${
                      soundEnabled
                        ? 'border-emerald-400 bg-[#D1FAE5] text-emerald-950'
                        : 'border-slate-200 bg-white text-slate-700'
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
                    onClick={() => {
                      setActiveWorld(null);
                      setSection('ai-buddy');
                    }}
                    className="inline-flex items-center gap-1.5 rounded-2xl border-2 border-purple-300 bg-[#F3E8FF] px-3.5 py-2 text-xs font-bold text-purple-950 hover:bg-purple-200/70 cursor-pointer"
                  >
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    Ask Lumi AI Buddy
                  </button>
                </div>
              </div>

              {activeWorld === 'reading' && (
                <ReadingWorld onActivityLogged={handleActivityLogged} />
              )}
              {activeWorld === 'number' && (
                <NumberWorld onActivityLogged={handleActivityLogged} />
              )}
              {activeWorld === 'writing' && (
                <WritingWorld onActivityLogged={handleActivityLogged} />
              )}
              {activeWorld === 'focus' && (
                <FocusWorld onActivityLogged={handleActivityLogged} />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="worlds-home"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={prefersReducedMotion ? undefined : { opacity: 0 }}
              transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25 }}
              className={`space-y-6 ${
                accessibilityPrefs.readingFriendly ? 'reading-friendly' : ''
              }`}
            >
              {/* Cheerful Welcome Playground Banner with Lumi */}
              <div className="rounded-3xl border-2 border-sky-200 bg-gradient-to-br from-[#FFFDF7] via-[#E0F2FE]/55 to-[#FEF9C3]/55 p-6 sm:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <LumiGuide
                  message={`Hi ${firstName}! Ready to play?`}
                  subMessage={`${activeStudent.className} · Pick a world below and explore at your own pace.`}
                />

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    aria-pressed={soundEnabled}
                    onClick={() => {
                      const next = !soundEnabled;
                      setSoundEnabled(next);
                      if (next) playSoftTap(true);
                    }}
                    className={`inline-flex items-center gap-1.5 rounded-2xl border-2 px-3.5 py-2 text-xs font-bold cursor-pointer ${
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
                    className={`rounded-2xl border-2 px-3.5 py-2 text-xs font-bold cursor-pointer ${
                      accessibilityPrefs.readingFriendly
                        ? 'border-sky-500 bg-[#E0F2FE] text-sky-950'
                        : 'border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    {accessibilityPrefs.readingFriendly
                      ? 'Spacious Text: On'
                      : 'Spacious Text'}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setAccessibilityPrefs((p) => ({
                        ...p,
                        reducedMotion: !p.reducedMotion,
                      }))
                    }
                    className={`rounded-2xl border-2 px-3.5 py-2 text-xs font-bold cursor-pointer ${
                      accessibilityPrefs.reducedMotion
                        ? 'border-emerald-500 bg-[#D1FAE5] text-emerald-950'
                        : 'border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    {accessibilityPrefs.reducedMotion ? 'Motion: Static' : 'Smooth Motion'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSection('check')}
                    className="inline-flex items-center gap-1.5 rounded-2xl border-2 border-amber-300 bg-[#FEF9C3] px-4 py-2 text-xs font-bold text-slate-900 hover:bg-amber-200/80 cursor-pointer"
                  >
                    <Search className="h-3.5 w-3.5 text-amber-800" aria-hidden="true" />
                    Let&apos;s Check
                  </button>
                </div>
              </div>

              {/* Today's Missions */}
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900 mb-3">
                  Today’s Optional Missions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <motion.button
                    type="button"
                    whileHover={prefersReducedMotion ? undefined : { y: -3, scale: 1.01 }}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                    onClick={() => {
                      playSoftTap(soundEnabled);
                      setActiveWorld('reading');
                    }}
                    className="text-left rounded-3xl border-2 border-sky-200 bg-[#E0F2FE]/65 p-5 hover:border-sky-400 transition-colors cursor-pointer"
                  >
                    <p className="text-xs font-bold text-sky-900">10 min · No grading</p>
                    <p className="mt-1 font-display text-lg font-bold text-slate-900">
                      Read-Along: Paper Kite Story
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      Try highlighted reading with your favorite paper color.
                    </p>
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={prefersReducedMotion ? undefined : { y: -3, scale: 1.01 }}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                    onClick={() => {
                      playSoftTap(soundEnabled);
                      setActiveWorld('number');
                    }}
                    className="text-left rounded-3xl border-2 border-emerald-200 bg-[#D1FAE5]/65 p-5 hover:border-emerald-400 transition-colors cursor-pointer"
                  >
                    <p className="text-xs font-bold text-emerald-900">8 min · Visual blocks</p>
                    <p className="mt-1 font-display text-lg font-bold text-slate-900">
                      Build 1 Whole with Fraction Tiles
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      Snap colorful blocks together and explore the number line.
                    </p>
                  </motion.button>

                  <motion.button
                    type="button"
                    whileHover={prefersReducedMotion ? undefined : { y: -3, scale: 1.01 }}
                    whileTap={prefersReducedMotion ? undefined : { scale: 0.99 }}
                    onClick={() => {
                      playSoftTap(soundEnabled);
                      setActiveWorld('focus');
                    }}
                    className="text-left rounded-3xl border-2 border-rose-200 bg-[#FFE4E6]/65 p-5 hover:border-rose-400 transition-colors cursor-pointer"
                  >
                    <p className="text-xs font-bold text-rose-900">1–5 min · Quick reset</p>
                    <p className="mt-1 font-display text-lg font-bold text-slate-900">
                      60-Second Reset &amp; Pattern Play
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      Take three slow breaths or try the 4-tile memory sequence.
                    </p>
                  </motion.button>
                </div>
              </div>

              {/* Four Learning Worlds Grid */}
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900 mb-3">
                  Explore Your Four Learning Worlds
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* World 1: Reading */}
                  <motion.div
                    whileHover={prefersReducedMotion ? undefined : { y: -4, scale: 1.01 }}
                    transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 250, damping: 22 }}
                    className="rounded-3xl border-2 border-sky-200 bg-[#E0F2FE]/45 overflow-hidden flex flex-col"
                  >
                    <div className="h-44 bg-[#E0F2FE]">
                      <img
                        src="/src/assets/images/world_reading_studio_1795274091431.jpg"
                        alt="Reading World illustrated open storybook"
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between bg-white/85">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-sky-800">
                          <BookOpen className="h-4 w-4" aria-hidden="true" />
                          <span>Reading World · Dyslexia Support</span>
                        </div>
                        <h3 className="mt-1 font-display text-2xl font-bold text-slate-900">
                          Read-Along Studio &amp; Sound Check
                        </h3>
                        <p className="mt-2 text-sm sm:text-base text-slate-700">
                          Adjust text size, spacing, and background color while following highlighted
                          sentences or clapping out syllables.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          playSoftTap(soundEnabled);
                          setActiveWorld('reading');
                        }}
                        className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-sky-700 px-5 py-3 text-sm font-bold text-white hover:bg-sky-800 cursor-pointer"
                      >
                        Enter Reading World
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </motion.div>

                  {/* World 2: Number */}
                  <motion.div
                    whileHover={prefersReducedMotion ? undefined : { y: -4, scale: 1.01 }}
                    transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 250, damping: 22 }}
                    className="rounded-3xl border-2 border-emerald-200 bg-[#D1FAE5]/45 overflow-hidden flex flex-col"
                  >
                    <div className="h-44 bg-[#D1FAE5]">
                      <img
                        src="/src/assets/images/world_number_lab_1795274055185.jpg"
                        alt="Number World tactile wooden fraction tiles"
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between bg-white/85">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                          <Calculator className="h-4 w-4" aria-hidden="true" />
                          <span>Number World · Dyscalculia Support</span>
                        </div>
                        <h3 className="mt-1 font-display text-2xl font-bold text-slate-900">
                          Visual Number Lab &amp; Word Decoder
                        </h3>
                        <p className="mt-2 text-sm sm:text-base text-slate-700">
                          Jump along an interactive number line, stack fraction tiles, and solve
                          word problems step by step with hints.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          playSoftTap(soundEnabled);
                          setActiveWorld('number');
                        }}
                        className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-800 cursor-pointer"
                      >
                        Enter Number World
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </motion.div>

                  {/* World 3: Writing */}
                  <motion.div
                    whileHover={prefersReducedMotion ? undefined : { y: -4, scale: 1.01 }}
                    transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 250, damping: 22 }}
                    className="rounded-3xl border-2 border-amber-300 bg-[#FEF9C3]/65 p-6 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                        <PenTool className="h-4 w-4" aria-hidden="true" />
                        <span>Writing World · Dysgraphia Support</span>
                      </div>
                      <h3 className="mt-2 font-display text-2xl font-bold text-slate-900">
                        Idea &amp; Outline Studio + Homework Builder
                      </h3>
                      <p className="mt-2 text-sm sm:text-base text-slate-700 leading-relaxed">
                        Capture spoken or typed ideas in any order, turn them into a 3-part story
                        outline, and split homework into clear checkboxes.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        playSoftTap(soundEnabled);
                        setActiveWorld('writing');
                      }}
                      className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-700 px-5 py-3 text-sm font-bold text-white hover:bg-amber-800 cursor-pointer"
                    >
                      Enter Writing World
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </motion.div>

                  {/* World 4: Focus */}
                  <motion.div
                    whileHover={prefersReducedMotion ? undefined : { y: -4, scale: 1.01 }}
                    transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 250, damping: 22 }}
                    className="rounded-3xl border-2 border-rose-300 bg-[#FFE4E6]/65 p-6 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-rose-900">
                        <Timer className="h-4 w-4" aria-hidden="true" />
                        <span>Focus World · ADHD Support</span>
                      </div>
                      <h3 className="mt-2 font-display text-2xl font-bold text-slate-900">
                        Focus Timer, Start Now &amp; Memory Play
                      </h3>
                      <p className="mt-2 text-sm sm:text-base text-slate-700 leading-relaxed">
                        Use a visual timer, turn big tasks into 2-minute micro-steps, try a
                        60-second breathing reset, or play pattern memory.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        playSoftTap(soundEnabled);
                        setActiveWorld('focus');
                      }}
                      className="mt-5 inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-700 px-5 py-3 text-sm font-bold text-white hover:bg-rose-800 cursor-pointer"
                    >
                      Enter Focus World
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* SECTION: MY PROGRESS */}
      {section === 'progress' && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25 }}
          className="space-y-6"
        >
          <div className="rounded-3xl border-2 border-sky-200 bg-gradient-to-br from-[#FFFDF7] via-[#E0F2FE]/55 to-[#D1FAE5]/45 p-6">
            <LumiGuide
              compact
              message={`${firstName}’s Learning Journey`}
              subMessage="Every session you finish is celebrated here—no rankings, no lost streaks."
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-6">
              <div className="rounded-3xl border-2 border-sky-200 bg-white p-6">
                <h2 className="font-display text-lg font-bold text-slate-900 mb-4">
                  Recent Sessions ({studentActivities.length})
                </h2>
                <div className="divide-y divide-slate-100">
                  {studentActivities.slice(0, 8).map((act) => (
                    <div key={act.id} className="py-3.5 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between text-xs text-slate-600">
                        <span className="font-bold text-indigo-700">{act.module}</span>
                        <span className="font-mono tabular-nums">
                          {act.date} · {act.durationMinutes}m
                        </span>
                      </div>
                      <p className="mt-1 text-sm sm:text-base font-bold text-slate-900">
                        {act.activityTitle}
                      </p>
                      {act.studentFeedback && (
                        <p className="mt-1 text-xs sm:text-sm text-slate-600">
                          Your note: “{act.studentFeedback}”
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Saved Outlines & Homework Checklists */}
              <div className="rounded-3xl border-2 border-amber-200 bg-[#FFFDF7] p-6">
                <h2 className="font-display text-lg font-bold text-slate-900 mb-4">
                  Saved Outlines &amp; Checklists ({activeStudent.savedArtifacts.length})
                </h2>
                <div className="space-y-3">
                  {activeStudent.savedArtifacts.map((art) => (
                    <div
                      key={art.id}
                      className="rounded-2xl border-2 border-amber-200/80 bg-[#FEF9C3]/45 p-4"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
                        <span className="capitalize font-bold text-amber-900">{art.type}</span>
                        <span className="font-mono tabular-nums">{art.createdAt}</span>
                      </div>
                      <p className="text-sm sm:text-base font-bold text-slate-900">{art.title}</p>
                      <ul className="mt-2 list-disc pl-5 text-xs sm:text-sm text-slate-700 space-y-1">
                        {art.items.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Share Reflection Form */}
            <div className="lg:col-span-5">
              <form
                onSubmit={handleFeedbackSubmit}
                className="rounded-3xl border-2 border-purple-200 bg-[#F3E8FF]/40 p-6 space-y-4"
              >
                <h2 className="font-display text-lg font-bold text-slate-900">
                  Share How Learning Felt
                </h2>
                <p className="text-xs sm:text-sm text-slate-700">
                  Your reflection helps your teacher and parent know which tools work best for you.
                </p>

                {feedbackSaved && (
                  <div className="rounded-2xl border-2 border-emerald-300 bg-[#D1FAE5] px-3.5 py-2.5 text-xs font-bold text-emerald-950">
                    Reflection saved! Your parent and school views can see it too.
                  </div>
                )}

                <div>
                  <label
                    htmlFor="fb-activity"
                    className="block text-xs font-bold text-slate-700 mb-1"
                  >
                    Activity
                  </label>
                  <select
                    id="fb-activity"
                    value={feedbackTargetId || studentActivities[0]?.id || ''}
                    onChange={(e) => setFeedbackTargetId(e.target.value)}
                    className="w-full rounded-2xl border-2 border-slate-200 bg-white px-3 py-2.5 text-xs sm:text-sm font-medium"
                  >
                    {studentActivities.slice(0, 6).map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.date} · {a.activityTitle}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-700 mb-1.5">How did it feel?</p>
                  <div className="flex flex-wrap gap-2">
                    {(['Steady', 'Curious', 'Proud', 'Needed a hint'] as const).map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => {
                          playSoftTap(soundEnabled);
                          setFeelingTag(tag);
                        }}
                        className={`rounded-2xl border-2 px-3.5 py-1.5 text-xs font-bold cursor-pointer ${
                          feelingTag === tag
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                            : 'border-slate-200 bg-white text-slate-700'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="fb-note"
                    className="block text-xs font-bold text-slate-700 mb-1"
                  >
                    Your Note
                  </label>
                  <textarea
                    id="fb-note"
                    rows={3}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="What helped you most today?"
                    className="w-full rounded-2xl border-2 border-slate-200 bg-white px-3.5 py-2.5 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white hover:bg-indigo-700 cursor-pointer"
                >
                  Save My Reflection
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      )}

      {/* SECTION: ACHIEVEMENTS */}
      {section === 'achievements' && (
        <motion.div
          initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.25 }}
          className="space-y-6"
        >
          <div className="rounded-3xl border-2 border-amber-200 bg-gradient-to-br from-[#FFFDF7] via-[#FEF9C3]/60 to-[#FFE4E6]/40 p-6">
            <LumiGuide
              compact
              message="Your Effort Milestones!"
              subMessage="Unlocked by exploring tools, asking for hints, and taking steady breaks—never by speed or competing with classmates."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeStudent.achievements.map((ach, idx) => (
              <motion.div
                key={ach.id}
                whileHover={prefersReducedMotion ? undefined : { y: -3, scale: 1.01 }}
                transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 250, damping: 22 }}
                className={`rounded-3xl border-2 p-6 flex flex-col justify-between ${
                  idx % 3 === 0
                    ? 'border-amber-200 bg-[#FEF9C3]/55'
                    : idx % 3 === 1
                      ? 'border-sky-200 bg-[#E0F2FE]/55'
                      : 'border-emerald-200 bg-[#D1FAE5]/55'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                    <span className="font-bold text-amber-900">{ach.world}</span>
                    <span className="font-mono tabular-nums">{ach.earnedDate}</span>
                  </div>
                  <h2 className="font-display text-lg sm:text-xl font-bold text-slate-900">
                    {ach.title}
                  </h2>
                  <p className="mt-1.5 text-sm text-slate-700 leading-relaxed">
                    {ach.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* SECTION: AI BUDDY */}
      {section === 'ai-buddy' && <AiBuddyView />}

      {/* SECTION: LET'S CHECK */}
      {section === 'check' && <CheckHub />}
    </PortalShell>
  );
};
