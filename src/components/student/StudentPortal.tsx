import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Calculator,
  CheckCircle2,
  Compass,
  PenTool,
  Sparkles,
  Timer,
  TrendingUp,
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import type { DailyActivity } from '../../types/neuro';
import { PortalShell, type NavItem } from '../PortalShell';
import { AiBuddyView } from './AiBuddyView';
import { FocusWorld } from './FocusWorld';
import { NumberWorld } from './NumberWorld';
import { ReadingWorld } from './ReadingWorld';
import { WritingWorld } from './WritingWorld';

type StudentSection = 'worlds' | 'progress' | 'achievements' | 'ai-buddy';
type ActiveWorld = null | 'reading' | 'number' | 'writing' | 'focus';

const NAV_ITEMS: NavItem[] = [
  { id: 'worlds', label: 'My Learning Worlds', icon: <Compass className="h-4 w-4 shrink-0" /> },
  { id: 'progress', label: 'My Progress', icon: <TrendingUp className="h-4 w-4 shrink-0" /> },
  { id: 'achievements', label: 'Achievements', icon: <Award className="h-4 w-4 shrink-0" /> },
  { id: 'ai-buddy', label: 'AI Buddy', icon: <Sparkles className="h-4 w-4 shrink-0" /> },
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
  } = useAppData();

  const [section, setSection] = useState<StudentSection>('worlds');
  const [activeWorld, setActiveWorld] = useState<ActiveWorld>(null);
  const [activityToast, setActivityToast] = useState<string>('');

  // Quick feedback form on My Progress
  const [feedbackTargetId, setFeedbackTargetId] = useState<string>('');
  const [feedbackText, setFeedbackText] = useState('');
  const [feelingTag, setFeelingTag] = useState<DailyActivity['feelingTag']>('Calm');
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
      aria-label="Switch demo student profile"
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
        <>
          {activeWorld ? (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setActiveWorld(null)}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  All Learning Worlds
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveWorld(null);
                    setSection('ai-buddy');
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-semibold text-indigo-800 hover:bg-indigo-100 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                  Ask Lumi AI Buddy
                </button>
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
            </div>
          ) : (
            <div
              className={`space-y-6 ${
                accessibilityPrefs.readingFriendly ? 'reading-friendly' : ''
              }`}
            >
              {/* Welcome Playground Banner */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-display text-2xl font-bold shrink-0">
                    {firstName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-indigo-700">
                      {activeStudent.className} · Your Calm Learning Space
                    </p>
                    <h1 className="font-display text-2xl font-bold text-slate-900">
                      Welcome back, {firstName}!
                    </h1>
                    <p className="mt-0.5 text-sm text-slate-600">
                      Pick a world below to explore at your own pace—no timers unless you want one.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setAccessibilityPrefs((p) => ({
                        ...p,
                        readingFriendly: !p.readingFriendly,
                      }))
                    }
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold cursor-pointer ${
                      accessibilityPrefs.readingFriendly
                        ? 'border-sky-600 bg-sky-50 text-sky-900'
                        : 'border-slate-200 bg-[#FAF9F6] text-slate-700'
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
                    className={`rounded-lg border px-3 py-2 text-xs font-semibold cursor-pointer ${
                      accessibilityPrefs.reducedMotion
                        ? 'border-teal-600 bg-teal-50 text-teal-900'
                        : 'border-slate-200 bg-[#FAF9F6] text-slate-700'
                    }`}
                  >
                    {accessibilityPrefs.reducedMotion ? 'Calm Motion: Reduced' : 'Reduce Motion'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSection('ai-buddy')}
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    Chat with Lumi
                  </button>
                </div>
              </div>

              {/* Today's Gentle Missions */}
              <div>
                <h2 className="font-display text-lg font-semibold text-slate-900 mb-3">
                  Today’s Optional Missions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => setActiveWorld('reading')}
                    className="text-left rounded-xl border border-slate-200 bg-white p-5 hover:border-sky-400 transition-colors cursor-pointer"
                  >
                    <p className="text-xs font-semibold text-sky-700">10 min · No grading</p>
                    <p className="mt-1 font-display text-base font-semibold text-slate-900">
                      Read-Along: Paper Kite Story
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      Try highlighted reading with your favorite paper color.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveWorld('number')}
                    className="text-left rounded-xl border border-slate-200 bg-white p-5 hover:border-teal-400 transition-colors cursor-pointer"
                  >
                    <p className="text-xs font-semibold text-teal-700">8 min · Visual blocks</p>
                    <p className="mt-1 font-display text-base font-semibold text-slate-900">
                      Build 1 Whole with Fraction Tiles
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      Snap colorful blocks together and explore the number line.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveWorld('focus')}
                    className="text-left rounded-xl border border-slate-200 bg-white p-5 hover:border-rose-400 transition-colors cursor-pointer"
                  >
                    <p className="text-xs font-semibold text-rose-700">1–5 min · Calm reset</p>
                    <p className="mt-1 font-display text-base font-semibold text-slate-900">
                      60-Second Reset &amp; Pattern Play
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      Take three slow breaths or try the 4-tile memory sequence.
                    </p>
                  </button>
                </div>
              </div>

              {/* Four Learning Worlds Grid */}
              <div>
                <h2 className="font-display text-lg font-semibold text-slate-900 mb-3">
                  Explore Your Four Learning Worlds
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* World 1: Reading */}
                  <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col">
                    <div className="h-40 bg-sky-50">
                      <img
                        src="/src/assets/images/world_reading_studio_1795274091431.jpg"
                        alt="Reading World illustrated open storybook"
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-sky-700">
                          <BookOpen className="h-4 w-4" aria-hidden="true" />
                          <span>Reading World · Dyslexia Support</span>
                        </div>
                        <h3 className="mt-1 font-display text-xl font-bold text-slate-900">
                          Read-Along Studio &amp; Sound Check
                        </h3>
                        <p className="mt-2 text-sm text-slate-600">
                          Adjust text size, spacing, and background color while following highlighted
                          sentences or clapping out syllables.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveWorld('reading')}
                        className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-sky-700 px-4 py-2.5 text-xs font-semibold text-white hover:bg-sky-800 cursor-pointer"
                      >
                        Enter Reading World
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {/* World 2: Number */}
                  <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col">
                    <div className="h-40 bg-teal-50">
                      <img
                        src="/src/assets/images/world_number_lab_1795274055185.jpg"
                        alt="Number World tactile wooden fraction tiles"
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 text-xs font-semibold text-teal-700">
                          <Calculator className="h-4 w-4" aria-hidden="true" />
                          <span>Number World · Dyscalculia Support</span>
                        </div>
                        <h3 className="mt-1 font-display text-xl font-bold text-slate-900">
                          Visual Number Lab &amp; Word Decoder
                        </h3>
                        <p className="mt-2 text-sm text-slate-600">
                          Jump along an interactive number line, stack fraction tiles, and solve
                          word problems step by step with hints.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveWorld('number')}
                        className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-teal-700 cursor-pointer"
                      >
                        Enter Number World
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {/* World 3: Writing */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-amber-700">
                        <PenTool className="h-4 w-4" aria-hidden="true" />
                        <span>Writing World · Dysgraphia Support</span>
                      </div>
                      <h3 className="mt-2 font-display text-xl font-bold text-slate-900">
                        Idea &amp; Outline Studio + Homework Builder
                      </h3>
                      <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                        Capture spoken or typed ideas in any order, turn them into a 3-part story
                        outline, and split homework into calm checkboxes.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveWorld('writing')}
                      className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-amber-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-amber-700 cursor-pointer"
                    >
                      Enter Writing World
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>

                  {/* World 4: Focus */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-semibold text-rose-700">
                        <Timer className="h-4 w-4" aria-hidden="true" />
                        <span>Focus World · ADHD Support</span>
                      </div>
                      <h3 className="mt-2 font-display text-xl font-bold text-slate-900">
                        Focus Timer, Start Now &amp; Memory Play
                      </h3>
                      <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                        Use a gentle visual timer, turn big tasks into 2-minute micro-steps, try a
                        60-second breathing reset, or play pattern memory.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveWorld('focus')}
                      className="mt-5 inline-flex items-center justify-center gap-2 rounded-lg bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-rose-700 cursor-pointer"
                    >
                      Enter Focus World
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* SECTION: MY PROGRESS */}
      {section === 'progress' && (
        <div className="space-y-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">
              {firstName}’s Learning Journey
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Every session you finish is celebrated here—no rankings, no lost streaks.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="font-display text-lg font-semibold text-slate-900 mb-4">
                  Recent Sessions ({studentActivities.length})
                </h2>
                <div className="divide-y divide-slate-100">
                  {studentActivities.slice(0, 8).map((act) => (
                    <div key={act.id} className="py-3.5 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span className="font-semibold text-indigo-700">{act.module}</span>
                        <span className="font-mono tabular-nums">
                          {act.date} · {act.durationMinutes}m
                        </span>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-slate-900">
                        {act.activityTitle}
                      </p>
                      {act.studentFeedback && (
                        <p className="mt-1 text-xs text-slate-600">
                          Your note: “{act.studentFeedback}”
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Saved Outlines & Homework Checklists */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="font-display text-lg font-semibold text-slate-900 mb-4">
                  Saved Outlines &amp; Checklists ({activeStudent.savedArtifacts.length})
                </h2>
                <div className="space-y-3">
                  {activeStudent.savedArtifacts.map((art) => (
                    <div
                      key={art.id}
                      className="rounded-xl border border-slate-200 bg-[#FAF9F6] p-4"
                    >
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                        <span className="capitalize font-semibold text-amber-800">{art.type}</span>
                        <span className="font-mono tabular-nums">{art.createdAt}</span>
                      </div>
                      <p className="text-sm font-semibold text-slate-900">{art.title}</p>
                      <ul className="mt-2 list-disc pl-5 text-xs text-slate-700 space-y-1">
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
                className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4"
              >
                <h2 className="font-display text-lg font-semibold text-slate-900">
                  Share How Learning Felt
                </h2>
                <p className="text-xs text-slate-500">
                  Your reflection helps your teacher and parent know which tools work best for you.
                </p>

                {feedbackSaved && (
                  <div className="rounded-lg border border-teal-200 bg-teal-50 px-3.5 py-2 text-xs text-teal-900">
                    Reflection saved! Your parent and school views can see it too.
                  </div>
                )}

                <div>
                  <label
                    htmlFor="fb-activity"
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Activity
                  </label>
                  <select
                    id="fb-activity"
                    value={feedbackTargetId || studentActivities[0]?.id || ''}
                    onChange={(e) => setFeedbackTargetId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs"
                  >
                    {studentActivities.slice(0, 6).map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.date} · {a.activityTitle}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-700 mb-1.5">How did it feel?</p>
                  <div className="flex flex-wrap gap-2">
                    {(['Calm', 'Curious', 'Proud', 'Needed a hint'] as const).map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setFeelingTag(tag)}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                          feelingTag === tag
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-800'
                            : 'border-slate-200 bg-[#FAF9F6] text-slate-700'
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
                    className="block text-xs font-semibold text-slate-700 mb-1"
                  >
                    Your Note
                  </label>
                  <textarea
                    id="fb-note"
                    rows={3}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="What helped you most today?"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 cursor-pointer"
                >
                  Save My Reflection
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* SECTION: ACHIEVEMENTS */}
      {section === 'achievements' && (
        <div className="space-y-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">
              Your Effort Milestones
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Unlocked by exploring tools, asking for hints, and taking calm breaks—never by speed
              or competing with classmates.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeStudent.achievements.map((ach) => (
              <div
                key={ach.id}
                className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-semibold text-amber-700">{ach.world}</span>
                    <span className="font-mono tabular-nums">{ach.earnedDate}</span>
                  </div>
                  <h2 className="font-display text-lg font-bold text-slate-900">{ach.title}</h2>
                  <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                    {ach.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION: AI BUDDY */}
      {section === 'ai-buddy' && <AiBuddyView />}
    </PortalShell>
  );
};
