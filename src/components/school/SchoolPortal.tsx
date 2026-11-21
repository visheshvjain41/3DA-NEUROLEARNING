import React, { useMemo, useState } from 'react';
import {
  Activity,
  ArrowRight,
  ClipboardCheck,
  Clock,
  LayoutDashboard,
  MessageSquare,
  RotateCcw,
  Search,
  Settings,
  Users,
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import type { SupportProfileType } from '../../types/neuro';
import { PortalShell, type NavItem } from '../PortalShell';
import { SchoolDashboardCharts } from './SchoolDashboardCharts';
import { StudentDetailView, type DetailTab } from './StudentDetailView';

type SchoolSection =
  | 'dashboard'
  | 'students'
  | 'timeline'
  | 'feedback'
  | 'support-plans'
  | 'settings';

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4 shrink-0" /> },
  { id: 'students', label: 'Students', icon: <Users className="h-4 w-4 shrink-0" /> },
  { id: 'timeline', label: 'Timeline', icon: <Clock className="h-4 w-4 shrink-0" /> },
  { id: 'feedback', label: 'Feedback', icon: <MessageSquare className="h-4 w-4 shrink-0" /> },
  { id: 'support-plans', label: 'Support Plans', icon: <ClipboardCheck className="h-4 w-4 shrink-0" /> },
  { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4 shrink-0" /> },
];

export const SchoolPortal: React.FC = () => {
  const { state, resetDemoData } = useAppData();
  const [section, setSection] = useState<SchoolSection>('dashboard');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [detailInitialTab, setDetailInitialTab] = useState<DetailTab>('overview');

  const [searchQuery, setSearchQuery] = useState('');
  const [profileFilter, setProfileFilter] = useState<'All' | SupportProfileType>('All');
  const [followUpOnly, setFollowUpOnly] = useState(false);

  const selectedStudent = selectedStudentId
    ? state.students.find((s) => s.id === selectedStudentId) ?? null
    : null;

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return state.students.filter((st) => {
      const matchesQuery =
        !q ||
        st.name.toLowerCase().includes(q) ||
        st.id.toLowerCase().includes(q) ||
        st.className.toLowerCase().includes(q) ||
        st.supportProfile.toLowerCase().includes(q);
      const matchesProfile = profileFilter === 'All' || st.supportProfile === profileFilter;
      const matchesFollowUp = !followUpOnly || st.followUpSuggested;
      return matchesQuery && matchesProfile && matchesFollowUp;
    });
  }, [state.students, searchQuery, profileFilter, followUpOnly]);

  const completedActivitiesCount = useMemo(
    () => state.activities.filter((a) => a.status === 'Completed').length,
    [state.activities]
  );

  const activeSupportPlansCount = state.schoolMeta.studentsWithSupportProfiles;

  const openStudent = (id: string, tab: DetailTab = 'overview') => {
    setSelectedStudentId(id);
    setDetailInitialTab(tab);
  };

  const handleNavSelect = (id: string) => {
    setSelectedStudentId(null);
    setSection(id as SchoolSection);
  };

  const getLatestActivityForStudent = (studentId: string) =>
    state.activities.find((a) => a.studentId === studentId);

  const breadcrumb = selectedStudent
    ? `${state.schoolMeta.schoolName} / ${selectedStudent.id} · ${selectedStudent.name}`
    : `${state.schoolMeta.schoolName} / ${NAV_ITEMS.find((n) => n.id === section)?.label ?? 'Dashboard'}`;

  return (
    <PortalShell
      roleLabel="School & Counsellor Portal"
      navItems={NAV_ITEMS}
      activeNavId={section}
      onSelectNav={handleNavSelect}
      breadcrumb={breadcrumb}
    >
      {selectedStudent ? (
        <StudentDetailView
          student={selectedStudent}
          initialTab={detailInitialTab}
          onBack={() => setSelectedStudentId(null)}
        />
      ) : (
        <>
          {/* SECTION: DASHBOARD */}
          {section === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-indigo-700">
                    {state.schoolMeta.schoolName} · Illustrative Demo Data
                  </p>
                  <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900">
                    School Inclusion Overview
                  </h1>
                </div>
                <p className="text-xs text-slate-500">
                  {state.schoolMeta.simulatedTeachers} simulated teachers ·{' '}
                  {state.schoolMeta.simulatedCounsellors} simulated counsellors
                </p>
              </div>

              {/* 4 KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="text-xs font-medium text-slate-500">Total Demo Students</p>
                  <p className="mt-2 font-mono text-3xl font-semibold text-slate-900 tabular-nums">
                    {state.schoolMeta.totalSimulatedStudents}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    12 detailed interactive profiles
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="text-xs font-medium text-slate-500">With Support Profiles</p>
                  <p className="mt-2 font-mono text-3xl font-semibold text-indigo-700 tabular-nums">
                    {state.schoolMeta.studentsWithSupportProfiles}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Simulated school-wide cohort
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="text-xs font-medium text-slate-500">Active Demo Support Plans</p>
                  <p className="mt-2 font-mono text-3xl font-semibold text-teal-700 tabular-nums">
                    {activeSupportPlansCount}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {state.students.filter((s) => s.supportPlan.reviewStatus === 'AI suggestion — pending educator review').length} interactive pending review
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="text-xs font-medium text-slate-500">Activities Completed</p>
                  <p className="mt-2 font-mono text-3xl font-semibold text-amber-700 tabular-nums">
                    {completedActivitiesCount}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Live across 12 interactive records
                  </p>
                </div>
              </div>

              {/* Charts */}
              <SchoolDashboardCharts
                students={state.students}
                activities={state.activities}
              />

              {/* Student Table */}
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <h2 className="font-display text-lg font-semibold text-slate-900">
                      Interactive Demo Student Directory
                    </h2>
                    <p className="text-xs text-slate-500">
                      Follow-up cues reflect demo inactivity or observations—never clinical diagnosis.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="relative">
                      <Search
                        className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"
                        aria-hidden="true"
                      />
                      <input
                        type="search"
                        aria-label="Search students"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search name, ID, class..."
                        className="rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                      />
                    </div>
                    <select
                      aria-label="Filter by support profile"
                      value={profileFilter}
                      onChange={(e) =>
                        setProfileFilter(e.target.value as 'All' | SupportProfileType)
                      }
                      className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800"
                    >
                      <option value="All">All Profiles</option>
                      <option value="Dyslexia">Dyslexia</option>
                      <option value="Dyscalculia">Dyscalculia</option>
                      <option value="Dysgraphia">Dysgraphia</option>
                      <option value="ADHD">ADHD</option>
                      <option value="Dyslexia + ADHD">Dyslexia + ADHD</option>
                      <option value="Dyslexia + Dysgraphia">Dyslexia + Dysgraphia</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => setFollowUpOnly((v) => !v)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                        followUpOnly
                          ? 'border-amber-300 bg-amber-50 text-amber-800'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {followUpOnly ? 'Showing Follow-Up Suggested' : 'Filter: Follow-Up Suggested'}
                    </button>
                  </div>
                </div>

                {filteredStudents.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-sm text-slate-600">No demo students match your filters.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setProfileFilter('All');
                        setFollowUpOnly(false);
                      }}
                      className="mt-3 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-[#FAF9F6] text-xs font-semibold text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="px-5 py-3">Student</th>
                          <th className="px-5 py-3">Class</th>
                          <th className="px-5 py-3">Support Focus</th>
                          <th className="px-5 py-3">Recent Activity</th>
                          <th className="px-5 py-3">Check-In Cue</th>
                          <th className="px-5 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredStudents.map((st) => {
                          const latest = getLatestActivityForStudent(st.id);
                          return (
                            <tr key={st.id} className="hover:bg-slate-50/70">
                              <td className="px-5 py-3.5">
                                <p className="font-semibold text-slate-900">{st.name}</p>
                                <p className="font-mono text-xs text-slate-500">{st.id}</p>
                              </td>
                              <td className="px-5 py-3.5 text-slate-700 whitespace-nowrap">
                                {st.className}
                              </td>
                              <td className="px-5 py-3.5 text-slate-800 font-medium whitespace-nowrap">
                                {st.supportProfile}
                              </td>
                              <td className="px-5 py-3.5 text-xs text-slate-600">
                                {latest ? (
                                  <>
                                    <span className="font-medium text-slate-800">
                                      {latest.module}
                                    </span>
                                    <span className="mx-1.5" aria-hidden="true">·</span>
                                    <span className="font-mono tabular-nums">{latest.date}</span>
                                  </>
                                ) : (
                                  'No activity yet'
                                )}
                              </td>
                              <td className="px-5 py-3.5 text-xs whitespace-nowrap">
                                {st.followUpSuggested ? (
                                  <span className="font-semibold text-amber-700">
                                    Follow-up suggested
                                  </span>
                                ) : (
                                  <span className="font-medium text-teal-700">
                                    Steady rhythm
                                  </span>
                                )}
                              </td>
                              <td className="px-5 py-3.5 text-right whitespace-nowrap">
                                <button
                                  type="button"
                                  onClick={() => openStudent(st.id, 'overview')}
                                  className="inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 cursor-pointer"
                                >
                                  Open Profile
                                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION: STUDENTS */}
          {section === 'students' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="font-display text-2xl font-bold text-slate-900">
                    All Interactive Demo Students ({filteredStudents.length})
                  </h1>
                  <p className="text-sm text-slate-600">
                    12 fictional student records linked across School, Parent, and Student views.
                  </p>
                </div>
                <input
                  type="search"
                  aria-label="Filter student cards"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, ID, or profile..."
                  className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredStudents.map((st) => (
                  <div
                    key={st.id}
                    className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                        <span className="font-mono font-semibold text-slate-700">{st.id}</span>
                        <span>{st.className}</span>
                      </div>
                      <h2 className="font-display text-lg font-semibold text-slate-900">
                        {st.name}
                      </h2>
                      <p className="mt-1 text-xs font-medium text-indigo-700">
                        {st.supportProfile}
                      </p>
                      <p className="mt-3 text-xs text-slate-600">
                        Strengths: {st.strengths.slice(0, 2).join(', ')}
                      </p>
                      {st.followUpSuggested && (
                        <p className="mt-2 text-xs font-medium text-amber-700">
                          Gentle check-in suggested
                        </p>
                      )}
                    </div>
                    <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => openStudent(st.id, 'support-plan')}
                        className="text-xs font-semibold text-slate-600 hover:text-indigo-700 cursor-pointer"
                      >
                        Support Plan
                      </button>
                      <button
                        type="button"
                        onClick={() => openStudent(st.id, 'overview')}
                        className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700 cursor-pointer"
                      >
                        Open Profile
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: TIMELINE */}
          {section === 'timeline' && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="font-display text-2xl font-bold text-slate-900">
                    School-Wide Activity &amp; Observation Timeline
                  </h1>
                  <p className="text-sm text-slate-600">
                    Live feed of student sessions, milestones, observations, and support plan saves.
                  </p>
                </div>
                <Activity className="h-5 w-5 text-indigo-600" aria-hidden="true" />
              </div>

              <div className="divide-y divide-slate-100">
                {state.timeline.slice(0, 25).map((ev) => (
                  <div
                    key={ev.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <p className="text-xs text-slate-500">
                        <span className="font-semibold text-slate-800">{ev.actor}</span>
                        <span className="mx-1.5" aria-hidden="true">·</span>
                        <span className="font-mono">{ev.studentId}</span>
                        <span className="mx-1.5" aria-hidden="true">·</span>
                        <span className="capitalize">{ev.type.replace('-', ' ')}</span>
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-slate-900">{ev.title}</p>
                      <p className="mt-0.5 text-xs text-slate-600">{ev.description}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono text-xs text-slate-500 tabular-nums">
                        {ev.date} {ev.time}
                      </span>
                      <button
                        type="button"
                        onClick={() => openStudent(ev.studentId, 'timeline')}
                        className="text-xs font-semibold text-indigo-700 hover:underline cursor-pointer"
                      >
                        View Student
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: FEEDBACK */}
          {section === 'feedback' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h1 className="font-display text-xl font-bold text-slate-900 mb-4">
                  Recent Student Reflections
                </h1>
                <div className="divide-y divide-slate-100">
                  {state.activities
                    .filter((a) => Boolean(a.studentFeedback))
                    .slice(0, 10)
                    .map((act) => {
                      const st = state.students.find((s) => s.id === act.studentId);
                      return (
                        <div key={act.id} className="py-3.5 first:pt-0">
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <button
                              type="button"
                              onClick={() => openStudent(act.studentId, 'feedback')}
                              className="font-semibold text-indigo-700 hover:underline cursor-pointer"
                            >
                              {st?.name ?? act.studentId} · {act.module}
                            </button>
                            <span className="font-mono tabular-nums">{act.date}</span>
                          </div>
                          <p className="mt-1 text-sm text-slate-800">“{act.studentFeedback}”</p>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-6">
                <h2 className="font-display text-xl font-bold text-slate-900 mb-4">
                  Teacher &amp; Counsellor Observations
                </h2>
                <div className="divide-y divide-slate-100">
                  {state.observations.slice(0, 10).map((obs) => {
                    const st = state.students.find((s) => s.id === obs.studentId);
                    return (
                      <div key={obs.id} className="py-3.5 first:pt-0">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <button
                            type="button"
                            onClick={() => openStudent(obs.studentId, 'feedback')}
                            className="font-semibold text-slate-900 hover:text-indigo-700 cursor-pointer"
                          >
                            {st?.name ?? obs.studentId} — {obs.author} ({obs.role})
                          </button>
                          <span className="font-mono tabular-nums">{obs.date}</span>
                        </div>
                        <p className="mt-1 text-sm text-slate-700">{obs.note}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* SECTION: SUPPORT PLANS */}
          {section === 'support-plans' && (
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h1 className="font-display text-2xl font-bold text-slate-900">
                  Monthly Support Plans Directory
                </h1>
                <p className="text-sm text-slate-600 mt-1">
                  Open any student plan to generate with AI, edit goals, mark reviewed, or print.
                </p>
              </div>
              <div className="divide-y divide-slate-100">
                {state.students.map((st) => (
                  <div
                    key={st.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70"
                  >
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono font-semibold text-slate-700">{st.id}</span>
                        <span aria-hidden="true">·</span>
                        <span>{st.className}</span>
                        <span aria-hidden="true">·</span>
                        <span>{st.supportProfile}</span>
                      </div>
                      <p className="mt-1 font-semibold text-slate-900">{st.name}</p>
                      <p className="mt-0.5 text-xs text-slate-600 line-clamp-1">
                        {st.supportPlan.overview}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <span
                        className={`text-xs font-semibold ${
                          st.supportPlan.reviewStatus === 'Reviewed by educator'
                            ? 'text-teal-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {st.supportPlan.reviewStatus}
                      </span>
                      <button
                        type="button"
                        onClick={() => openStudent(st.id, 'support-plan')}
                        className="rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white hover:bg-indigo-700 cursor-pointer whitespace-nowrap"
                      >
                        Open Plan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SECTION: SETTINGS */}
          {section === 'settings' && (
            <div className="max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 space-y-6">
              <div>
                <h1 className="font-display text-2xl font-bold text-slate-900">
                  Demo School Settings
                </h1>
                <p className="mt-1 text-sm text-slate-600">
                  {state.schoolMeta.schoolName} — Fictional hackathon demonstration campus.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-xl border border-slate-200 bg-[#FAF9F6] p-4">
                  <p className="text-xs text-slate-500">Simulated Students</p>
                  <p className="mt-1 font-mono text-xl font-semibold text-slate-900 tabular-nums">
                    {state.schoolMeta.totalSimulatedStudents}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-[#FAF9F6] p-4">
                  <p className="text-xs text-slate-500">Educator Roster</p>
                  <p className="mt-1 font-mono text-xl font-semibold text-slate-900 tabular-nums">
                    {state.schoolMeta.simulatedTeachers} Teachers · {state.schoolMeta.simulatedCounsellors} Counsellors
                  </p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Reset Demo Data</p>
                  <p className="text-xs text-slate-500">
                    Restore all 12 students, activities, observations, and support plans to their initial seed state.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetDemoData}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer shrink-0"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  Reset Demo Data
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </PortalShell>
  );
};
