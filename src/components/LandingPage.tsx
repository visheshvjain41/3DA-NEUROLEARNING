import React, { useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Calculator,
  CheckCircle2,
  Compass,
  Menu,
  PenTool,
  ShieldCheck,
  Sparkles,
  Timer,
  X,
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';

export const LandingPage: React.FC = () => {
  const { state, setRoute, setActiveRole } = useAppData();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Contact form state
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactRole, setContactRole] = useState('School Administrator');
  const [contactMessage, setContactMessage] = useState('');
  const [contactError, setContactError] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handleStartJourney = () => {
    setRoute('login');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePreviewRole = (role: 'school' | 'parent' | 'student') => {
    setActiveRole(role);
    setRoute('portal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactError('');
    if (!contactName.trim()) {
      setContactError('Please enter your name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail.trim())) {
      setContactError('Please enter a valid email address.');
      return;
    }
    if (!contactMessage.trim()) {
      setContactError('Please include a short note about your school or inquiry.');
      return;
    }
    setContactSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-slate-900">
      {/* Top Bar Contract: 3 zones separated by gap-8 */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-[#FAF9F6]/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-6 py-4">
          {/* Zone 1: Single-line Brand Wordmark */}
          <a
            href="#top"
            className="font-display text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded"
          >
            3DA NeuroLearning
          </a>

          {/* Zone 2: 4 concise single-line nav links */}
          <nav
            aria-label="Main navigation"
            className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600"
          >
            <a
              href="#about"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              About
            </a>
            <a
              href="#impact"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Impact
            </a>
            <a
              href="#roadmap"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Roadmap
            </a>
            <a
              href="#contact"
              className="hover:text-slate-900 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Contact
            </a>
          </nav>

          {/* Zone 3: 1 primary CTA */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleStartJourney}
              className="hidden sm:inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 whitespace-nowrap shrink-0 cursor-pointer"
            >
              Start Your Journey
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              onClick={() => setMobileMenuOpen((v) => !v)}
              className="inline-flex md:hidden items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-6 py-4 space-y-3">
            <div className="flex flex-col space-y-2 text-sm font-medium text-slate-700">
              <a href="#about" onClick={() => setMobileMenuOpen(false)} className="py-1.5">
                About
              </a>
              <a href="#impact" onClick={() => setMobileMenuOpen(false)} className="py-1.5">
                Impact
              </a>
              <a href="#roadmap" onClick={() => setMobileMenuOpen(false)} className="py-1.5">
                Roadmap
              </a>
              <a href="#contact" onClick={() => setMobileMenuOpen(false)} className="py-1.5">
                Contact
              </a>
            </div>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handleStartJourney();
              }}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 cursor-pointer"
            >
              Start Your Journey
            </button>
          </div>
        )}
      </header>

      <main id="top">
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-6 pt-12 pb-16 lg:pt-16 lg:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center">
              <p className="text-sm font-semibold text-indigo-700 tracking-tight mb-3">
                Learn Your Way. Shine Your Way.
              </p>
              <h1
                className="font-display font-bold tracking-tight text-slate-900 leading-[1.1] max-w-2xl"
                style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)', textWrap: 'balance' }}
              >
                Every mind learns differently. Every mind deserves to shine.
              </h1>
              <p className="mt-5 text-base sm:text-lg leading-relaxed text-slate-600 max-w-xl">
                3DA NeuroLearning connects students with Dyslexia, Dyscalculia, Dysgraphia, and
                ADHD alongside their parents, teachers, and counsellors through calm,
                personalized learning worlds and AI-assisted educational support.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={handleStartJourney}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 whitespace-nowrap cursor-pointer"
                >
                  Start Your Journey
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
                <a
                  href="#worlds"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 whitespace-nowrap"
                >
                  Explore the Platform
                </a>
              </div>

              <p className="mt-5 text-xs text-slate-500">
                Educational support tools only · Does not diagnose or treat learning disorders ·
                Interactive hackathon demo
              </p>
            </div>

            <div className="lg:col-span-6">
              <div className="relative h-full min-h-[300px] lg:min-h-[420px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                <img
                  src="/src/assets/images/hero_learning_studio_1795274054654.jpg"
                  alt="Students learning collaboratively in a sunlit studio using tactile math blocks and illustrated books"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/75 via-slate-950/30 to-transparent p-6 text-white">
                  <p className="text-xs font-medium text-slate-200">
                    Connected Circle of Support
                  </p>
                  <p className="mt-1 font-display text-lg font-semibold">
                    Student tools, parent clarity, and educator guidance in one shared rhythm.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 4-column Impact Strip directly below hero */}
          <div id="impact" className="mt-14 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-5 border-b border-slate-100">
              <h2 className="font-display text-lg font-semibold text-slate-900">
                Platform Impact Snapshot
              </h2>
              <span className="text-xs font-medium text-slate-500">
                Illustrative demo data · Fictional hackathon figures
              </span>
            </div>
            <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="font-mono text-3xl font-semibold text-indigo-700 tabular-nums">3</p>
                <p className="mt-1 text-sm font-medium text-slate-800">Demo Schools</p>
                <p className="text-xs text-slate-500">Fictional partner campuses</p>
              </div>
              <div>
                <p className="font-mono text-3xl font-semibold text-teal-700 tabular-nums">301</p>
                <p className="mt-1 text-sm font-medium text-slate-800">Demo Students</p>
                <p className="text-xs text-slate-500">12 interactive profiles active</p>
              </div>
              <div>
                <p className="font-mono text-3xl font-semibold text-amber-700 tabular-nums">250+</p>
                <p className="mt-1 text-sm font-medium text-slate-800">Demo Learning Activities</p>
                <p className="text-xs text-slate-500">Logged across 4 learning worlds</p>
              </div>
              <div>
                <p className="font-mono text-3xl font-semibold text-sky-700 tabular-nums">36</p>
                <p className="mt-1 text-sm font-medium text-slate-800">Demo Support Plans</p>
                <p className="text-xs text-slate-500">Educator-reviewed monthly plans</p>
              </div>
            </div>
          </div>
        </section>

        {/* Partner Schools Section (Claim-to-Proof Adjacency) */}
        <section className="border-y border-slate-200 bg-white py-14">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-1">
                  Demo Partners · Illustrative School Network
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                  Partnering with inclusive school communities
                </h2>
              </div>
              <button
                type="button"
                onClick={() => handlePreviewRole('school')}
                className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-800 cursor-pointer whitespace-nowrap"
              >
                Open School Demo Portal
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {state.partnerSchools.map((school) => (
                <div
                  key={school.id}
                  className="rounded-xl border border-slate-200 bg-[#FAF9F6] p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-3">
                      <span>Demo partner</span>
                      <span aria-hidden="true">·</span>
                      <span>{school.city}</span>
                    </div>
                    <h3 className="font-display text-lg font-semibold text-slate-900">
                      {school.name}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                      {school.focusNote}
                    </p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600 tabular-nums">
                    <span>{school.demoStudents} demo students</span>
                    <span>{school.demoSupportPlans} demo plans</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Platform Overview: Four Learning Worlds */}
        <section id="worlds" className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-medium text-indigo-700 mb-2">
              Personalized Learning Worlds
            </p>
            <h2
              className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900"
              style={{ textWrap: 'balance' }}
            >
              Four calm, tactile spaces tailored to how students think
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              Instead of forcing every learner into one rigid format, students choose visual,
              auditory, and step-by-step tools built around their strengths.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Marquee Card 1: Dyslexia / Reading World */}
            <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white overflow-hidden grid grid-cols-1 sm:grid-cols-12">
              <div className="sm:col-span-5 min-h-[200px] bg-sky-50">
                <img
                  src="/src/assets/images/world_reading_studio_1795274091431.jpg"
                  alt="Open illustrated storybook with gentle reading pathways"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="sm:col-span-7 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-medium text-sky-700 mb-2">
                    <BookOpen className="h-4 w-4" aria-hidden="true" />
                    <span>Dyslexia Support · Reading World</span>
                  </div>
                  <h3 className="font-display text-xl font-semibold text-slate-900">
                    Read-Along Studio &amp; Sound Check
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    Sentence-by-sentence highlighting, adjustable spacing and paper tints, text-to-speech
                    read-along, and pressure-free syllable pattern games.
                  </p>
                </div>
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => handlePreviewRole('student')}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-700 hover:text-sky-800 cursor-pointer"
                  >
                    Try Reading World in Student Demo
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            {/* Marquee Card 2: Dyscalculia / Number World */}
            <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white overflow-hidden flex flex-col">
              <div className="h-44 bg-teal-50">
                <img
                  src="/src/assets/images/world_number_lab_1795274055185.jpg"
                  alt="Wooden fraction tiles and number blocks arranged neatly"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-medium text-teal-700 mb-2">
                    <Calculator className="h-4 w-4" aria-hidden="true" />
                    <span>Dyscalculia Support · Number World</span>
                  </div>
                  <h3 className="font-display text-xl font-semibold text-slate-900">
                    Visual Number Lab &amp; Problem Decoder
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    Interactive number lines, tactile fraction bars, and a 4-stage word-problem
                    decoder with progressive hints.
                  </p>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => handlePreviewRole('student')}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-800 cursor-pointer"
                  >
                    Try Number World
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            {/* Card 3: Dysgraphia / Writing World */}
            <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-amber-700 mb-2">
                  <PenTool className="h-4 w-4" aria-hidden="true" />
                  <span>Dysgraphia Support · Writing World</span>
                </div>
                <h3 className="font-display text-xl font-semibold text-slate-900">
                  Idea &amp; Outline Studio + Homework Builder
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Voice-capture brainstorming, sentence starters, and structured assignment
                  checklists—focusing on organizing ideas clearly without grading handwriting.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">Saves outlines directly to demo history</span>
                <button
                  type="button"
                  onClick={() => handlePreviewRole('student')}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700 hover:text-amber-800 cursor-pointer"
                >
                  Open Writing World
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Card 4: ADHD / Focus World */}
            <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-medium text-rose-700 mb-2">
                  <Timer className="h-4 w-4" aria-hidden="true" />
                  <span>ADHD Support · Focus World</span>
                </div>
                <h3 className="font-display text-xl font-semibold text-slate-900">
                  Focus Timer, Start Now &amp; 60-Second Reset
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Gentle visual timers, instant tiny-step checklists to beat task freeze, calm
                  breathing resets with reduced-motion support, and pattern memory games.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">Zero punitive streaks or timers</span>
                <button
                  type="button"
                  onClick={() => handlePreviewRole('student')}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-700 hover:text-rose-800 cursor-pointer"
                >
                  Open Focus World
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Four-Stage Roadmap */}
        <section id="roadmap" className="border-y border-slate-200 bg-white py-16">
          <div className="mx-auto max-w-7xl px-6">
            <div className="max-w-2xl mb-10">
              <p className="text-xs font-medium text-indigo-700 mb-2">
                How the Connected Ecosystem Works
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                A four-stage rhythm from understanding to steady growth
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: '01. Understand',
                  desc: 'Capture strengths, sensory preferences, and classroom observations without clinical labels.',
                },
                {
                  step: '02. Personalize',
                  desc: 'Match learners with Reading, Number, Writing, and Focus Worlds plus AI-assisted monthly plans.',
                },
                {
                  step: '03. Connect',
                  desc: 'Keep teachers, counsellors, parents, and students aligned on the same activity timeline.',
                },
                {
                  step: '04. Grow',
                  desc: 'Celebrate curiosity and effort with non-punitive milestones and gentle check-in cues.',
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="rounded-xl border border-slate-200 bg-[#FAF9F6] p-6"
                >
                  <h3 className="font-display text-lg font-semibold text-slate-900">{item.step}</h3>
                  <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About & Mission Section */}
        <section id="about" className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <p className="text-xs font-medium text-indigo-700 mb-2">Our Mission</p>
              <h2
                className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900"
                style={{ textWrap: 'balance' }}
              >
                Making neuroinclusive educational support calm, coordinated, and accessible
              </h2>
              <p className="mt-4 text-base text-slate-600 leading-relaxed">
                Students with Dyslexia, Dyscalculia, Dysgraphia, and ADHD often juggle disconnected
                worksheets at school, stressed homework nights at home, and static reports. 3DA
                NeuroLearning bridges that gap by turning everyday student activities into clear,
                encouraging insights for parents and actionable monthly plans for educators.
              </p>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <ShieldCheck className="h-4 w-4 text-teal-700" aria-hidden="true" />
                    <span>Educational Support Only</span>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                    3DA NeuroLearning never diagnoses or treats medical or clinical conditions. AI
                    suggestions always remain pending educator review.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Compass className="h-4 w-4 text-indigo-700" aria-hidden="true" />
                    <span>Built Without Ranking Pressure</span>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                    No leaderboards, punitive streaks, or single global test scores—only steady
                    progress at each student’s pace.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
              <div className="flex items-center gap-4">
                <img
                  src="/src/assets/images/buddy_avatar_lumi_1795274053620.jpg"
                  alt="Lumi the 3DA NeuroLearning study companion owl"
                  referrerPolicy="no-referrer"
                  className="h-20 w-20 rounded-xl border border-slate-200 object-cover shrink-0"
                />
                <div>
                  <p className="text-xs font-medium text-indigo-700">Meet Lumi · AI Study Buddy</p>
                  <h3 className="font-display text-lg font-semibold text-slate-900">
                    Hints before answers. Calm steps always.
                  </h3>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                Try switching between all three portals in our interactive hackathon demo using
                one-click role entry or the demo credentials.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handlePreviewRole('school')}
                  className="rounded-lg border border-slate-200 bg-[#FAF9F6] px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 cursor-pointer whitespace-nowrap"
                >
                  Explore as School
                </button>
                <button
                  type="button"
                  onClick={() => handlePreviewRole('parent')}
                  className="rounded-lg border border-slate-200 bg-[#FAF9F6] px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 cursor-pointer whitespace-nowrap"
                >
                  Explore as Parent
                </button>
                <button
                  type="button"
                  onClick={() => handlePreviewRole('student')}
                  className="rounded-lg border border-slate-200 bg-[#FAF9F6] px-3.5 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-100 cursor-pointer whitespace-nowrap"
                >
                  Explore as Student
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Contact / Partnership Form */}
        <section id="contact" className="border-t border-slate-200 bg-white py-16">
          <div className="mx-auto max-w-3xl px-6">
            <div className="text-center mb-8">
              <p className="text-xs font-medium text-indigo-700 mb-2">
                Demo Partnership Inquiry
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
                Bring 3DA NeuroLearning to your school community
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                This is a demo contact form for our hackathon prototype. Submit to preview the
                confirmation state.
              </p>
            </div>

            {contactSubmitted ? (
              <div className="rounded-2xl border border-teal-200 bg-teal-50/70 p-8 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-teal-700" aria-hidden="true" />
                <h3 className="mt-3 font-display text-xl font-semibold text-slate-900">
                  Demo Inquiry Received
                </h3>
                <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
                  Thank you, {contactName}. We recorded your demo partnership note for{' '}
                  <span className="font-medium text-slate-800">{contactRole}</span> (no external
                  email is sent in demo mode).
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setContactSubmitted(false);
                    setContactMessage('');
                  }}
                  className="mt-5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer"
                >
                  Send Another Demo Note
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleContactSubmit}
                noValidate
                className="rounded-2xl border border-slate-200 bg-[#FAF9F6] p-6 sm:p-8 space-y-5"
              >
                {contactError && (
                  <div
                    role="alert"
                    className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-800"
                  >
                    {contactError}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-xs font-semibold text-slate-700 mb-1.5"
                    >
                      Your Name
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Dr. Meenakshi Verma"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-xs font-semibold text-slate-700 mb-1.5"
                    >
                      Email Address
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="educator@school.demo"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="contact-role"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Your Role
                  </label>
                  <select
                    id="contact-role"
                    value={contactRole}
                    onChange={(e) => setContactRole(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                  >
                    <option>School Administrator</option>
                    <option>Learning Support Coordinator / Counsellor</option>
                    <option>Parent / Guardian</option>
                    <option>Classroom Teacher</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    How can we collaborate?
                  </label>
                  <textarea
                    id="contact-message"
                    rows={3}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Share a note about your learners or pilot goals..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-600/20"
                  />
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <span className="text-xs text-slate-500">
                    Demo form only · No external data stored
                  </span>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                    Submit Demo Inquiry
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 bg-[#FAF9F6] py-8">
        <div className="mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span className="font-display font-semibold text-slate-800">3DA NeuroLearning</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>Learn Your Way. Shine Your Way.</span>
          </div>
          <p>
            Hackathon demo · Fictional data only · Educational support tools, not clinical diagnosis or treatment.
          </p>
        </div>
      </footer>
    </div>
  );
};
