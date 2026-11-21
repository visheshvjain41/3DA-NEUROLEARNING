import type {
  AppDemoState,
  DailyActivity,
  LearningModule,
  StudentRecord,
  SupportProfileType,
  TeacherObservation,
  TimelineEvent,
} from '../types/neuro';

function daysAgoIso(daysAgo: number): string {
  const base = new Date('2026-11-21T10:00:00Z');
  base.setUTCDate(base.getUTCDate() - daysAgo);
  return base.toISOString().slice(0, 10);
}

const DEFAULT_ACHIEVEMENTS = (studentId: string, world: LearningModule) => [
  {
    id: `${studentId}-ach-1`,
    title: 'First Step Explorer',
    description: 'Completed an introductory session at your own comfortable pace.',
    world: 'All Worlds' as const,
    earnedDate: daysAgoIso(18),
  },
  {
    id: `${studentId}-ach-2`,
    title: 'Steady Curiosity',
    description: `Explored 3 guided activities in ${world}.`,
    world,
    earnedDate: daysAgoIso(7),
  },
];

interface SeedStudentSpec {
  id: string;
  name: string;
  className: string;
  supportProfile: SupportProfileType;
  teacher: string;
  counsellor: string;
  parentAccountName: string;
  strengths: string[];
  learningPreferences: string[];
  primaryWorld: LearningModule;
  secondaryWorld: LearningModule;
  followUpSuggested: boolean;
  followUpReason?: string;
  activityOffsets: number[];
}

