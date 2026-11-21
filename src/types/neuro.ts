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
  feelingTag?: 'Calm' | 'Curious' | 'Proud' | 'Needed a hint';
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
