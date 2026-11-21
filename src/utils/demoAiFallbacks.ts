import type { DailyActivity, StudentRecord, SupportPlan, TeacherObservation } from '../types/neuro';

export function buildStructuredDemoSupportPlan(
  student: StudentRecord,
  recentActivities: DailyActivity[],
  observations: TeacherObservation[]
): SupportPlan {
  const completedCount = recentActivities.filter((a) => a.status === 'Completed').length;
  const topModule =
    recentActivities[0]?.module ??
    (student.supportProfile.includes('Dyscalculia')
      ? 'Number World'
      : student.supportProfile.includes('Dysgraphia')
        ? 'Writing World'
        : student.supportProfile.includes('ADHD')
          ? 'Focus World'
          : 'Reading World');

  const latestObs = observations[0]?.note ?? 'Responds well to calm, chunked guidance.';

  return {
    overview: `[Simulated Demo Plan] ${student.name} (${student.className}) has completed ${completedCount} guided learning activities recently, with strong momentum in ${topModule}. This suggested monthly plan builds on ${student.strengths[0].toLowerCase()} while offering practical classroom and home routines.`,
    strengths: [...student.strengths],
    learningPreferences: [...student.learningPreferences],
    supportAreas: [
      `Sustaining comfort and steady pacing during ${topModule} tasks`,
      'Breaking multi-step instructions into 1–2 visible steps at a time',
      'Building confidence using hints or short resets before feeling stuck',
    ],
    monthlyGoals: [
      `Explore 3 calm ${topModule} sessions per week using preferred visual/audio tools`,
      'Practice starting independent tasks with a 2-step checklist or outline',
      'Log one short reflection note per week sharing what tool helped most',
    ],
    schoolAccommodations: [
      `Pair written tasks with ${student.learningPreferences[0].toLowerCase()}`,
      'Offer untimed check-ins focused on comprehension and idea organization',
      `Acknowledge ${student.strengths[1].toLowerCase()} during group or project sharing`,
    ],
    homeActivities: [
      `Do one relaxed 10-minute ${topModule} activity together twice a week`,
      'Praise strategy and effort ("Look how you broke that problem down") instead of speed',
      'Include an optional 60-second stretch or breathing pause between homework subjects',
    ],
    progressIndicators: [
      'Student feels calmer and more willing to start independent activities',
      'Consistent weekly activity across preferred Learning Worlds',
      `Aligned notes between ${student.teacher} and home routines (${latestObs.slice(0, 65)}...)`,
    ],
    educatorNotes: `Demo educator review prompt: Confirm classroom accommodations align with ${student.name}'s current week.`,
    reviewStatus: 'AI suggestion — pending educator review',
    lastUpdated: new Date().toISOString().slice(0, 10),
    generatedSource: 'demo-generator',
  };
}

export function buildSimulatedParentHubReply(
  question: string,
  student: StudentRecord,
  activities: DailyActivity[],
  observations: TeacherObservation[]
): string {
  const q = question.toLowerCase();
  const recentCount = activities.length;
  const completedCount = activities.filter((a) => a.status === 'Completed').length;
  const latestActivity = activities[0];
  const latestObs = observations[0];

  if (q.includes('counsellor') || q.includes('counselor') || q.includes('question') || q.includes('teacher')) {
    return [
      `Here are 3 gentle, practical questions you can bring to ${student.counsellor} or ${student.teacher} (educational support only):`,
      `1. "We noticed ${student.name} enjoys ${student.learningPreferences[0].toLowerCase()}. Could we use a similar cue during classwork?"`,
      `2. "When ${student.name} pauses on a longer task, what small first step works best in the classroom?"`,
      `3. "How can we align our calm home routine with this month's goals in ${student.supportPlan.monthlyGoals[0]?.toLowerCase() ?? 'Reading and Focus'}?"`,
    ].join('\n\n');
  }

  if (q.includes('homework') || q.includes('routine') || q.includes('home')) {
    return [
      `For ${student.name}, a low-pressure 20-minute home routine works well (educational suggestion only):`,
      `• Start with 2 minutes of setup: water, quiet lighting, and picking just ONE task first.`,
      `• Try 10 minutes using ${student.learningPreferences[0].toLowerCase()}, followed by a 60-second breathing or stretch reset.`,
      `• End by celebrating one specific effort you noticed, rather than checking how fast it was done.`,
    ].join('\n\n');
  }

  return [
    `Looking at ${student.name}'s demo activity log: ${completedCount} of ${recentCount} recent sessions were completed at a steady pace.`,
    latestActivity
      ? `Most recent session: "${latestActivity.activityTitle}" in ${latestActivity.module} (${latestActivity.durationMinutes} min).`
      : 'No recent session logged yet this week.',
    latestObs
      ? `${latestObs.author} also noted: "${latestObs.note}"`
      : '',
    `Note: These insights reflect demo educational logs only and are not clinical assessments. Ask me for a home routine or counsellor check-in questions anytime!`,
  ]
    .filter(Boolean)
    .join('\n\n');
}

