# 3DA NeuroLearning — Google AI Studio Build Prompts

**Product:** 3DA NeuroLearning  
**Tagline:** Learn Your Way. Shine Your Way.  
**Goal:** Build a polished, hackathon-ready, responsive AI learning-support web app for students, parents, and schools.

## How to use this file

1. Open **Google AI Studio → Build mode** and start a new web app.
2. Paste **Prompt 1** in the prompt box and let it build the foundation.
3. Paste Prompts 2–5 **one at a time into the same project**, waiting for each change to finish and checking the preview before continuing.
4. If a build breaks, ask AI Studio to fix the error without removing working features.

These prompts are designed to build one coherent app in five stages, not five separate apps.

---

# Prompt 1 — Build the app foundation, landing page and demo login

```text
Build a complete, polished, responsive web app called 3DA NeuroLearning.

PRODUCT
Tagline: “Learn Your Way. Shine Your Way.”
Mission: Make educational support more accessible for students with Dyslexia, Dyscalculia, Dysgraphia and ADHD by connecting students, parents, teachers and counsellors through personalized educational tools and AI-assisted support.

TECH & BUILD RULES
- Use React with a clean, reusable component architecture and responsive CSS.
- Use a modern, premium EdTech SaaS visual style, not a generic school ERP.
- Use soft purple, teal, blue, warm yellow and pink accents; off-white backgrounds; rounded cards; subtle shadows; clear typography; tasteful animations; and accessible contrast.
- Use Lucide icons where available.
- Use charts with a suitable React chart library.
- Create working navigation and interactions; do not leave decorative buttons inert.
- Keep shared demo data in a single coherent data layer (initially seeded in local state or local storage).
- No real authentication is required for this hackathon. Implement a clearly labeled demo login/role switcher.
- Do not expose API keys in client-side code.
- Label all fabricated data and stories “Demo data”.
- Never claim the app diagnoses or treats learning disorders. AI suggestions are educational support only.
- Build the application in a way that later prompts can extend it without replacing or breaking working features.

LANDING PAGE
Create a striking landing page with:
1. Navigation: logo, About, Impact, Roadmap, Contact, and “Start Your Journey”.
2. Hero headline: “Every mind learns differently. Every mind deserves to shine.”
3. Tagline: “Learn Your Way. Shine Your Way.”
4. Brief description of the platform and buttons: “Start Your Journey” and “Explore the Platform”.
5. Impact statistics using clearly labeled illustrative demo figures (never fake real-world prevalence statistics): Demo Schools: 3; Demo Students: 301; Demo Learning Activities: 250+; Demo Support Plans: 36. Include a small visible “Illustrative demo data” label.
6. Partner school cards/logos for fictional BrightPath International School, Learning Horizons Academy and MindBloom School. Clearly label these as demo partners.
7. A platform overview section introducing Dyslexia, Dyscalculia, Dysgraphia and ADHD learning worlds.
8. A four-stage roadmap: Understand, Personalize, Connect, Grow.
9. About section with the mission.
10. Contact/partnership form UI. It may be a demo form; show a confirmation state when submitted.

ROLE ENTRY / DEMO LOGIN
“Start Your Journey” must lead to a polished login/role selection experience. Provide three role cards: School, Parent, Student. Provide demo account selection or credentials and a role switcher so judges can easily explore all areas.

Use these demo credentials:
- School: school@3da.demo / DemoSchool123
- Parent: parent@3da.demo / DemoParent123
- Student: student@3da.demo / DemoStudent123

Also provide an easy “Explore demo as…” shortcut to switch roles without signing out. These are fictional demo credentials only; do not implement production authentication.

Create the app shell and navigation for each role, even if the deeper pages are added in later prompts:
- School: Dashboard, Students, Timeline, Feedback, Support Plans, Settings.
- Parent: Dashboard, Monthly Progress, Daily Progress, Extra Miles, AI & Counselor Hub, Settings.
- Student: My Learning Worlds, My Progress, Achievements, AI Buddy.

Ensure the landing page and role entry are fully styled, responsive, and functional. Start with the foundation and do not attempt to implement every learning activity in this prompt.
```

---

# Prompt 2 — Shared dummy dataset and school dashboard

