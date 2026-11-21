export type UserRole = 'school' | 'parent' | 'student';

export type SupportProfileType =
  | 'Dyslexia'
  | 'Dyscalculia'
  | 'Dysgraphia'
  | 'ADHD'
  | 'Dyslexia + ADHD'
  | 'Dyslexia + Dysgraphia';

export type LearningModule =
  | 'Reading World'
  | 'Number World'
  | 'Writing World'
  | 'Focus World';

export type ActivityStatus = 'Completed' | 'In Progress' | 'Paused for Break';

export interface DailyActivity {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  module: LearningModule;
  activityTitle: string;
  durationMinutes: number;
  status: ActivityStatus;
  studentFeedback?: string;
  feelingTag?: 'Steady' | 'Curious' | 'Proud' | 'Needed a hint';
}

export interface TimelineEvent {
  id: string;
  studentId: string;
  date: string;
  time: string;
  type: 'activity' | 'observation' | 'support-plan' | 'achievement';
  title: string;
  description: string;
  actor: string;
}

export interface TeacherObservation {
  id: string;
  studentId: string;
  date: string;
  author: string;
  role: 'Teacher' | 'Counsellor';
  note: string;
  setting: 'Classroom' | 'Small Group' | '1-on-1 Check-in';
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  world: LearningModule | 'All Worlds';
  earnedDate: string;
}

export interface SupportPlan {
  overview: string;
  strengths: string[];
  learningPreferences: string[];
  supportAreas: string[];
  monthlyGoals: string[];
  schoolAccommodations: string[];
  homeActivities: string[];
  progressIndicators: string[];
  educatorNotes: string;
  reviewStatus: 'AI suggestion — pending educator review' | 'Reviewed by educator';
  lastUpdated: string;
  generatedSource: 'seed' | 'gemini' | 'demo-generator' | 'edited';
}

export interface SavedWritingArtifact {
  id: string;
  studentId: string;
  type: 'outline' | 'checklist';
  title: string;
  items: string[];
  createdAt: string;
}

export interface StudentRecord {
  id: string;
  name: string;
  className: string;
  supportProfile: SupportProfileType;
  teacher: string;
  counsellor: string;
  parentAccountName: string;
  parentEmail: string;
  strengths: string[];
  learningPreferences: string[];
  followUpSuggested: boolean;
  followUpReason?: string;
  supportPlan: SupportPlan;
  achievements: Achievement[];
  savedArtifacts: SavedWritingArtifact[];
}

export interface PartnerSchool {
  id: string;
  name: string;
  city: string;
  demoStudents: number;
  demoSupportPlans: number;
  focusNote: string;
}

export interface SchoolSummaryMeta {
  schoolName: string;
  totalSimulatedStudents: number;
  studentsWithSupportProfiles: number;
  simulatedTeachers: number;
  simulatedCounsellors: number;
}

export interface AppDemoState {
  schoolMeta: SchoolSummaryMeta;
  partnerSchools: PartnerSchool[];
  students: StudentRecord[];
  activities: DailyActivity[];
  timeline: TimelineEvent[];
  observations: TeacherObservation[];
}

export interface StudentAccessibilityPrefs {
  readingFriendly: boolean;
  reducedMotion: boolean;
  paperTint: 'ivory' | 'sage' | 'sky';
}

export type CheckType = 'reading' | 'number' | 'writing' | 'focus';

export type CheckStatus = 'Not started' | 'In progress' | 'Done';

export type TrafficBand = 'Green' | 'Amber' | 'Red';

export interface FocusQuestionnaireResult {
  ratings: number[]; // length 18: 0..8 inattention, 9..17 hyperactivity/impulsivity
  inattentionAvg: number;
  hyperactivityAvg: number;
  inattentionBand: TrafficBand;
  hyperactivityBand: TrafficBand;
  respondentRole: 'parent' | 'school';
  completedAt: string;
}

export interface StarMoonGameResult {
  missedStars: number;
  wrongMoonTaps: number;
  reactionTimeSdMs: number;
  starsHit: number;
  totalStars: number;
  totalMoons: number;
  completedAt: string;
}

export interface FocusCheckResult {
  questionnaire?: FocusQuestionnaireResult;
  starMoonGame?: StarMoonGameResult;
}

export type NumberTaskId = 'dots' | 'numbers' | 'sums';

export interface NumberTaskMetrics {
  taskId: NumberTaskId;
  title: string;
  accuracyPct: number;
  medianRtMs: number;
  correctCount: number;
  totalTrials: number;
  band: TrafficBand;
  completedAt: string;
}

export interface NumberCheckResult {
  dots?: NumberTaskMetrics;
  numbers?: NumberTaskMetrics;
  sums?: NumberTaskMetrics;
}

export type ReadingLanguage = 'en' | 'hi' | 'kn';

export type ReadingGameId = 'sound' | 'letter-sound' | 'nonword' | 'spelling' | 'memory';

export interface ReadingGameMetrics {
  gameId: ReadingGameId;
  title: string;
  language: ReadingLanguage;
  accuracyPct: number;
  medianRtMs: number;
  correctCount: number;
  totalTrials: number;
  errorTypes: string[];
  band: TrafficBand;
  completedAt: string;
}

export interface ReadingCheckResult {
  language: ReadingLanguage;
  sound?: ReadingGameMetrics;
  'letter-sound'?: ReadingGameMetrics;
  nonword?: ReadingGameMetrics;
  spelling?: ReadingGameMetrics;
  memory?: ReadingGameMetrics;
}

export type WritingTaskId = 'sentence' | 'digits' | 'trace';

export interface WritingTaskDrawing {
  taskId: WritingTaskId;
  title: string;
  imageDataUrl: string;
  penLifts: number;
  avgInterStrokeMs: number;
  speedVariationPct: number;
  completedAt: string;
}

export interface WritingCheckResult {
  penLifts: number;
  avgInterStrokeMs: number;
  speedVariationPct: number;
  drawings: WritingTaskDrawing[];
  completedAt: string;
}

