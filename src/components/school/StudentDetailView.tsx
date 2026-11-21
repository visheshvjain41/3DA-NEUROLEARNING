import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Download,
  Loader2,
  Printer,
  RefreshCw,
  Save,
  Sparkles,
} from 'lucide-react';
import { useAppData } from '../../context/AppDataContext';
import type { StudentRecord, SupportPlan } from '../../types/neuro';
import { buildStructuredDemoSupportPlan } from '../../utils/demoAiFallbacks';

interface StudentDetailViewProps {
  student: StudentRecord;
  initialTab?: DetailTab;
  onBack: () => void;
}

export type DetailTab = 'overview' | 'activity' | 'timeline' | 'feedback' | 'support-plan';

export const StudentDetailView: React.FC<StudentDetailViewProps> = ({
  student,
  initialTab = 'overview',
  onBack,
}) => {
  const {
    state,
    geminiConfigured,
    addTeacherObservation,
    updateSupportPlan,
  } = useAppData();

  const [activeTab, setActiveTab] = useState<DetailTab>(initialTab);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, student.id]);

  const studentActivities = state.activities.filter((a) => a.studentId === student.id);
  const studentTimeline = state.timeline.filter((t) => t.studentId === student.id);
  const studentObservations = state.observations.filter((o) => o.studentId === student.id);

  // Add observation state
  const [obsAuthor, setObsAuthor] = useState(student.teacher);
  const [obsRole, setObsRole] = useState<'Teacher' | 'Counsellor'>('Teacher');
  const [obsSetting, setObsSetting] = useState<'Classroom' | 'Small Group' | '1-on-1 Check-in'>(
    'Classroom'
  );
  const [obsNote, setObsNote] = useState('');
  const [obsSavedBanner, setObsSavedBanner] = useState(false);

  // Editable support plan state
  const [draftPlan, setDraftPlan] = useState<SupportPlan>(student.supportPlan);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [planError, setPlanError] = useState('');
  const [planSavedNotice, setPlanSavedNotice] = useState('');

  useEffect(() => {
    setDraftPlan(student.supportPlan);
    setObsAuthor(student.teacher);
    setPlanError('');
    setPlanSavedNotice('');
  }, [student]);

  const handleAddObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!obsNote.trim()) return;
    addTeacherObservation({
      studentId: student.id,
      author: obsAuthor.trim() || student.teacher,
      role: obsRole,
      setting: obsSetting,
      note: obsNote.trim(),
    });
    setObsNote('');
    setObsSavedBanner(true);
    setTimeout(() => setObsSavedBanner(false), 2500);
  };

  const handleGeneratePlan = async () => {
    setPlanError('');
    setPlanSavedNotice('');

    if (!geminiConfigured) {
      const demoPlan = buildStructuredDemoSupportPlan(
        student,
        studentActivities,
        studentObservations
      );
      setDraftPlan(demoPlan);
      updateSupportPlan(student.id, demoPlan);
      setPlanSavedNotice('Generated & saved structured demo plan (Simulated Demo Mode).');
      return;
    }

    setIsGeneratingPlan(true);
    try {
      const recentSummary = studentActivities
        .slice(0, 5)
        .map(
          (a) =>
            `${a.date}: ${a.module} - ${a.activityTitle} (${a.durationMinutes}m, ${a.status})`
        )
        .join(' | ');
      const obsSummary = studentObservations
        .slice(0, 3)
        .map((o) => `${o.role} (${o.date}): ${o.note}`)
        .join(' | ');

      const res = await fetch('/api/ai/support-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: student.name,
          className: student.className,
          supportProfile: student.supportProfile,
          strengths: student.strengths,
          learningPreferences: student.learningPreferences,
          recentActivitiesSummary: recentSummary,
          observationsSummary: obsSummary,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPlanError(
          data?.message || 'Gemini could not generate the plan right now.'
        );
        return;
      }

      const generated: SupportPlan = {
        overview: data.plan.overview ?? '',
        strengths: data.plan.strengths ?? student.strengths,
        learningPreferences: data.plan.learningPreferences ?? student.learningPreferences,
        supportAreas: data.plan.supportAreas ?? [],
        monthlyGoals: data.plan.monthlyGoals ?? [],
        schoolAccommodations: data.plan.schoolAccommodations ?? [],
        homeActivities: data.plan.homeActivities ?? [],
        progressIndicators: data.plan.progressIndicators ?? [],
        educatorNotes: data.plan.educatorNotes ?? '',
        reviewStatus: 'AI suggestion — pending educator review',
        lastUpdated: new Date().toISOString().slice(0, 10),
        generatedSource: 'gemini',
      };
      setDraftPlan(generated);
      updateSupportPlan(student.id, generated);
      setPlanSavedNotice('Generated with Gemini AI and saved as pending educator review.');
    } catch (err: unknown) {
      setPlanError(
        err instanceof Error ? err.message : 'Network error generating support plan.'
      );
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  const handleUseDemoPlanFallback = () => {
    const demoPlan = buildStructuredDemoSupportPlan(
      student,
      studentActivities,
      studentObservations
    );
    setDraftPlan(demoPlan);
    updateSupportPlan(student.id, demoPlan);
    setPlanError('');
    setPlanSavedNotice('Generated & saved structured demo plan.');
  };

  const handleSavePlan = (markReviewed?: boolean) => {
    const updated: SupportPlan = {
      ...draftPlan,
      reviewStatus: markReviewed
        ? 'Reviewed by educator'
        : draftPlan.reviewStatus,
      lastUpdated: new Date().toISOString().slice(0, 10),
      generatedSource:
        draftPlan.generatedSource === 'seed' ? 'edited' : draftPlan.generatedSource,
    };
    setDraftPlan(updated);
    updateSupportPlan(student.id, updated);
    setPlanSavedNotice(
      markReviewed
        ? 'Support plan marked Reviewed by Educator & shared with Parent view.'
        : 'Support plan changes saved & visible in Parent portal.'
    );
  };

  const handleExportText = () => {
    const lines = [
      `3DA NeuroLearning — Monthly Educational Support Plan (Demo Data)`,
      `Student: ${student.name} (${student.id}) · ${student.className}`,
      `Support Focus: ${student.supportProfile}`,
      `Review Status: ${draftPlan.reviewStatus} · Updated: ${draftPlan.lastUpdated}`,
      `Disclaimer: Educational support suggestions only; not clinical diagnosis or treatment.`,
      ``,
      `OVERVIEW`,
      draftPlan.overview,
      ``,
      `STRENGTHS`,
      ...draftPlan.strengths.map((s) => `- ${s}`),
      ``,
      `LEARNING PREFERENCES`,
      ...draftPlan.learningPreferences.map((s) => `- ${s}`),
      ``,
      `AREAS WHERE SUPPORT MAY HELP`,
      ...draftPlan.supportAreas.map((s) => `- ${s}`),
      ``,
      `MONTHLY GOALS`,
      ...draftPlan.monthlyGoals.map((s, i) => `${i + 1}. ${s}`),
      ``,
      `SUGGESTED SCHOOL ACCOMMODATIONS`,
      ...draftPlan.schoolAccommodations.map((s) => `- ${s}`),
      ``,
      `SUGGESTED HOME ACTIVITIES`,
      ...draftPlan.homeActivities.map((s) => `- ${s}`),
      ``,
      `PROGRESS INDICATORS`,
      ...draftPlan.progressIndicators.map((s) => `- ${s}`),
      ``,
      `EDUCATOR / COUNSELLOR REVIEW NOTES`,
      draftPlan.educatorNotes,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${student.id}_${student.name.replace(/\s+/g, '_')}_Support_Plan.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const updateListField = (
    field:
      | 'strengths'
      | 'learningPreferences'
      | 'supportAreas'
      | 'monthlyGoals'
      | 'schoolAccommodations'
      | 'homeActivities'
      | 'progressIndicators',
    value: string
  ) => {
    setDraftPlan((prev) => ({
      ...prev,
      [field]: value
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
    }));
  };

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to School Overview
        </button>

        <span className="text-xs text-slate-500">
          Fictional demo student record · Educational support only
        </span>
      </div>

      {/* Student Header Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mb-1.5">
              <span className="font-mono font-semibold text-slate-700">{student.id}</span>
              <span aria-hidden="true">·</span>
              <span>{student.className}</span>
              <span aria-hidden="true">·</span>
              <span>{student.supportProfile}</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-slate-900">{student.name}</h1>
            <p className="mt-1 text-sm text-slate-600">
              Teacher: <span className="font-medium text-slate-800">{student.teacher}</span>
              <span className="mx-2 text-slate-300" aria-hidden="true">|</span>
              Counsellor: <span className="font-medium text-slate-800">{student.counsellor}</span>
              <span className="mx-2 text-slate-300" aria-hidden="true">|</span>
              Parent Link: <span className="font-medium text-slate-800">{student.parentAccountName}</span>
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-[#FAF9F6] px-4 py-3 text-xs shrink-0">
            {student.followUpSuggested ? (
              <div className="text-amber-800">
                <p className="font-semibold">Gentle check-in suggested</p>
                <p className="mt-0.5 text-slate-600 max-w-xs">
                  {student.followUpReason ?? 'Based on recent demo inactivity.'}
                </p>
              </div>
            ) : (
              <div className="text-teal-800">
                <p className="font-semibold">Active engagement rhythm</p>
                <p className="mt-0.5 text-slate-600 tabular-nums">
                  {studentActivities.length} logged sessions in last 30 days
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div
          role="tablist"
          aria-label="Student detail sections"
          className="no-print mt-6 flex flex-wrap gap-1 border-t border-slate-100 pt-4"
        >
          {(
            [
              { id: 'overview', label: 'Overview' },
              { id: 'activity', label: `Activity (${studentActivities.length})` },
              { id: 'timeline', label: `Timeline (${studentTimeline.length})` },
              { id: 'feedback', label: 'Feedback & Observations' },
              { id: 'support-plan', label: 'Support Plan' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900">
                Observed Strengths
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-700 list-disc pl-5">
                {student.strengths.map((str) => (
                  <li key={str}>{str}</li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h2 className="font-display text-lg font-semibold text-slate-900">
                Preferred Learning Tools &amp; Scaffolds
              </h2>
              <ul className="mt-3 space-y-2 text-sm text-slate-700 list-disc pl-5">
                {student.learningPreferences.map((pref) => (
                  <li key={pref}>{pref}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-slate-900">
                Support Plan Snapshot
              </h2>
              <button
                type="button"
                onClick={() => setActiveTab('support-plan')}
                className="text-xs font-semibold text-indigo-700 hover:underline cursor-pointer"
              >
                Open Full Support Plan
              </button>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              {student.supportPlan.overview}
            </p>
            <div className="pt-3 border-t border-slate-100 text-xs text-slate-500">
              Status:{' '}
              <span className="font-semibold text-slate-800">
                {student.supportPlan.reviewStatus}
              </span>
              <span className="mx-2" aria-hidden="true">·</span>
              Updated {student.supportPlan.lastUpdated}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVITY */}
      {activeTab === 'activity' && (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-slate-900">
              30-Day Activity History
            </h2>
            <span className="text-xs text-slate-500 tabular-nums">
              {studentActivities.length} sessions recorded
            </span>
          </div>
          {studentActivities.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No activities logged for this demo student yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#FAF9F6] text-xs font-semibold text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3">Date &amp; Time</th>
                    <th className="px-5 py-3">Learning World</th>
                    <th className="px-5 py-3">Activity</th>
                    <th className="px-5 py-3 text-right">Duration</th>
                    <th className="px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentActivities.map((act) => (
                    <tr key={act.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-3 font-mono text-xs text-slate-600 tabular-nums whitespace-nowrap">
                        {act.date} · {act.time}
                      </td>
                      <td className="px-5 py-3 font-medium text-slate-800 whitespace-nowrap">
                        {act.module}
                      </td>
                      <td className="px-5 py-3 text-slate-700">
                        <p>{act.activityTitle}</p>
                        {act.studentFeedback && (
                          <p className="mt-0.5 text-xs text-slate-500">
                            Note: “{act.studentFeedback}”
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right font-mono text-xs text-slate-700 tabular-nums whitespace-nowrap">
                        {act.durationMinutes} min
                      </td>
                      <td className="px-5 py-3 text-xs font-medium text-slate-700 whitespace-nowrap">
                        {act.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TIMELINE */}
      {activeTab === 'timeline' && (
        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="font-display text-lg font-semibold text-slate-900 mb-5">
            Connected Timeline
          </h2>
          {studentTimeline.length === 0 ? (
            <p className="text-sm text-slate-500">No timeline entries yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {studentTimeline.map((item) => (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <p className="text-xs text-slate-500">
                      <span className="capitalize font-medium text-slate-700">{item.type.replace('-', ' ')}</span>
                      <span className="mx-1.5" aria-hidden="true">·</span>
                      <span>{item.actor}</span>
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.description}</p>
                  </div>
                  <span className="font-mono text-xs text-slate-500 tabular-nums shrink-0">
                    {item.date} {item.time}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: FEEDBACK & OBSERVATIONS */}
      {activeTab === 'feedback' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="font-display text-lg font-semibold text-slate-900 mb-4">
                Teacher &amp; Counsellor Observations
              </h2>
              <div className="divide-y divide-slate-100">
                {studentObservations.map((obs) => (
                  <div key={obs.id} className="py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-semibold text-slate-800">
                        {obs.author} ({obs.role}) · {obs.setting}
                      </span>
                      <span className="font-mono tabular-nums">{obs.date}</span>
                    </div>
                    <p className="mt-1.5 text-sm text-slate-700 leading-relaxed">{obs.note}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6">
              <h2 className="font-display text-lg font-semibold text-slate-900 mb-4">
                Student Reflections
              </h2>
              <div className="divide-y divide-slate-100">
                {studentActivities
                  .filter((a) => Boolean(a.studentFeedback))
                  .map((a) => (
                    <div key={a.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>
                          {a.module} · {a.feelingTag ?? 'Reflection'}
                        </span>
                        <span className="font-mono tabular-nums">{a.date}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-800">“{a.studentFeedback}”</p>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <form
              onSubmit={handleAddObservation}
              className="rounded-xl border border-slate-200 bg-white p-6 space-y-4"
            >
              <h3 className="font-display text-base font-semibold text-slate-900">
                Log New Educator Observation
              </h3>
              {obsSavedBanner && (
                <div className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2 text-xs text-teal-800">
                  Observation saved to student timeline and parent summary.
                </div>
              )}
              <div>
                <label htmlFor="obs-author" className="block text-xs font-semibold text-slate-700 mb-1">
                  Educator Name
                </label>
                <input
                  id="obs-author"
                  type="text"
                  value={obsAuthor}
                  onChange={(e) => setObsAuthor(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="obs-role" className="block text-xs font-semibold text-slate-700 mb-1">
                    Role
                  </label>
                  <select
                    id="obs-role"
                    value={obsRole}
                    onChange={(e) => setObsRole(e.target.value as 'Teacher' | 'Counsellor')}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="Teacher">Teacher</option>
                    <option value="Counsellor">Counsellor</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="obs-setting" className="block text-xs font-semibold text-slate-700 mb-1">
                    Setting
                  </label>
                  <select
                    id="obs-setting"
                    value={obsSetting}
                    onChange={(e) =>
                      setObsSetting(
                        e.target.value as 'Classroom' | 'Small Group' | '1-on-1 Check-in'
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  >
                    <option value="Classroom">Classroom</option>
                    <option value="Small Group">Small Group</option>
                    <option value="1-on-1 Check-in">1-on-1 Check-in</option>
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="obs-note" className="block text-xs font-semibold text-slate-700 mb-1">
                  Observation Note (Non-diagnostic)
                </label>
                <textarea
                  id="obs-note"
                  rows={3}
                  value={obsNote}
                  onChange={(e) => setObsNote(e.target.value)}
                  placeholder="Describe what learning tool or pace worked well today..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 cursor-pointer"
              >
                Save Observation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 5: SUPPORT PLAN GENERATOR & EDITOR */}
      {activeTab === 'support-plan' && (
        <div className="space-y-6">
          <div className="no-print rounded-xl border border-slate-200 bg-white p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-lg font-semibold text-slate-900">
                Monthly Educational Support Plan
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                Status:{' '}
                <span className="font-semibold text-indigo-700">{draftPlan.reviewStatus}</span>
                <span className="mx-2" aria-hidden="true">·</span>
                <span>Last updated {draftPlan.lastUpdated}</span>
                <span className="mx-2" aria-hidden="true">·</span>
                <span>Educational suggestions only (not clinical diagnosis)</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                disabled={isGeneratingPlan}
                onClick={handleGeneratePlan}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 cursor-pointer whitespace-nowrap"
              >
                {isGeneratingPlan ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                )}
                {geminiConfigured
                  ? 'Generate / Regenerate with Gemini'
                  : 'Generate Demo Support Plan'}
              </button>
              <button
                type="button"
                onClick={() => handleSavePlan(false)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer whitespace-nowrap"
              >
                <Save className="h-3.5 w-3.5" aria-hidden="true" />
                Save Edits
              </button>
              <button
                type="button"
                onClick={() => handleSavePlan(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-teal-300 bg-teal-50 px-3.5 py-2 text-xs font-semibold text-teal-800 hover:bg-teal-100 cursor-pointer whitespace-nowrap"
              >
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                Mark Reviewed
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-[#FAF9F6] px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer whitespace-nowrap"
              >
                <Printer className="h-3.5 w-3.5" aria-hidden="true" />
                Print
              </button>
              <button
                type="button"
                onClick={handleExportText}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-[#FAF9F6] px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer whitespace-nowrap"
              >
                <Download className="h-3.5 w-3.5" aria-hidden="true" />
                Export
              </button>
            </div>
          </div>

          {planError && (
            <div
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-start gap-2.5 text-sm text-rose-800">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
                <div>
                  <p className="font-semibold">Gemini request issue</p>
                  <p className="text-xs mt-0.5">{planError}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleUseDemoPlanFallback}
                className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-100 cursor-pointer shrink-0"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                Use Offline Demo Generator
              </button>
            </div>
          )}

          {planSavedNotice && (
            <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-xs font-medium text-teal-900">
              {planSavedNotice}
            </div>
          )}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-6">
            <div>
              <label htmlFor="sp-overview" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Student Overview
              </label>
              <textarea
                id="sp-overview"
                rows={3}
                value={draftPlan.overview}
                onChange={(e) => setDraftPlan({ ...draftPlan, overview: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-800 leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="sp-strengths" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Strengths (one per line)
                </label>
                <textarea
                  id="sp-strengths"
                  rows={4}
                  value={draftPlan.strengths.join('\n')}
                  onChange={(e) => updateListField('strengths', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-800"
                />
              </div>
              <div>
                <label htmlFor="sp-prefs" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Learning Preferences (one per line)
                </label>
                <textarea
                  id="sp-prefs"
                  rows={4}
                  value={draftPlan.learningPreferences.join('\n')}
                  onChange={(e) => updateListField('learningPreferences', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-800"
                />
              </div>
              <div>
                <label htmlFor="sp-areas" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Areas Where Support May Help (one per line)
                </label>
                <textarea
                  id="sp-areas"
                  rows={4}
                  value={draftPlan.supportAreas.join('\n')}
                  onChange={(e) => updateListField('supportAreas', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-800"
                />
              </div>
              <div>
                <label htmlFor="sp-goals" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  2–3 Achievable Monthly Goals (one per line)
                </label>
                <textarea
                  id="sp-goals"
                  rows={4}
                  value={draftPlan.monthlyGoals.join('\n')}
                  onChange={(e) => updateListField('monthlyGoals', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-800"
                />
              </div>
              <div>
                <label htmlFor="sp-school" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Suggested School Activities &amp; Accommodations
                </label>
                <textarea
                  id="sp-school"
                  rows={4}
                  value={draftPlan.schoolAccommodations.join('\n')}
                  onChange={(e) => updateListField('schoolAccommodations', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-800"
                />
              </div>
              <div>
                <label htmlFor="sp-home" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Suggested Home Activities
                </label>
                <textarea
                  id="sp-home"
                  rows={4}
                  value={draftPlan.homeActivities.join('\n')}
                  onChange={(e) => updateListField('homeActivities', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="sp-indicators" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Progress Indicators
                </label>
                <textarea
                  id="sp-indicators"
                  rows={3}
                  value={draftPlan.progressIndicators.join('\n')}
                  onChange={(e) => updateListField('progressIndicators', e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-800"
                />
              </div>
              <div>
                <label htmlFor="sp-notes" className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Teacher / Counsellor Review Notes
                </label>
                <textarea
                  id="sp-notes"
                  rows={3}
                  value={draftPlan.educatorNotes}
                  onChange={(e) => setDraftPlan({ ...draftPlan, educatorNotes: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-800"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
