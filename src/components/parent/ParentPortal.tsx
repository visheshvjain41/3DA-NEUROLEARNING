import React, { useMemo, useState } from 'react';
import {
  Award,
  Calendar,
  CheckCircle2,
  HeartHandshake,
  LayoutDashboard,
  MessageSquareHeart,
  RotateCcw,
  Settings,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAppData } from '../../context/AppDataContext';
import { CheckHub } from '../check/CheckHub';
import { PortalShell, type NavItem } from '../PortalShell';
import { ParentCounselorHub } from './ParentCounselorHub';

type ParentSection =
  | 'dashboard'
  | 'monthly'
  | 'daily'
  | 'extra-miles'
  | 'hub'
  | 'settings'
  | 'check';

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4 shrink-0" /> },
  { id: 'monthly', label: 'Monthly Progress', icon: <TrendingUp className="h-4 w-4 shrink-0" /> },
  { id: 'daily', label: 'Daily Progress', icon: <Calendar className="h-4 w-4 shrink-0" /> },
  { id: 'extra-miles', label: 'Extra Miles', icon: <Award className="h-4 w-4 shrink-0" /> },
  { id: 'hub', label: 'AI & Counselor Hub', icon: <MessageSquareHeart className="h-4 w-4 shrink-0" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4 shrink-0" /> },
  { id: 'check', label: "Let's Check", icon: <Sparkles className="h-4 w-4 shrink-0 text-amber-600" /> },
];

const MODULE_COLORS: Record<string, string> = {
  'Reading World': '#0284C7',
  'Number World': '#0D9488',
  'Writing World': '#D97706',
  'Focus World': '#E11D48',
};