```text
Extend the existing 3DA NeuroLearning app. Do not rebuild the app from scratch, remove features, or change the overall design system. Implement a shared, consistent demo data layer that all role dashboards can use.

DEMO SCHOOL
- BrightPath International School (fictional)
- 120 simulated students; 36 with demo learning-support profiles
- 12 simulated teachers; 2 simulated counsellors
- 3 fictional demo schools in the landing-page impact data
- Create at least 12 detailed student records for the interactive demo. The remaining aggregate totals may be simulated, but clearly label them as demo data.

STUDENT RECORDS
Create these fictional student records:
ST001 Aarav Mehta, Class 6A, Dyslexia
ST002 Maya Sharma, Class 7B, ADHD
ST003 Rohan Nair, Class 5A, Dyscalculia
ST004 Ananya Rao, Class 8A, Dysgraphia
ST005 Kabir Das, Class 6B, Dyslexia + ADHD
ST006 Sara Joseph, Class 5B, Dyscalculia
ST007 Vihaan Kapoor, Class 7A, ADHD
ST008 Diya Menon, Class 8B, Dysgraphia
ST009 Ishaan Gupta, Class 6A, Dyslexia
ST010 Tara Iyer, Class 5A, ADHD
ST011 Arjun Verma, Class 7B, Dyscalculia
ST012 Zoya Khan, Class 8A, Dyslexia + Dysgraphia

Each record must have fictional strengths, learning preferences, selected support profile, class, teacher, parent/demo account linkage, activity history, feedback, timeline events and an editable support plan. Avoid storing unnecessary sensitive details.

SHARED DATA
Create a coherent seed dataset including:
- Student profiles
- Learning activities
- Daily activity records with date, duration, status and module
- Student feedback
- Teacher observations
- Monthly support plans
- Parent/student/teacher demo account mappings
- Achievements

Use believable, internally consistent demo activity history across the last 30 days. Include enough data to populate charts and timelines. Keep all data explicitly fictional. Use local persistence if practical so completing an activity or submitting feedback remains visible after navigation or refresh. Provide a “Reset demo data” control.

SCHOOL DASHBOARD
Implement a functional school dashboard with:
- KPI cards: total demo students, students with support profiles, active demo support plans, activities completed
- Charts: support-profile distribution, activity trends, module usage
- Searchable/filterable student table
- Student cards or table rows with name, ID, class, profile, recent activity and an action to open profile
- Student follow-up indicator based on demo inactivity/observations (not diagnosis)
- Clear demo-data labeling

STUDENT DETAIL
Implement a student detail page with tabs or sections:
- Overview
- Activity
- Timeline
- Feedback
- Support Plan

Show strengths, learning preferences, activity history and observations. Make it easy to return to the dashboard. Keep navigation working and preserve the design.

The school portal must be functional and use the same shared data that will be used by the parent and student portals in later prompts. Do not make isolated hardcoded copies.
```

---

# Prompt 3 — Parent portal and AI support-plan generator

```text
Extend the existing 3DA NeuroLearning app. Preserve the landing page, demo login, school dashboard and shared data. Do not rebuild or remove working features.

PARENT PORTAL
Implement a polished parent dashboard linked to the correct fictional demo student. Use the parent demo login, and allow judges to switch to a different demo parent/student if needed.

Sections:
1. Dashboard overview
2. Monthly Progress
3. Daily Progress
4. Extra Miles / achievements
5. AI & Counselor Hub
6. Settings

MONTHLY PROGRESS
Display:
- Learning activities completed
- Activity trends over the month
- Module usage
- Student feedback
- Teacher observations
- Monthly summary
- Support-plan goals and review status

Use readable charts and plain-language summaries. Do not use a single global score or rank students.

DAILY PROGRESS
Show a chronological activity feed with time/date, module, duration, completion status and optional student feedback. Include a sample day view.

EXTRA MILES
Show optional games and activities, milestones and achievements. Celebrate effort without punitive streaks or comparisons.

AI & COUNSELOR HUB
Create a friendly chat interface. If Gemini integration is already configured, use it; otherwise provide a functional, clearly labeled simulated demo response system and a safe fallback. The assistant can explain demo activity data, suggest practical homework routines and recommend questions to discuss with a school counsellor. It must not diagnose or give clinical advice.

AI SUPPORT PLAN GENERATOR
On the school student-detail page, make “Generate/Regenerate Monthly Support Plan” functional. Use Gemini if available. Otherwise generate a structured demo plan from the selected student’s profile and activity history.

The plan structure:
- Student overview
- Strengths
- Learning preferences
- Areas where support may help
- 2–3 achievable monthly goals
- Suggested school activities/accommodations
- Suggested home activities
- Progress indicators
- Teacher/counsellor review notes
- Review status: “AI suggestion — pending educator review”

Make the plan editable and save it in the shared demo data so both school and parent views can see it. Include a “Print/Export” or print-friendly option if practical.

All fabricated insights and generated plans must be clearly marked as demo/AI suggestions and must not imply diagnosis or treatment.
```

---

# Prompt 4 — Student learning worlds and functional activities

