import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createInitialDemoState } from '../data/seedData';
import type {
  ActivityStatus,
  AppDemoState,
  CheckStatus,
  CheckType,
  DailyActivity,
  FocusCheckResult,
  FocusQuestionnaireResult,
  LearningModule,
  NumberCheckResult,
  NumberTaskMetrics,
  ReadingCheckResult,
  ReadingGameMetrics,
  SavedWritingArtifact,
  StarMoonGameResult,
  StudentAccessibilityPrefs,
  StudentRecord,
  SupportPlan,
  TeacherObservation,
  UserRole,
  WritingCheckResult,
} from '../types/neuro';

const STORAGE_KEY = 'neurolearning_3da_workspace_v1';

export type AppRoute = 'landing' | 'login' | 'portal' | 'check';

const DEFAULT_CHECK_MAP: Record<CheckType, CheckStatus> = {
  reading: 'Not started',
  number: 'Not started',
  writing: 'Not started',
  focus: 'Not started',
};

interface AppDataContextValue {
  state: AppDemoState;
  route: AppRoute;
  setRoute: (route: AppRoute) => void;
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  activeStudentId: string;
  setActiveStudentId: (id: string) => void;
  activeStudent: StudentRecord;
  geminiConfigured: boolean;
  accessibilityPrefs: StudentAccessibilityPrefs;
  setAccessibilityPrefs: React.Dispatch<React.SetStateAction<StudentAccessibilityPrefs>>;
  logStudentActivity: (params: {
    studentId: string;
    module: LearningModule;
    activityTitle: string;
    durationMinutes: number;
    status?: ActivityStatus;
    studentFeedback?: string;
    feelingTag?: DailyActivity['feelingTag'];
    achievementTitle?: string;
    achievementDescription?: string;
  }) => void;
  submitStudentFeedback: (studentId: string, activityId: string, feedback: string, feelingTag?: DailyActivity['feelingTag']) => void;
  addTeacherObservation: (params: {
    studentId: string;
    author: string;
    role: 'Teacher' | 'Counsellor';
    setting: TeacherObservation['setting'];
    note: string;
  }) => void;
  updateSupportPlan: (studentId: string, plan: SupportPlan) => void;
  saveWritingArtifact: (studentId: string, artifact: Omit<SavedWritingArtifact, 'id' | 'studentId' | 'createdAt'>) => void;
  resetDemoData: () => void;
  checkProgress: Record<string, Record<CheckType, CheckStatus>>;
  getStudentChecks: (studentId: string) => Record<CheckType, CheckStatus>;
  updateCheckStatus: (studentId: string, checkType: CheckType, status: CheckStatus) => void;
  focusCheckResults: Record<string, FocusCheckResult>;
  numberCheckResults: Record<string, NumberCheckResult>;
  readingCheckResults: Record<string, ReadingCheckResult>;
  writingCheckResults: Record<string, WritingCheckResult>;
  saveFocusQuestionnaire: (studentId: string, result: FocusQuestionnaireResult) => void;
  saveStarMoonResult: (studentId: string, result: StarMoonGameResult) => void;
  saveNumberTaskResult: (studentId: string, task: NumberTaskMetrics) => void;
  saveReadingGameResult: (studentId: string, game: ReadingGameMetrics) => void;
  saveWritingCheckResult: (studentId: string, result: WritingCheckResult) => void;
  clearStudentCheckData: (studentId: string) => void;
  consentAccepted: boolean;
  setConsentAccepted: React.Dispatch<React.SetStateAction<boolean>>;
  soundEnabled: boolean;
  setSoundEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  requestedWorld: CheckType | null;
  setRequestedWorld: React.Dispatch<React.SetStateAction<CheckType | null>>;
  prefersReducedMotion: boolean;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

function loadPersistedState(): AppDemoState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppDemoState;
      if (parsed && Array.isArray(parsed.students) && parsed.students.length >= 12) {
        return parsed;
      }
    }
  } catch {
    // Ignore parse errors and return clean seed
  }
  return createInitialDemoState();
}

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppDemoState>(() => loadPersistedState());
  // Check results & status live in React state only and are cleared via Manage Data
  const [checkProgress, setCheckProgress] = useState<
    Record<string, Record<CheckType, CheckStatus>>
  >({});
  const [focusCheckResults, setFocusCheckResults] = useState<Record<string, FocusCheckResult>>({});
  const [numberCheckResults, setNumberCheckResults] = useState<Record<string, NumberCheckResult>>(
    {}
  );
  const [readingCheckResults, setReadingCheckResults] = useState<
    Record<string, ReadingCheckResult>
  >({});
  const [writingCheckResults, setWritingCheckResults] = useState<
    Record<string, WritingCheckResult>
  >({});

  const [route, setRoute] = useState<AppRoute>('landing');
  const [activeRole, setActiveRole] = useState<UserRole>('school');
  const [activeStudentId, setActiveStudentId] = useState<string>('ST001');
  const [geminiConfigured, setGeminiConfigured] = useState<boolean>(false);
  const [consentAccepted, setConsentAccepted] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);
  const [requestedWorld, setRequestedWorld] = useState<CheckType | null>(null);
  const [systemReducedMotion, setSystemReducedMotion] = useState<boolean>(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const [accessibilityPrefs, setAccessibilityPrefs] = useState<StudentAccessibilityPrefs>({
    readingFriendly: false,
    reducedMotion: false,
    paperTint: 'ivory',
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e: MediaQueryListEvent) => setSystemReducedMotion(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota issues
    }
  }, [state]);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && typeof data.geminiConfigured === 'boolean') {
          setGeminiConfigured(data.geminiConfigured);
        }
      })
      .catch(() => {
        setGeminiConfigured(false);
      });
  }, []);

  const activeStudent =
    state.students.find((s) => s.id === activeStudentId) ?? state.students[0];

  const logStudentActivity = useCallback(
    ({
      studentId,
      module,
      activityTitle,
      durationMinutes,
      status = 'Completed',
      studentFeedback,
      feelingTag,
      achievementTitle,
      achievementDescription,
    }: {
      studentId: string;
      module: LearningModule;
      activityTitle: string;
      durationMinutes: number;
      status?: ActivityStatus;
      studentFeedback?: string;
      feelingTag?: DailyActivity['feelingTag'];
      achievementTitle?: string;
      achievementDescription?: string;
    }) => {
      const now = new Date();
      const date = now.toISOString().slice(0, 10);
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const actId = `${studentId}-act-${Date.now()}`;

      setState((prev) => {
        const student = prev.students.find((s) => s.id === studentId);
        const studentName = student?.name ?? 'Student';

        const newActivity: DailyActivity = {
          id: actId,
          studentId,
          date,
          time,
          module,
          activityTitle,
          durationMinutes: Math.max(1, durationMinutes),
          status,
          studentFeedback,
          feelingTag,
        };

        const newTimelineEvent = {
          id: `${studentId}-tl-${Date.now()}`,
          studentId,
          date,
          time,
          type: 'activity' as const,
          title: `${status}: ${activityTitle}`,
          description: `${module} · ${Math.max(1, durationMinutes)} min${studentFeedback ? ` · Student note: "${studentFeedback}"` : ''}`,
          actor: studentName,
        };

        const updatedStudents = prev.students.map((s) => {
          if (s.id !== studentId) return s;
          const alreadyHasAchievement =
            achievementTitle && s.achievements.some((a) => a.title === achievementTitle);
          const nextAchievements =
            achievementTitle && !alreadyHasAchievement
              ? [
                  {
                    id: `${studentId}-ach-${Date.now()}`,
                    title: achievementTitle,
                    description:
                      achievementDescription ??
                      `Explored ${activityTitle} in ${module}.`,
                    world: module,
                    earnedDate: date,
                  },
                  ...s.achievements,
                ]
              : s.achievements;

          return {
            ...s,
            followUpSuggested: false,
            followUpReason: undefined,
            achievements: nextAchievements,
          };
        });

        const nextTimeline = [newTimelineEvent, ...prev.timeline];
        if (achievementTitle) {
          nextTimeline.unshift({
            id: `${studentId}-tl-ach-${Date.now() + 1}`,
            studentId,
            date,
            time,
            type: 'achievement' as const,
            title: `Effort Milestone: ${achievementTitle}`,
            description: achievementDescription ?? `Celebrated curiosity in ${module}.`,
            actor: studentName,
          });
        }

        return {
          ...prev,
          students: updatedStudents,
          activities: [newActivity, ...prev.activities],
          timeline: nextTimeline,
        };
      });
    },
    []
  );

  const submitStudentFeedback = useCallback(
    (
      studentId: string,
      activityId: string,
      feedback: string,
      feelingTag?: DailyActivity['feelingTag']
    ) => {
      const now = new Date();
      const date = now.toISOString().slice(0, 10);
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      setState((prev) => {
        const student = prev.students.find((s) => s.id === studentId);
        const target = prev.activities.find((a) => a.id === activityId);
        return {
          ...prev,
          activities: prev.activities.map((a) =>
            a.id === activityId ? { ...a, studentFeedback: feedback, feelingTag } : a
          ),
          timeline: [
            {
              id: `${studentId}-tl-fb-${Date.now()}`,
              studentId,
              date,
              time,
              type: 'activity' as const,
              title: `Student Reflection on ${target?.activityTitle ?? 'Activity'}`,
              description: `${feelingTag ? `[${feelingTag}] ` : ''}"${feedback}"`,
              actor: student?.name ?? 'Student',
            },
            ...prev.timeline,
          ],
        };
      });
    },
    []
  );

  const addTeacherObservation = useCallback(
    ({
      studentId,
      author,
      role,
      setting,
      note,
    }: {
      studentId: string;
      author: string;
      role: 'Teacher' | 'Counsellor';
      setting: TeacherObservation['setting'];
      note: string;
    }) => {
      const now = new Date();
      const date = now.toISOString().slice(0, 10);
      const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      setState((prev) => ({
        ...prev,
        observations: [
          {
            id: `${studentId}-obs-${Date.now()}`,
            studentId,
            date,
            author,
            role,
            setting,
            note,
          },
          ...prev.observations,
        ],
        timeline: [
          {
            id: `${studentId}-tl-obs-${Date.now()}`,
            studentId,
            date,
            time,
            type: 'observation',
            title: `${role} observation by ${author} (${setting})`,
            description: note,
            actor: author,
          },
          ...prev.timeline,
        ],
      }));
    },
    []
  );

  const updateSupportPlan = useCallback((studentId: string, plan: SupportPlan) => {
    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setState((prev) => ({
      ...prev,
      students: prev.students.map((s) =>
        s.id === studentId ? { ...s, supportPlan: plan } : s
      ),
      timeline: [
        {
          id: `${studentId}-tl-sp-${Date.now()}`,
          studentId,
          date,
          time,
          type: 'support-plan',
          title: `Monthly Support Plan saved (${plan.reviewStatus})`,
          description: plan.overview.slice(0, 140),
          actor: 'Educator / AI Planner',
        },
        ...prev.timeline,
      ],
    }));
  }, []);

  const saveWritingArtifact = useCallback(
    (
      studentId: string,
      artifact: Omit<SavedWritingArtifact, 'id' | 'studentId' | 'createdAt'>
    ) => {
      const date = new Date().toISOString().slice(0, 10);
      setState((prev) => ({
        ...prev,
        students: prev.students.map((s) =>
          s.id === studentId
            ? {
                ...s,
                savedArtifacts: [
                  {
                    ...artifact,
                    id: `${studentId}-art-${Date.now()}`,
                    studentId,
                    createdAt: date,
                  },
                  ...s.savedArtifacts,
                ],
              }
            : s
        ),
      }));
    },
    []
  );

  const getStudentChecks = useCallback(
    (studentId: string): Record<CheckType, CheckStatus> => {
      return {
        ...DEFAULT_CHECK_MAP,
        ...(checkProgress[studentId] ?? {}),
      };
    },
    [checkProgress]
  );

  const updateCheckStatus = useCallback(
    (studentId: string, checkType: CheckType, status: CheckStatus) => {
      setCheckProgress((prev) => ({
        ...prev,
        [studentId]: {
          ...DEFAULT_CHECK_MAP,
          ...(prev[studentId] ?? {}),
          [checkType]: status,
        },
      }));
    },
    []
  );

  const saveFocusQuestionnaire = useCallback(
    (studentId: string, result: FocusQuestionnaireResult) => {
      setFocusCheckResults((prev) => {
        const existing = prev[studentId] ?? {};
        const nextEntry: FocusCheckResult = {
          ...existing,
          questionnaire: result,
        };
        const status: CheckStatus = nextEntry.starMoonGame ? 'Done' : 'In progress';
        setCheckProgress((cp) => ({
          ...cp,
          [studentId]: {
            ...DEFAULT_CHECK_MAP,
            ...(cp[studentId] ?? {}),
            focus: status,
          },
        }));
        return {
          ...prev,
          [studentId]: nextEntry,
        };
      });
    },
    []
  );

  const saveStarMoonResult = useCallback((studentId: string, result: StarMoonGameResult) => {
    setFocusCheckResults((prev) => {
      const existing = prev[studentId] ?? {};
      const nextEntry: FocusCheckResult = {
        ...existing,
        starMoonGame: result,
      };
      setCheckProgress((cp) => ({
        ...cp,
        [studentId]: {
          ...DEFAULT_CHECK_MAP,
          ...(cp[studentId] ?? {}),
          focus: 'Done',
        },
      }));
      return {
        ...prev,
        [studentId]: nextEntry,
      };
    });
  }, []);

  const saveNumberTaskResult = useCallback((studentId: string, task: NumberTaskMetrics) => {
    setNumberCheckResults((prev) => {
      const existing = prev[studentId] ?? {};
      const nextEntry: NumberCheckResult = {
        ...existing,
        [task.taskId]: task,
      };
      const allThreeDone = Boolean(nextEntry.dots && nextEntry.numbers && nextEntry.sums);
      setCheckProgress((cp) => ({
        ...cp,
        [studentId]: {
          ...DEFAULT_CHECK_MAP,
          ...(cp[studentId] ?? {}),
          number: allThreeDone ? 'Done' : 'In progress',
        },
      }));
      return {
        ...prev,
        [studentId]: nextEntry,
      };
    });
  }, []);

  const saveReadingGameResult = useCallback((studentId: string, game: ReadingGameMetrics) => {
    setReadingCheckResults((prev) => {
      const existing = prev[studentId] ?? { language: game.language };
      const nextEntry: ReadingCheckResult = {
        ...existing,
        language: game.language,
        [game.gameId]: game,
      };
      const allFiveDone = Boolean(
        nextEntry.sound &&
          nextEntry['letter-sound'] &&
          nextEntry.nonword &&
          nextEntry.spelling &&
          nextEntry.memory
      );
      setCheckProgress((cp) => ({
        ...cp,
        [studentId]: {
          ...DEFAULT_CHECK_MAP,
          ...(cp[studentId] ?? {}),
          reading: allFiveDone ? 'Done' : 'In progress',
        },
      }));
      return {
        ...prev,
        [studentId]: nextEntry,
      };
    });
  }, []);

  const saveWritingCheckResult = useCallback((studentId: string, result: WritingCheckResult) => {
    setWritingCheckResults((prev) => ({
      ...prev,
      [studentId]: result,
    }));
    setCheckProgress((cp) => ({
      ...cp,
      [studentId]: {
        ...DEFAULT_CHECK_MAP,
        ...(cp[studentId] ?? {}),
        writing: 'Done',
      },
    }));
  }, []);

  const clearStudentCheckData = useCallback((studentId: string) => {
    setCheckProgress((prev) => {
      const next = { ...prev };
      delete next[studentId];
      return next;
    });
    setFocusCheckResults((prev) => {
      const next = { ...prev };
      delete next[studentId];
      return next;
    });
    setNumberCheckResults((prev) => {
      const next = { ...prev };
      delete next[studentId];
      return next;
    });
    setReadingCheckResults((prev) => {
      const next = { ...prev };
      delete next[studentId];
      return next;
    });
    setWritingCheckResults((prev) => {
      const next = { ...prev };
      delete next[studentId];
      return next;
    });
  }, []);

  const resetDemoData = useCallback(() => {
    const fresh = createInitialDemoState();
    setState(fresh);
    setCheckProgress({});
    setFocusCheckResults({});
    setNumberCheckResults({});
    setReadingCheckResults({});
    setWritingCheckResults({});
    setConsentAccepted(false);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
      localStorage.removeItem('neurolearning_3da_demo_v1');
      localStorage.removeItem('neurolearning_3da_checks_v1');
    } catch {
      // ignore
    }
  }, []);

  const prefersReducedMotion = systemReducedMotion || accessibilityPrefs.reducedMotion;

  return (
    <AppDataContext.Provider
      value={{
        state,
        route,
        setRoute,
        activeRole,
        setActiveRole,
        activeStudentId,
        setActiveStudentId,
        activeStudent,
        geminiConfigured,
        accessibilityPrefs,
        setAccessibilityPrefs,
        logStudentActivity,
        submitStudentFeedback,
        addTeacherObservation,
        updateSupportPlan,
        saveWritingArtifact,
        resetDemoData,
        checkProgress,
        getStudentChecks,
        updateCheckStatus,
        focusCheckResults,
        numberCheckResults,
        readingCheckResults,
        writingCheckResults,
        saveFocusQuestionnaire,
        saveStarMoonResult,
        saveNumberTaskResult,
        saveReadingGameResult,
        saveWritingCheckResult,
        clearStudentCheckData,
        consentAccepted,
        setConsentAccepted,
        soundEnabled,
        setSoundEnabled,
        requestedWorld,
        setRequestedWorld,
        prefersReducedMotion,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error('useAppData must be used inside AppDataProvider');
  return ctx;
}