const STUDENT_SPECS: SeedStudentSpec[] = [
  {
    id: 'ST001',
    name: 'Aarav Mehta',
    className: 'Class 6A',
    supportProfile: 'Dyslexia',
    teacher: 'Ms. Priya Deshmukh',
    counsellor: 'Mr. Vikram Sen',
    parentAccountName: 'Meera & Raj Mehta (Demo Parent)',
    strengths: ['Vivid oral storytelling', 'Strong visual pattern recall', 'Curious science thinker'],
    learningPreferences: ['Audio read-along with word highlighting', 'Extra line spacing & warm ivory backdrop', 'Short chunked reading passages'],
    primaryWorld: 'Reading World',
    secondaryWorld: 'Focus World',
    followUpSuggested: false,
    activityOffsets: [0, 1, 3, 5, 7, 10, 12, 15, 19, 24],
  },
  {
    id: 'ST002',
    name: 'Maya Sharma',
    className: 'Class 7B',
    supportProfile: 'ADHD',
    teacher: 'Mr. Daniel Okafor',
    counsellor: 'Ms. Kavita Rao',
    parentAccountName: 'Sunita Sharma (Demo Parent)',
    strengths: ['High creative energy', 'Quick verbal brainstorming', 'Helpful peer collaborator'],
    learningPreferences: ['10-minute visual timer blocks', 'Micro-step checklists', '60-second movement or breathing resets'],
    primaryWorld: 'Focus World',
    secondaryWorld: 'Writing World',
    followUpSuggested: false,
    activityOffsets: [1, 2, 4, 6, 9, 13, 16, 20, 25],
  },
  {
    id: 'ST003',
    name: 'Rohan Nair',
    className: 'Class 5A',
    supportProfile: 'Dyscalculia',
    teacher: 'Ms. Elena Torres',
    counsellor: 'Mr. Vikram Sen',
    parentAccountName: 'Deepa Nair (Demo Parent)',
    strengths: ['Expressive reading voice', 'Artistic spatial sketching', 'Thoughtful listener'],
    learningPreferences: ['Interactive number lines & fraction tiles', 'Step-by-step word-problem decoding', 'No timed math pressure'],
    primaryWorld: 'Number World',
    secondaryWorld: 'Reading World',
    followUpSuggested: true,
    followUpReason: 'Quiet week with 6 days since last Number World session; gentle check-in suggested.',
    activityOffsets: [6, 9, 12, 16, 21, 27],
  },
  {
    id: 'ST004',
    name: 'Ananya Rao',
    className: 'Class 8A',
    supportProfile: 'Dysgraphia',
    teacher: 'Ms. Priya Deshmukh',
    counsellor: 'Ms. Kavita Rao',
    parentAccountName: 'Karthik Rao (Demo Parent)',
    strengths: ['Deep historical reasoning', 'Rich spoken vocabulary', 'Empathetic team leader'],
    learningPreferences: ['Voice-to-outline idea capture', 'Sentence starters & structured scaffolds', 'Typed or audio reflections instead of long handwritten pages'],
    primaryWorld: 'Writing World',
    secondaryWorld: 'Reading World',
    followUpSuggested: false,
    activityOffsets: [0, 2, 5, 8, 11, 14, 18, 22, 26],
  },
  {
    id: 'ST005',
    name: 'Kabir Das',
    className: 'Class 6B',
    supportProfile: 'Dyslexia + ADHD',
    teacher: 'Mr. Daniel Okafor',
    counsellor: 'Mr. Vikram Sen',
    parentAccountName: 'Anjali Das (Demo Parent)',
    strengths: ['Hands-on robotics curiosity', 'Great sense of humor', 'Strong big-picture thinking'],
    learningPreferences: ['Read-along audio paired with short 8-min focus timers', 'Spacious typography', 'Clear two-step directions'],
    primaryWorld: 'Reading World',
    secondaryWorld: 'Focus World',
    followUpSuggested: true,
    followUpReason: 'Paused two reading sessions early this week; consider shorter passages with audio.',
    activityOffsets: [2, 5, 11, 15, 19, 23, 28],
  },
  {
    id: 'ST006',
    name: 'Sara Joseph',
    className: 'Class 5B',
    supportProfile: 'Dyscalculia',
    teacher: 'Ms. Elena Torres',
    counsellor: 'Ms. Kavita Rao',
    parentAccountName: 'Thomas Joseph (Demo Parent)',
    strengths: ['Imaginative story writing', 'Keen nature observer', 'Persistent problem explorer'],
    learningPreferences: ['Color-coded place value blocks', 'Visual fraction bars', 'Progressive hints before solutions'],
    primaryWorld: 'Number World',
    secondaryWorld: 'Writing World',
    followUpSuggested: false,
    activityOffsets: [1, 3, 6, 8, 13, 17, 21, 25],
  },
  {
    id: 'ST007',
    name: 'Vihaan Kapoor',
    className: 'Class 7A',
    supportProfile: 'ADHD',
    teacher: 'Mr. Arjun Malhotra',
    counsellor: 'Mr. Vikram Sen',
    parentAccountName: 'Neha Kapoor (Demo Parent)',
    strengths: ['Fast pattern recognition', 'Enthusiastic science presenter', 'Strong musical rhythm'],
    learningPreferences: ['Start-now micro-checklists', 'Visual memory games', 'Brief calm breathing transitions'],
    primaryWorld: 'Focus World',
    secondaryWorld: 'Number World',
    followUpSuggested: false,
    activityOffsets: [0, 3, 4, 7, 10, 14, 17, 22, 28],
  },
  {
    id: 'ST008',
    name: 'Diya Menon',
    className: 'Class 8B',
    supportProfile: 'Dysgraphia',
    teacher: 'Ms. Priya Deshmukh',
    counsellor: 'Ms. Kavita Rao',
    parentAccountName: 'Lakshmi Menon (Demo Parent)',
    strengths: ['Sharp analytical debate skills', 'Detail-oriented listener', 'Kind peer mentor'],
    learningPreferences: ['Graphic outline builder', 'Drag-and-reorder paragraph cards', 'Dictated idea brainstorming'],
    primaryWorld: 'Writing World',
    secondaryWorld: 'Focus World',
    followUpSuggested: false,
    activityOffsets: [1, 4, 7, 12, 15, 20, 24, 29],
  },
  {
    id: 'ST009',
    name: 'Ishaan Gupta',
    className: 'Class 6A',
    supportProfile: 'Dyslexia',
    teacher: 'Ms. Priya Deshmukh',
    counsellor: 'Mr. Vikram Sen',
    parentAccountName: 'Ritu Gupta (Demo Parent)',
    strengths: ['3D geometry intuition', 'Observant visual artist', 'Calm collaborator'],
    learningPreferences: ['Syllable sound check games', 'Soft sage reading tint', 'Slower 0.85x read-along pace'],
    primaryWorld: 'Reading World',
    secondaryWorld: 'Number World',
    followUpSuggested: true,
    followUpReason: 'No logged activity in the past 7 days; suggest warm teacher check-in.',
    activityOffsets: [7, 11, 16, 20, 26],
  },
  {
    id: 'ST010',
    name: 'Tara Iyer',
    className: 'Class 5A',
    supportProfile: 'ADHD',
    teacher: 'Ms. Elena Torres',
    counsellor: 'Ms. Kavita Rao',
    parentAccountName: 'Suresh Iyer (Demo Parent)',
    strengths: ['Curious question-asker', 'Expressive drama performer', 'Quick mental connections'],
    learningPreferences: ['Bite-sized 10-minute quests', 'Immediate encouraging feedback', 'Choice of starting activity'],
    primaryWorld: 'Focus World',
    secondaryWorld: 'Reading World',
    followUpSuggested: false,
    activityOffsets: [0, 2, 5, 9, 12, 16, 19, 23, 27],
  },
  {
    id: 'ST011',
    name: 'Arjun Verma',
    className: 'Class 7B',
    supportProfile: 'Dyscalculia',
    teacher: 'Mr. Daniel Okafor',
    counsellor: 'Mr. Vikram Sen',
    parentAccountName: 'Pooja Verma (Demo Parent)',
    strengths: ['Clear verbal explanations', 'Strong empathy & teamwork', 'Loves geography maps'],
    learningPreferences: ['Number line jump visuals', 'Real-world story framing for math', 'Untimed practice space'],
    primaryWorld: 'Number World',
    secondaryWorld: 'Focus World',
    followUpSuggested: false,
    activityOffsets: [1, 4, 8, 11, 14, 18, 22, 26],
  },
  {
    id: 'ST012',
    name: 'Zoya Khan',
    className: 'Class 8A',
    supportProfile: 'Dyslexia + Dysgraphia',
    teacher: 'Ms. Priya Deshmukh',
    counsellor: 'Ms. Kavita Rao',
    parentAccountName: 'Farhan Khan (Demo Parent)',
    strengths: ['Inventive science hypotheses', 'Strong oral presentation skills', 'Creative photography eye'],
    learningPreferences: ['Audio read-along paired with outline studio', 'Sentence starters & keyword banks', 'Reduced visual clutter'],
    primaryWorld: 'Writing World',
    secondaryWorld: 'Reading World',
    followUpSuggested: false,
    activityOffsets: [0, 2, 4, 8, 10, 13, 17, 21, 25, 29],
  },
];