```text
Extend the existing 3DA NeuroLearning app. Preserve all working pages, shared data, role switching, school dashboard and parent portal. Do not rebuild from scratch.

STUDENT PORTAL
Create an engaging, accessible, gamified student dashboard. It should feel like a welcoming learning playground rather than a school ERP. Include:
- Friendly greeting and demo avatar
- Daily mission cards
- Learning worlds
- Progress and achievements
- AI buddy entry point
- Clear navigation and responsive layout

Create four learning worlds, with at least one genuinely interactive prototype activity in each:

A. DYSLEXIA / READING WORLD
Read-Along demo:
- Display a short original sample passage.
- Highlight the current sentence or word as the student progresses (simulate audio timing if no audio API is configured).
- Controls for font size, line spacing, background and reading speed.
- Play/pause/restart simulation.
- Click-to-listen or text-to-speech if supported by the browser; graceful fallback if unavailable.
- A short comprehension check with feedback.
Word & Sound Check:
- Create a simple interactive sound/word pattern or syllable activity with feedback.
- Do not treat its result as diagnosis.

B. DYSCALCULIA / NUMBER WORLD
Visual Number Lab:
- Interactive number line.
- Fraction or place-value blocks that can be manipulated.
- A short challenge with hints.
Word-Problem Decoder:
- A sample word problem.
- Break it into “What is given?”, “What is asked?”, “Visual model” and “Try a solution”.
- Use progressive hints; do not immediately reveal everything.

C. DYSGRAPHIA / WRITING WORLD
Idea & Outline Studio:
- Student can type or use simulated voice-capture input to record ideas.
- Convert ideas into a simple editable outline.
- Provide sentence starters and a structured workspace.
Homework Builder:
- Enter a sample assignment and split it into editable steps/checklist.
- Allow saving the result in demo data.
- Focus on organizing ideas, not grading handwriting.

D. ADHD / FOCUS WORLD
Focus Timer:
- Functional adjustable timer with start, pause and reset.
- Visual progress.
Start Now:
- Enter a task and generate or simulate a tiny-step checklist.
- Allow students to check steps off.
60-Second Reset:
- A short visual breathing or grounding animation with optional reduced-motion support.
Brain & Focus Game:
- A simple interactive memory, sequence or pattern game with feedback.
- Frame it as an educational activity, not clinical treatment.

ACTIVITY TRACKING
When a student completes or saves an activity, record it in the shared demo data with module, date, duration if available, status and feedback. Update the student's timeline and relevant parent/school summaries. Add achievements for activity completion without creating punitive streaks or ranking students.

Keep every activity accessible, polished and responsive. Avoid unnecessary visual clutter. Include reset/replay controls where appropriate.
```

---

# Prompt 5 — Gemini AI buddy, polish and end-to-end verification

```text
Complete and polish the existing 3DA NeuroLearning app. Do not delete, replace or regress any working features.

GEMINI AI BUDDY
Implement a student-friendly Gemini-powered chat assistant if API integration is available in the project's secure server-side environment. Never expose an API key in browser/client code. If Gemini is not configured, provide a clearly labeled simulated demo mode with sensible responses so the hackathon app still works.

Use an original friendly avatar/personality rather than copyrighted character artwork. The assistant should be warm, playful, supportive and concise.

It should:
- Explain questions in simpler language
- Offer hints before answers
- Break assignments into small steps
- Help a student get started
- Recommend relevant activities from the app
- Encourage effort without pressure
- Suggest a short break when appropriate
- Adapt to reading-friendly language

If selected demo student context is available, use only relevant educational preferences, strengths and activity context. Do not infer diagnoses, make clinical claims or collect unnecessary sensitive information. Treat AI output as educational suggestions, not professional advice. Provide a clear way to reset or clear the chat.

Add quick prompts such as:
- Help me get started
- Explain this in simpler words
- Give me a hint
- Help me organize my homework
- Let's try a game
- I need a short break

FINAL POLISH
- Make all navigation, buttons, cards, filters, forms and activity controls work.
- Check that role switching and demo credentials work.
- Check that student activities update shared data and show in parent and school views.
- Check that feedback submission works.
- Check that support-plan generation and editing work.
- Add empty states, error states and loading states.
- Make layouts responsive for desktop, tablet and mobile.
- Use accessible labels, keyboard-friendly controls and readable contrast.
- Reduce excessive animation and respect reduced-motion settings.
- Add a visible “Demo data — fictional” label to relevant pages.
- Add a reset-demo-data action.
- Do not add fake real-world impact claims.
- Do not leave broken links, dead buttons, placeholder pages or console errors.

Perform a final end-to-end review in the preview. Fix errors while preserving all existing functionality. Prioritize a stable, cohesive and visually impressive hackathon demo over adding more features.
```

---

## Demo login credentials

| Role | Email | Password |
|---|---|---|
| School | `school@3da.demo` | `DemoSchool123` |
| Parent | `parent@3da.demo` | `DemoParent123` |
| Student | `student@3da.demo` | `DemoStudent123` |

These credentials are for the **simulated demo login only**, not real authentication.

## Hackathon demo flow

A strong presentation sequence:

1. **Landing page:** Introduce the mission and impact (with demo labels).
2. **School login:** Show analytics, search for a student and open their profile.
3. **Support plan:** Generate/edit a monthly AI support plan.
4. **Student login:** Complete one interactive activity in a learning world.
5. **Parent login:** Show the activity reflected in the daily/monthly progress.
6. **AI buddy:** Demonstrate an accessible explanation or task breakdown.

That end-to-end loop is the central product story: **a student gets support, the activity is captured, the school can review it, the parent can understand it, and AI can suggest next steps.**