export function buildSimulatedBuddyReply(
  message: string,
  student: StudentRecord,
  readingFriendly: boolean
): string {
  const q = message.toLowerCase();
  const firstName = student.name.split(' ')[0];

  if (q.includes('break') || q.includes('tired') || q.includes('overwhelmed')) {
    return readingFriendly
      ? `Hi ${firstName}! It is completely okay to pause.\n\nLet us take a calm 60-second reset.\n\n• Drop your shoulders down.\n• Breathe in slowly for 4 counts.\n• Breathe out for 4 counts.\n\nYou can try the 60-Second Reset inside Focus World whenever you want.`
      : `Hey ${firstName}, taking a pause is a smart learning move! Try heading to Focus World → 60-Second Reset for three slow breaths, grab a sip of water, and come back whenever you feel ready.`;
  }

  if (q.includes('game') || q.includes('play') || q.includes('fun')) {
    return readingFriendly
      ? `Let us try a fun activity together!\n\n• Word & Sound Check in Reading World\n• Fraction Tiles in Number World\n• Pattern Memory Game in Focus World\n\nPick whichever world feels nicest right now.`
      : `Ooh, let's play! You can try the Pattern Memory Game in Focus World, build fraction bars in Number World's Visual Lab, or match syllables in Reading World. No timers, no pressure—just curious exploring!`;
  }

  if (q.includes('homework') || q.includes('organize') || q.includes('start')) {
    return readingFriendly
      ? `Let us start small, ${firstName}.\n\nStep 1: Pick just one assignment.\nStep 2: Open Homework Builder in Writing World.\nStep 3: Do only the first 5-minute piece.\n\nTell me your subject if you want help writing Step 1!`
      : `Starting is always the hardest part! Let's shrink it down together:\n1. Pick just ONE task (ignore the rest for now).\n2. Open Writing World → Homework Builder or Focus World → Start Now.\n3. Set a gentle 5-minute goal just to read the prompt or write 2 bullet ideas.\n\nWhat subject is your homework for?`;
  }

  if (q.includes('hint') || q.includes('simpler') || q.includes('explain')) {
    return readingFriendly
      ? `Sure! Tell me the word, math question, or sentence.\n\nI will explain it in short, simple words.\nAnd I will give you a friendly hint first so you get to discover the answer yourself!`
      : `I've got your back, ${firstName}! Paste the tricky question or topic here, and I'll break it down into everyday words with a gentle hint first—never a wall of text.`;
  }

  return readingFriendly
    ? `Hi ${firstName}! I am Lumi, your study buddy.\n\nWe can:\n• Break homework into tiny steps\n• Explain tricky ideas in simple words\n• Pick a calm game or 60-second break\n\nWhat would feel helpful right now?`
    : `Hi ${firstName}! I'm Lumi. Tell me what you're working on—whether it's a reading passage, a math word problem, or organizing ideas—and we'll take it one small, calm step at a time.`;
}