const MODULE_ACTIVITIES: Record<LearningModule, string[]> = {
  'Reading World': ['Read-Along Studio: The Paper Kite Observatory', 'Word & Sound Check: Syllable Bridges'],
  'Number World': ['Visual Number Lab: Fraction Tiles & Line Jumps', 'Word-Problem Decoder: Step-by-Step Garden Plot'],
  'Writing World': ['Idea & Outline Studio: Three-Part Story Map', 'Homework Builder: Science Reflection Steps'],
  'Focus World': ['Focus Timer: Calm 10-Minute Sprint', 'Start Now: Tiny-Step Task Starter', '60-Second Reset & Pattern Memory'],
};

const SAMPLE_FEEDBACKS: Array<{ text: string; tag: DailyActivity['feelingTag'] }> = [
  { text: 'The word highlight made it much easier to keep my place.', tag: 'Calm' },
  { text: 'Breaking the question into smaller parts helped me figure it out.', tag: 'Proud' },
  { text: 'I liked seeing the visual blocks before answering.', tag: 'Curious' },
  { text: 'Took a 60-second breathing pause halfway through and felt ready again.', tag: 'Calm' },
  { text: 'Used one hint on the second step and finished cleanly.', tag: 'Needed a hint' },
];

export function createInitialDemoState(): AppDemoState {
  const activities: DailyActivity[] = [];
  const timeline: TimelineEvent[] = [];
  const observations: TeacherObservation[] = [];

  const students: StudentRecord[] = STUDENT_SPECS.map((spec, sIdx) => {
    // Generate realistic 30-day activities
    spec.activityOffsets.forEach((daysAgo, aIdx) => {
      const mod = aIdx % 3 === 2 ? spec.secondaryWorld : spec.primaryWorld;
      const titles = MODULE_ACTIVITIES[mod];
      const title = titles[(sIdx + aIdx) % titles.length];
      const fb = SAMPLE_FEEDBACKS[(sIdx + aIdx) % SAMPLE_FEEDBACKS.length];
      const date = daysAgoIso(daysAgo);
      const hour = 9 + ((sIdx + aIdx * 2) % 8);
      const time = `${String(hour).padStart(2, '0')}:${aIdx % 2 === 0 ? '15' : '40'}`;
      const isPaused = spec.followUpSuggested && aIdx === 0 && spec.id === 'ST005';
      const status = isPaused ? 'Paused for Break' : 'Completed';
      const durationMinutes = isPaused ? 6 : 10 + ((sIdx + aIdx * 3) % 12);

      const actId = `${spec.id}-act-${aIdx + 1}`;
      activities.push({
        id: actId,
        studentId: spec.id,
        date,
        time,
        module: mod,
        activityTitle: title,
        durationMinutes,
        status,
        studentFeedback: aIdx < 4 ? fb.text : undefined,
        feelingTag: aIdx < 4 ? fb.tag : undefined,
      });

      if (aIdx < 3) {
        timeline.push({
          id: `${spec.id}-tl-act-${aIdx + 1}`,
          studentId: spec.id,
          date,
          time,
          type: 'activity',
          title: `${status}: ${title}`,
          description: `${mod} · ${durationMinutes} min${fb ? ` · Student note: "${fb.text}"` : ''}`,
          actor: spec.name,
        });
      }
    });

    // Observations
    const obsDate1 = daysAgoIso(3 + (sIdx % 4));
    const obsDate2 = daysAgoIso(12 + (sIdx % 5));
    const obs1: TeacherObservation = {
      id: `${spec.id}-obs-1`,
      studentId: spec.id,
      date: obsDate1,
      author: spec.teacher,
      role: 'Teacher',
      setting: 'Classroom',
      note: `${spec.name.split(' ')[0]} showed strong engagement when instructions were paired with ${spec.learningPreferences[0].toLowerCase()}.`,
    };
    const obs2: TeacherObservation = {
      id: `${spec.id}-obs-2`,
      studentId: spec.id,
      date: obsDate2,
      author: spec.counsellor,
      role: 'Counsellor',
      setting: '1-on-1 Check-in',
      note: `Checked in on comfort and pacing. Leveraging ${spec.strengths[0].toLowerCase()} continues to build confidence.`,
    };
    observations.push(obs1, obs2);

    timeline.push(
      {
        id: `${spec.id}-tl-obs-1`,
        studentId: spec.id,
        date: obsDate1,
        time: '13:20',
        type: 'observation',
        title: `Classroom observation by ${spec.teacher}`,
        description: obs1.note,
        actor: spec.teacher,
      },
      {
        id: `${spec.id}-tl-sp-1`,
        studentId: spec.id,
        date: daysAgoIso(14),
        time: '15:00',
        type: 'support-plan',
        title: 'Monthly Educational Support Plan updated',
        description: `Focused on ${spec.primaryWorld} & ${spec.secondaryWorld} routines.`,
        actor: spec.counsellor,
      }
    );

    const reviewStatus =
      sIdx % 3 === 0
        ? ('AI suggestion — pending educator review' as const)
        : ('Reviewed by educator' as const);

    return {
      id: spec.id,
      name: spec.name,
      className: spec.className,
      supportProfile: spec.supportProfile,
      teacher: spec.teacher,
      counsellor: spec.counsellor,
      parentAccountName: spec.parentAccountName,
      parentEmail: 'parent@3da.demo',
      strengths: spec.strengths,
      learningPreferences: spec.learningPreferences,
      followUpSuggested: spec.followUpSuggested,
      followUpReason: spec.followUpReason,
      achievements: DEFAULT_ACHIEVEMENTS(spec.id, spec.primaryWorld),
      savedArtifacts: [
        {
          id: `${spec.id}-art-1`,
          studentId: spec.id,
          type: 'outline',
          title: 'My Favorite Science Discovery (Sample Outline)',
          items: [
            'Beginning: Why I got curious about how kites stay in the air',
            'Middle: Two things I noticed about wind and tail balance',
            'Wrap-up: What I want to test next in class',
          ],
          createdAt: daysAgoIso(4),
        },
      ],
      supportPlan: {
        overview: `${spec.name} thrives in calm, visually structured environments that honor ${spec.strengths[0].toLowerCase()}. This monthly demo plan pairs ${spec.primaryWorld} scaffolding with gentle home routines.`,
        strengths: spec.strengths,
        learningPreferences: spec.learningPreferences,
        supportAreas: [
          `Comfort and pacing in ${spec.primaryWorld} tasks`,
          `Smooth transitions into ${spec.secondaryWorld} practice`,
          'Self-advocacy when asking for a short break or hint',
        ],
        monthlyGoals: [
          `Complete 2–3 calm ${spec.primaryWorld} sessions per week at a comfortable pace`,
          `Use a preferred visual or audio scaffold before starting multi-step classwork`,
          `Share one short reflection note each week on what felt easiest`,
        ],
        schoolAccommodations: [
          'Provide previewed chunked instructions (1–2 steps visible at a time)',
          `Offer ${spec.learningPreferences[0]} during independent practice`,
          'Allow untimed, low-pressure check-ins focused on understanding rather than speed',
        ],
        homeActivities: [
          `Try one 10-minute ${spec.primaryWorld} activity together twice a week without a timer`,
          'Celebrate effort and strategy ("I noticed how you broke that step down") rather than scores',
          'Keep a quiet, clutter-free homework corner with optional water & 60-second stretch breaks',
        ],
        progressIndicators: [
          'Student reports feeling calmer or more confident starting tasks',
          'Consistent engagement across preferred learning worlds over the month',
          'Positive collaboration between classroom teacher and home routines',
        ],
        educatorNotes: `Demo educator note: ${spec.name} responds warmly to encouragement around ${spec.strengths[1].toLowerCase()}.`,
        reviewStatus,
        lastUpdated: daysAgoIso(14 - (sIdx % 7)),
        generatedSource: 'seed',
      },
    };
  });

  // Sort activities and timeline newest-first
  activities.sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`));
  timeline.sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`));
  observations.sort((a, b) => b.date.localeCompare(a.date));

  return {
    schoolMeta: {
      schoolName: 'BrightPath International School',
      totalSimulatedStudents: 120,
      studentsWithSupportProfiles: 36,
      simulatedTeachers: 12,
      simulatedCounsellors: 2,
    },
    partnerSchools: [
      {
        id: 'PS1',
        name: 'BrightPath International School',
        city: 'Bengaluru (Demo Partner)',
        demoStudents: 120,
        demoSupportPlans: 16,
        focusNote: 'Middle-school inclusive reading & focus pods',
      },
      {
        id: 'PS2',
        name: 'Learning Horizons Academy',
        city: 'Pune (Demo Partner)',
        demoStudents: 96,
        demoSupportPlans: 11,
        focusNote: 'Visual math labs & writing scaffolds',
      },
      {
        id: 'PS3',
        name: 'MindBloom School',
        city: 'Hyderabad (Demo Partner)',
        demoStudents: 85,
        demoSupportPlans: 9,
        focusNote: 'Parent-counsellor collaborative plans',
      },
    ],
    students,
    activities,
    timeline,
    observations,
  };
}