export const ParentPortal: React.FC = () => {
  const {
    state,
    activeStudent,
    activeStudentId,
    setActiveStudentId,
    resetDemoData,
  } = useAppData();

  const [section, setSection] = useState<ParentSection>('dashboard');
  const [dailyFilterMode, setDailyFilterMode] = useState<'all' | 'sample-day'>('all');
  const [weeklyDigestOptIn, setWeeklyDigestOptIn] = useState(true);

  const studentActivities = useMemo(
    () => state.activities.filter((a) => a.studentId === activeStudent.id),
    [state.activities, activeStudent.id]
  );

  const studentObservations = useMemo(
    () => state.observations.filter((o) => o.studentId === activeStudent.id),
    [state.observations, activeStudent.id]
  );

  const completedCount = studentActivities.filter((a) => a.status === 'Completed').length;
  const totalMinutes = studentActivities.reduce((sum, a) => sum + a.durationMinutes, 0);

  const latestDate = studentActivities[0]?.date ?? '';
  const displayedDailyActivities =
    dailyFilterMode === 'sample-day' && latestDate
      ? studentActivities.filter((a) => a.date === latestDate)
      : studentActivities;

  const moduleUsageData = useMemo(() => {
    const order = ['Reading World', 'Number World', 'Writing World', 'Focus World'];
    const map: Record<string, number> = {
      'Reading World': 0,
      'Number World': 0,
      'Writing World': 0,
      'Focus World': 0,
    };
    studentActivities.forEach((a) => {
      map[a.module] = (map[a.module] || 0) + 1;
    });
    return order.map((mod) => ({
      module: mod.replace(' World', ''),
      sessions: map[mod] || 0,
      color: MODULE_COLORS[mod] || '#4F46E5',
    }));
  }, [studentActivities]);

  const monthlyTrendData = useMemo(() => {
    const map: Record<string, number> = {};
    [...studentActivities]
      .sort((a, b) => a.date.localeCompare(b.date))
      .forEach((a) => {
        const key = a.date.slice(5);
        map[key] = (map[key] || 0) + a.durationMinutes;
      });
    return Object.entries(map).map(([date, minutes]) => ({ date, minutes }));
  }, [studentActivities]);

  const studentSelector = (
    <select
      aria-label="Switch child profile"
      value={activeStudentId}
      onChange={(e) => setActiveStudentId(e.target.value)}
      className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 max-w-[200px] truncate"
    >
      {state.students.map((st) => (
        <option key={st.id} value={st.id}>
          {st.name} ({st.className})
        </option>
      ))}
    </select>
  );

  return (
    <PortalShell
      roleLabel="Parent Portal"
      navItems={NAV_ITEMS}
      activeNavId={section}
      onSelectNav={(id) => setSection(id as ParentSection)}
      breadcrumb={`Parent View / ${activeStudent.name} (${activeStudent.className})`}
      headerRightExtra={studentSelector}
    >
      {/* SECTION 1: DASHBOARD OVERVIEW */}
      {section === 'dashboard' && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-teal-700">
                {activeStudent.parentAccountName} · {activeStudent.supportProfile}
              </p>
              <h1 className="font-display text-2xl font-bold text-slate-900 mt-1">
                {activeStudent.name}’s Learning Rhythm
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Teacher: {activeStudent.teacher} · Counsellor: {activeStudent.counsellor}
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => setSection('monthly')}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer"
              >
                Monthly Progress
              </button>
              <button
                type="button"
                onClick={() => setSection('hub')}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 cursor-pointer"
              >
                Ask AI &amp; Counselor Hub
              </button>
            </div>
          </div>

          {/* Non-comparative effort summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-medium text-slate-500">Activities Completed (30d)</p>
              <p className="mt-2 font-mono text-3xl font-semibold text-teal-700 tabular-nums">
                {completedCount}
              </p>
              <p className="mt-1 text-xs text-slate-500">Celebrated at your child’s pace</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-medium text-slate-500">Focused Practice Minutes</p>
              <p className="mt-2 font-mono text-3xl font-semibold text-indigo-700 tabular-nums">
                {totalMinutes}m
              </p>
              <p className="mt-1 text-xs text-slate-500">No timed grading pressure</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-medium text-slate-500">Support Plan Status</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {activeStudent.supportPlan.reviewStatus}
              </p>
              <p className="mt-1 text-xs text-slate-500 tabular-nums">
                Updated {activeStudent.supportPlan.lastUpdated}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="font-display text-lg font-semibold text-slate-900 mb-3">
                Strengths &amp; What Helps Most
              </h2>
              <p className="text-xs font-semibold text-slate-500 mb-2">Observed Strengths</p>
              <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1.5">
                {activeStudent.strengths.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              <p className="text-xs font-semibold text-slate-500 mt-4 mb-2">
                Helpful Tools at Home &amp; School
              </p>
              <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1.5">
                {activeStudent.learningPreferences.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display text-lg font-semibold text-slate-900">
                  Recent Teacher &amp; Counsellor Notes
                </h2>
                <HeartHandshake className="h-4 w-4 text-teal-700" aria-hidden="true" />
              </div>
              <div className="divide-y divide-slate-100">
                {studentObservations.slice(0, 3).map((obs) => (
                  <div key={obs.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-slate-800">
                        {obs.author} ({obs.role})
                      </span>
                      <span className="font-mono tabular-nums">{obs.date}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-700 leading-relaxed">{obs.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: MONTHLY PROGRESS */}
      {section === 'monthly' && (
        <div className="space-y-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">
              Monthly Progress Summary
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Plain-language view of {activeStudent.name}’s learning patterns—no global scores or
              peer rankings.
            </p>
          </div>

          {/* Plain-language summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-display text-lg font-semibold text-slate-900">
              This Month in Plain Words
            </h2>
            <p className="mt-2 text-sm text-slate-700 leading-relaxed">
              {activeStudent.name} completed{' '}
              <span className="font-semibold">{completedCount} learning sessions</span> totaling{' '}
              <span className="font-semibold">{totalMinutes} minutes</span> across our interactive
              worlds. {activeStudent.supportPlan.overview}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="font-display text-base font-semibold text-slate-900 mb-1">
                Minutes Spent Across the Month
              </h3>
              <p className="text-xs text-slate-500 mb-4">Practice sessions over the last 30 days</p>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyTrendData} margin={{ left: -16, right: 12, top: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="minutes"
                      name="Minutes"
                      stroke="#4F46E5"
                      fill="#4F46E5"
                      fillOpacity={0.15}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="font-display text-base font-semibold text-slate-900 mb-1">
                Learning Worlds Explored
              </h3>
              <p className="text-xs text-slate-500 mb-4">Sessions by world</p>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={moduleUsageData} margin={{ left: -16, right: 12, top: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis dataKey="module" tick={{ fontSize: 11, fill: '#334155' }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
                    <Tooltip />
                    <Bar dataKey="sessions" name="Sessions" radius={[4, 4, 0, 0]}>
                      {moduleUsageData.map((entry) => (
                        <Cell key={entry.module} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Support Plan Goals & Review Status */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-lg font-semibold text-slate-900">
                Current Monthly Support Plan Goals
              </h2>
              <span
                className={`text-xs font-semibold ${
                  activeStudent.supportPlan.reviewStatus === 'Reviewed by educator'
                    ? 'text-teal-700'
                    : 'text-amber-700'
                }`}
              >
                {activeStudent.supportPlan.reviewStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">
                  Achievable Monthly Goals
                </p>
                <ul className="space-y-2 text-sm text-slate-700">
                  {activeStudent.supportPlan.monthlyGoals.map((goal) => (
                    <li key={goal} className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-teal-700 mt-0.5 shrink-0" aria-hidden="true" />
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">
                  Suggested Home Activities
                </p>
                <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
                  {activeStudent.supportPlan.homeActivities.map((act) => (
                    <li key={act}>{act}</li>
                  ))}
                </ul>
              </div>
            </div>

            {activeStudent.supportPlan.educatorNotes && (
              <div className="pt-4 border-t border-slate-100 text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Educator Note: </span>
                {activeStudent.supportPlan.educatorNotes}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SECTION 3: DAILY PROGRESS */}
      {section === 'daily' && (
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold text-slate-900">
                Daily Progress Feed
              </h1>
              <p className="text-sm text-slate-600">
                Chronological view of sessions, modules, durations, and student reflections.
              </p>
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1 self-start">
              <button
                type="button"
                onClick={() => setDailyFilterMode('all')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                  dailyFilterMode === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                All 30 Days ({studentActivities.length})
              </button>
              <button
                type="button"
                onClick={() => setDailyFilterMode('sample-day')}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                  dailyFilterMode === 'sample-day'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                Sample Day ({latestDate || 'Latest'})
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100">
            {displayedDailyActivities.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No daily activities logged yet for {activeStudent.name}.
              </div>
            ) : (
              displayedDailyActivities.map((act) => (
                <div
                  key={act.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      <span className="font-mono tabular-nums">
                        {act.date} · {act.time}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-semibold text-indigo-700">{act.module}</span>
                      <span aria-hidden="true">·</span>
                      <span>{act.status}</span>
                    </div>
                    <p className="mt-1 text-base font-semibold text-slate-900">
                      {act.activityTitle}
                    </p>
                    {act.studentFeedback && (
                      <p className="mt-1.5 text-sm text-slate-600">
                        Student reflection ({act.feelingTag ?? 'Note'}): “{act.studentFeedback}”
                      </p>
                    )}
                  </div>
                  <div className="font-mono text-sm font-semibold text-slate-700 tabular-nums shrink-0">
                    {act.durationMinutes} min
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SECTION 4: EXTRA MILES */}
      {section === 'extra-miles' && (
        <div className="space-y-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-slate-900">
              Extra Miles &amp; Effort Celebrations
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Honoring curiosity, steady resets, and trying new strategies—without punitive streaks
              or comparisons.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {activeStudent.achievements.map((ach) => (
              <div
                key={ach.id}
                className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span className="font-semibold text-amber-700">{ach.world}</span>
                    <span className="font-mono tabular-nums">{ach.earnedDate}</span>
                  </div>
                  <h2 className="font-display text-lg font-semibold text-slate-900">
                    {ach.title}
                  </h2>
                  <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">
                    {ach.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="font-display text-lg font-semibold text-slate-900 mb-3">
              Optional Home Activities Together
            </h2>
            <ul className="space-y-2.5 text-sm text-slate-700 list-disc pl-5">
              {activeStudent.supportPlan.homeActivities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* SECTION 5: AI & COUNSELOR HUB */}
      {section === 'hub' && (
        <ParentCounselorHub
          student={activeStudent}
          activities={studentActivities}
          observations={studentObservations}
        />
      )}

      {/* SECTION 6: SETTINGS */}
      {section === 'settings' && (
        <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 space-y-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#0B1D3A]">
              Parent Workspace Settings
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Account: <span className="font-mono">parent@3da.org</span>
            </p>
          </div>

          <div>
            <label
              htmlFor="parent-switch-student"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Active Child Profile
            </label>
            <select
              id="parent-switch-student"
              value={activeStudentId}
              onChange={(e) => setActiveStudentId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900"
            >
              {state.students.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.id} · {st.name} ({st.className} · {st.supportProfile})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Weekly Progress Summary
              </p>
              <p className="text-xs text-slate-500">
                Receives plain-language highlights instead of numeric test alerts.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={weeklyDigestOptIn}
              onClick={() => setWeeklyDigestOptIn((v) => !v)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold cursor-pointer ${
                weeklyDigestOptIn
                  ? 'bg-teal-600 text-white'
                  : 'border border-slate-300 bg-white text-slate-700'
              }`}
            >
              {weeklyDigestOptIn ? 'Enabled' : 'Paused'}
            </button>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <div>
              <p className="text-sm font-semibold text-slate-900">Manage Data</p>
              <p className="text-xs text-slate-500">
                Clear session check results and restore default workspace activities and support plans.
              </p>
            </div>
            <button
              type="button"
              onClick={resetDemoData}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Manage Data
            </button>
          </div>
        </div>
      )}

      {/* SECTION 7: LET'S CHECK */}
      {section === 'check' && <CheckHub />}
    </PortalShell>
  );
};
