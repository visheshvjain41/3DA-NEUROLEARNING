import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  BookOpen,
  Building2,
  Calculator,
  CheckCircle2,
  Compass,
  GraduationCap,
  HeartHandshake,
  Mail,
  Menu,
  PenTool,
  ShieldCheck,
  Sparkles,
  Timer,
  X,
} from 'lucide-react';
import { useAppData } from '../context/AppDataContext';

export const LandingPage: React.FC = () => {
  const { state, setRoute, setActiveRole, prefersReducedMotion } = useAppData();
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

  const handleOpenCheck = () => {
    setRoute('check');
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
    <div className="min-h-screen bg-white text-slate-900">
      {/* Top Bar: Navy accent border & crisp white official header */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-8 px-6 py-4">
          <a
            href="#top"
            className="inline-flex items-center gap-2.5 font-display text-xl font-bold tracking-tight text-[#0B1D3A] whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1D3A] rounded"
          >
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#0B1D3A] text-xs font-extrabold text-[#FDE047]">
              3DA
            </span>
            <span>3DA NeuroLearning</span>
          </a>

          <nav
            aria-label="Main navigation"
            className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600"
          >
            <a
              href="#about"
              className="hover:text-[#0B1D3A] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              About
            </a>
            <a
              href="#worlds"
              className="hover:text-[#0B1D3A] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Platform
            </a>
            <a
              href="#roadmap"
              className="hover:text-[#0B1D3A] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Roadmap
            </a>
            <a
              href="#contact"
              className="hover:text-[#0B1D3A] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
            >
              Contact
            </a>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleOpenCheck}
              className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border-2 border-amber-300 bg-[#FEF9C3] px-3.5 py-2 text-sm font-bold text-[#0B1D3A] transition-colors hover:bg-amber-200/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-amber-700" aria-hidden="true" />
              Let&apos;s Check
            </button>
            <button
              type="button"
              onClick={handleStartJourney}
              className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-[#0B1D3A] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1D3A] focus-visible:ring-offset-2 whitespace-nowrap shrink-0 cursor-pointer"
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
            <div className="flex flex-col space-y-2 text-sm font-semibold text-slate-700">
              <a href="#about" onClick={() => setMobileMenuOpen(false)} className="py-1.5">
                About
              </a>
              <a href="#worlds" onClick={() => setMobileMenuOpen(false)} className="py-1.5">
                Platform
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
                handleOpenCheck();
              }}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border-2 border-amber-300 bg-[#FEF9C3] px-4 py-2.5 text-sm font-bold text-[#0B1D3A] hover:bg-amber-200/80 cursor-pointer"
            >
              <Sparkles className="h-4 w-4 text-amber-700" aria-hidden="true" />
              Let&apos;s Check
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                handleStartJourney();
              }}
              className="w-full rounded-xl bg-[#0B1D3A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 cursor-pointer"
            >
              Start Your Journey
            </button>
          </div>
        )}
      </header>

      <main id="top">
        {/* Hero Section — Official navy/white foundation with bright cheerful child accents */}
        <section className="bg-gradient-to-b from-[#F8FAFC] via-[#E0F2FE]/30 to-white pt-10 pb-16 lg:pt-14 lg:pb-20 border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
              <div className="lg:col-span-6 flex flex-col justify-center">
                <div className="inline-flex items-center gap-3 self-start rounded-2xl border-2 border-sky-200 bg-white px-3.5 py-2 mb-5">
                  <motion.img
                    src="/src/assets/images/buddy_avatar_lumi_1795274053620.jpg"
                    alt="Lumi the study guide owl"
                    referrerPolicy="no-referrer"
                    animate={
                      prefersReducedMotion
                        ? { y: 0, rotate: 0 }
                        : { y: [0, -4, 0], rotate: [-2, 2, -2] }
                    }
                    transition={
                      prefersReducedMotion
                        ? { duration: 0 }
                        : { duration: 3.6, repeat: Infinity, ease: 'easeInOut' }
                    }
                    className="h-9 w-9 rounded-xl border border-amber-300 object-cover"
                  />
                  <span className="text-sm font-bold text-[#0B1D3A]">
                    Learn Your Way. Shine Your Way. ·{' '}
                    <span className="text-sky-700">Ready to play?</span>
                  </span>
                </div>

                <h1
                  className="font-display font-bold tracking-tight text-[#0B1D3A] leading-[1.1] max-w-2xl"
                  style={{ fontSize: 'clamp(2.25rem, 4vw, 3.5rem)', textWrap: 'balance' }}
                >
                  Every mind learns differently. Every mind deserves to shine.
                </h1>
                <p className="mt-5 text-base sm:text-lg leading-relaxed text-slate-700 max-w-xl">
                  3DA NeuroLearning connects students with Dyslexia, Dyscalculia, Dysgraphia, and
                  ADHD alongside their parents, teachers, and counsellors through structured
                  learning worlds and clear, coordinated support plans.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3.5">
                  <button
                    type="button"
                    onClick={handleStartJourney}
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#0B1D3A] px-6 py-3.5 text-base font-bold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1D3A] focus-visible:ring-offset-2 whitespace-nowrap cursor-pointer"
                  >
                    Start Your Journey
                    <ArrowRight className="h-5 w-5" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenCheck}
                    className="inline-flex items-center gap-2 rounded-2xl border-2 border-amber-300 bg-[#FEF9C3] px-5 py-3.5 text-base font-bold text-[#0B1D3A] transition-colors hover:bg-amber-200/80 whitespace-nowrap cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 text-amber-800" aria-hidden="true" />
                    Let&apos;s Check
                  </button>
                  <a
                    href="#worlds"
                    className="inline-flex items-center gap-2 rounded-2xl border-2 border-slate-300 bg-white px-5 py-3.5 text-base font-bold text-[#0B1D3A] transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1D3A] whitespace-nowrap"
                  >
                    Explore the Platform
                  </a>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="relative h-full min-h-[300px] lg:min-h-[430px] overflow-hidden rounded-3xl border-2 border-slate-200 bg-[#0B1D3A]">
                  <img
                    src="/src/assets/images/hero_learning_studio_1795274054654.jpg"
                    alt="Students learning collaboratively in a bright studio using tactile math blocks and illustrated books"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0B1D3A]/90 via-[#0B1D3A]/45 to-transparent p-6 text-white">
                    <p className="text-xs font-semibold text-[#FDE047]">
                      Connected Circle of Support
                    </p>
                    <p className="mt-1 font-display text-lg font-semibold">
                      Playful student tools, parent clarity, and educator guidance in one shared rhythm.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Workspace Overview — strictly derived from live app state */}
            <div className="mt-14 rounded-3xl border border-slate-200 bg-[#0B1D3A] p-6 sm:p-8 text-white">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-5 border-b border-white/15">
                <h2 className="font-display text-lg font-semibold text-white">
                  Active Learning Workspace
                </h2>
                <span className="text-xs font-medium text-sky-200">
                  Live totals synchronized across School, Parent, and Student portals
                </span>
              </div>
              <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <p className="font-mono text-3xl font-semibold text-[#FDE047] tabular-nums">
                    {state.students.length}
                  </p>
                  <p className="mt-1 text-sm font-medium text-white">Student Profiles</p>
                  <p className="text-xs text-slate-300">Individualized learning strengths</p>
                </div>
                <div>
                  <p className="font-mono text-3xl font-semibold text-[#38BDF8] tabular-nums">
                    {state.activities.length}
                  </p>
                  <p className="mt-1 text-sm font-medium text-white">Recorded Activities</p>
                  <p className="text-xs text-slate-300">Sessions tracked across worlds</p>
                </div>
                <div>
                  <p className="font-mono text-3xl font-semibold text-[#34D399] tabular-nums">
                    4
                  </p>
                  <p className="mt-1 text-sm font-medium text-white">Learning Worlds</p>
                  <p className="text-xs text-slate-300">Reading, Number, Writing &amp; Focus</p>
                </div>
                <div>
                  <p className="font-mono text-3xl font-semibold text-white tabular-nums">
                    {state.observations.length}
                  </p>
                  <p className="mt-1 text-sm font-medium text-white">Educator Observations</p>
                  <p className="text-xs text-slate-300">Classroom &amp; counsellor notes</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Three Connected Portals Section */}
        <section className="bg-white py-14 border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
              <div>
                <p className="text-xs font-semibold text-sky-700 uppercase tracking-wider mb-1">
                  Unified Architecture
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1D3A]">
                  Designed for every member of the support circle
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 flex flex-col justify-between">
                <div>
                  <div className="inline-flex rounded-xl bg-[#0B1D3A] p-2.5 text-white mb-4">
                    <Building2 className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#0B1D3A]">
                    School &amp; Counsellor Portal
                  </h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    Manage student cohorts, classroom observations, screening summaries, and
                    educator-reviewed monthly support plans in one place.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handlePreviewRole('school')}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-[#0B1D3A] hover:text-sky-700 cursor-pointer"
                >
                  Open School Portal
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 flex flex-col justify-between">
                <div>
                  <div className="inline-flex rounded-xl bg-teal-700 p-2.5 text-white mb-4">
                    <HeartHandshake className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#0B1D3A]">Parent Portal</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                    Follow plain-language monthly progress, review home routines, celebrate effort
                    milestones, and prepare school check-in questions.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handlePreviewRole('parent')}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-[#0B1D3A] hover:text-teal-700 cursor-pointer"
                >
                  Open Parent Portal
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              <div className="rounded-2xl border border-sky-200 bg-[#E0F2FE]/35 p-6 flex flex-col justify-between">
                <div>
                  <div className="inline-flex rounded-xl bg-amber-400 p-2.5 text-[#0B1D3A] mb-4">
                    <GraduationCap className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-[#0B1D3A]">
                    Student Learning Worlds
                  </h3>
                  <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                    Explore interactive Reading, Number, Writing, and Focus tools with Lumi and
                    low-pressure learning checks.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handlePreviewRole('student')}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-[#0B1D3A] hover:text-sky-800 cursor-pointer"
                >
                  Open Student Portal
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Platform Overview: Four Learning Worlds */}
        <section id="worlds" className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
          <div className="max-w-2xl mb-10">
            <p className="text-xs font-semibold text-sky-700 uppercase tracking-wider mb-2">
              Personalized Learning Worlds
            </p>
            <h2
              className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1D3A]"
              style={{ textWrap: 'balance' }}
            >
              Four tactile spaces tailored to how students think
            </h2>
            <p className="mt-3 text-base text-slate-600 leading-relaxed">
              Instead of forcing every learner into one rigid format, students choose visual,
              auditory, and step-by-step tools built around their strengths.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Card 1: Dyslexia / Reading World */}
            <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white overflow-hidden grid grid-cols-1 sm:grid-cols-12">
              <div className="sm:col-span-5 min-h-[200px] bg-sky-50">
                <img
                  src="/src/assets/images/world_reading_studio_1795274091431.jpg"
                  alt="Open illustrated storybook showing reading pathways"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="sm:col-span-7 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-sky-700 mb-2">
                    <BookOpen className="h-4 w-4" aria-hidden="true" />
                    <span>Dyslexia Support · Reading World</span>
                  </div>
                  <h3 className="font-display text-xl font-semibold text-[#0B1D3A]">
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
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B1D3A] hover:text-sky-700 cursor-pointer"
                  >
                    Open Reading World
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2: Dyscalculia / Number World */}
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
                  <div className="flex items-center gap-2 text-xs font-semibold text-teal-700 mb-2">
                    <Calculator className="h-4 w-4" aria-hidden="true" />
                    <span>Dyscalculia Support · Number World</span>
                  </div>
                  <h3 className="font-display text-xl font-semibold text-[#0B1D3A]">
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
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B1D3A] hover:text-teal-700 cursor-pointer"
                  >
                    Open Number World
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>

            {/* Card 3: Dysgraphia / Writing World */}
            <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 mb-2">
                  <PenTool className="h-4 w-4" aria-hidden="true" />
                  <span>Dysgraphia Support · Writing World</span>
                </div>
                <h3 className="font-display text-xl font-semibold text-[#0B1D3A]">
                  Idea &amp; Outline Studio + Homework Builder
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Voice-capture brainstorming, sentence starters, and structured assignment
                  checklists—focusing on organizing ideas clearly without grading handwriting.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">Saves outlines directly to workspace</span>
                <button
                  type="button"
                  onClick={() => handlePreviewRole('student')}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B1D3A] hover:text-amber-700 cursor-pointer"
                >
                  Open Writing World
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>

            {/* Card 4: ADHD / Focus World */}
            <div className="lg:col-span-6 rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-rose-700 mb-2">
                  <Timer className="h-4 w-4" aria-hidden="true" />
                  <span>ADHD Support · Focus World</span>
                </div>
                <h3 className="font-display text-xl font-semibold text-[#0B1D3A]">
                  Focus Timer, Start Now &amp; 60-Second Reset
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Clear visual timers, instant tiny-step checklists to beat task freeze, guided
                  breathing resets with reduced-motion support, and pattern memory games.
                </p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">Zero punitive streaks or countdowns</span>
                <button
                  type="button"
                  onClick={() => handlePreviewRole('student')}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0B1D3A] hover:text-rose-700 cursor-pointer"
                >
                  Open Focus World
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Four-Stage Roadmap */}
        <section id="roadmap" className="border-y border-slate-200 bg-slate-50 py-16">
          <div className="mx-auto max-w-7xl px-6">
            <div className="max-w-2xl mb-10">
              <p className="text-xs font-semibold text-sky-700 uppercase tracking-wider mb-2">
                How the Connected Ecosystem Works
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1D3A]">
                A four-stage rhythm from understanding to steady growth
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  step: '01. Understand',
                  desc: 'Capture strengths, learning preferences, and classroom observations in plain language.',
                },
                {
                  step: '02. Personalize',
                  desc: 'Match learners with Reading, Number, Writing, and Focus Worlds plus monthly support plans.',
                },
                {
                  step: '03. Connect',
                  desc: 'Keep teachers, counsellors, parents, and students aligned on the same activity timeline.',
                },
                {
                  step: '04. Grow',
                  desc: 'Celebrate curiosity and effort with non-punitive milestones and timely check-in cues.',
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="rounded-xl border border-slate-200 bg-white p-6"
                >
                  <h3 className="font-display text-lg font-bold text-[#0B1D3A]">{item.step}</h3>
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
              <p className="text-xs font-semibold text-sky-700 uppercase tracking-wider mb-2">
                Our Mission
              </p>
              <h2
                className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1D3A]"
                style={{ textWrap: 'balance' }}
              >
                Making neuroinclusive educational support coordinated, clear, and accessible
              </h2>
              <p className="mt-4 text-base text-slate-600 leading-relaxed">
                Students with Dyslexia, Dyscalculia, Dysgraphia, and ADHD often juggle disconnected
                worksheets at school, stressed homework nights at home, and static reports. 3DA
                NeuroLearning bridges that gap by turning everyday student activities into clear,
                encouraging insights for parents and actionable monthly plans for educators.
              </p>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#0B1D3A]">
                    <ShieldCheck className="h-4 w-4 text-teal-700" aria-hidden="true" />
                    <span>Screening Support Tool</span>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                    Results are not a medical diagnosis. AI-assisted plan drafts remain pending
                    educator review.
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#0B1D3A]">
                    <Compass className="h-4 w-4 text-sky-700" aria-hidden="true" />
                    <span>Built Without Ranking Pressure</span>
                  </div>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                    No leaderboards, punitive streaks, or single global test scores—only steady
                    progress at each student&apos;s pace.
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-[#0B1D3A] p-6 sm:p-8 text-white">
              <div className="flex items-center gap-4">
                <img
                  src="/src/assets/images/buddy_avatar_lumi_1795274053620.jpg"
                  alt="Lumi the 3DA NeuroLearning study companion owl"
                  referrerPolicy="no-referrer"
                  className="h-20 w-20 rounded-xl border-2 border-[#FDE047] object-cover shrink-0"
                />
                <div>
                  <p className="text-xs font-semibold text-[#FDE047]">Meet Lumi · Study Buddy</p>
                  <h3 className="font-display text-lg font-bold text-white">
                    Hints before answers. Steady steps always.
                  </h3>
                </div>
              </div>
              <p className="mt-4 text-sm text-slate-200 leading-relaxed">
                Switch seamlessly between School, Parent, and Student views to see how daily
                practice, screening checks, and educator plans stay connected.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handlePreviewRole('school')}
                  className="rounded-lg border border-white/25 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/20 cursor-pointer whitespace-nowrap"
                >
                  School View
                </button>
                <button
                  type="button"
                  onClick={() => handlePreviewRole('parent')}
                  className="rounded-lg border border-white/25 bg-white/10 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/20 cursor-pointer whitespace-nowrap"
                >
                  Parent View
                </button>
                <button
                  type="button"
                  onClick={() => handlePreviewRole('student')}
                  className="rounded-lg bg-[#FDE047] px-3.5 py-2 text-xs font-bold text-[#0B1D3A] hover:bg-amber-300 cursor-pointer whitespace-nowrap"
                >
                  Student View
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Contact / School Inquiry Form */}
        <section id="contact" className="border-t border-slate-200 bg-slate-50 py-16">
          <div className="mx-auto max-w-3xl px-6">
            <div className="text-center mb-8">
              <p className="text-xs font-semibold text-sky-700 uppercase tracking-wider mb-2">
                Get in Touch
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1D3A]">
                Bring 3DA NeuroLearning to your school community
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Questions from educators, coordinators, or families? Send us a message below.
              </p>
            </div>

            {contactSubmitted ? (
              <div className="rounded-2xl border border-teal-200 bg-teal-50/80 p-8 text-center">
                <CheckCircle2 className="mx-auto h-10 w-10 text-teal-700" aria-hidden="true" />
                <h3 className="mt-3 font-display text-xl font-bold text-[#0B1D3A]">
                  Inquiry Received
                </h3>
                <p className="mt-2 text-sm text-slate-700 max-w-md mx-auto">
                  Thank you, {contactName}. We logged your message for{' '}
                  <span className="font-semibold text-[#0B1D3A]">{contactRole}</span>.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setContactSubmitted(false);
                    setContactMessage('');
                  }}
                  className="mt-5 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer"
                >
                  Send Another Note
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleContactSubmit}
                noValidate
                className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-5"
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
                      className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#0B1D3A] focus:outline-none focus:ring-2 focus:ring-[#0B1D3A]/20"
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
                      placeholder="educator@school.org"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#0B1D3A] focus:outline-none focus:ring-2 focus:ring-[#0B1D3A]/20"
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
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#0B1D3A] focus:outline-none focus:ring-2 focus:ring-[#0B1D3A]/20"
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
                    placeholder="Share a note about your learners or school goals..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#0B1D3A] focus:outline-none focus:ring-2 focus:ring-[#0B1D3A]/20"
                  />
                </div>
                <div className="flex flex-wrap items-center justify-end gap-4">
                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-lg bg-[#0B1D3A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1D3A] cursor-pointer"
                  >
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    Send Inquiry
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </main>

      {/* Official Navy Footer */}
      <footer className="bg-[#0B1D3A] text-white py-12">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-8 border-b border-white/15">
            <div className="md:col-span-5 space-y-2">
              <div className="inline-flex items-center gap-2.5">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[#FDE047] text-xs font-extrabold text-[#0B1D3A]">
                  3DA
                </span>
                <span className="font-display text-lg font-bold tracking-tight">
                  3DA NeuroLearning
                </span>
              </div>
              <p className="text-sm text-slate-300 max-w-sm">
                Learn Your Way. Shine Your Way. Inclusive support tools for Dyslexia, Dyscalculia,
                Dysgraphia, and ADHD.
              </p>
            </div>

            <div className="md:col-span-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Navigation
              </p>
              <ul className="grid grid-cols-2 gap-2 text-sm text-slate-200">
                <li>
                  <a href="#about" className="hover:text-[#FDE047] transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#worlds" className="hover:text-[#FDE047] transition-colors">
                    Learning Worlds
                  </a>
                </li>
                <li>
                  <a href="#roadmap" className="hover:text-[#FDE047] transition-colors">
                    Roadmap
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={handleOpenCheck}
                    className="hover:text-[#FDE047] transition-colors cursor-pointer text-left"
                  >
                    Let&apos;s Check
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={handleStartJourney}
                    className="hover:text-[#FDE047] transition-colors cursor-pointer text-left"
                  >
                    Portal Sign In
                  </button>
                </li>
                <li>
                  <a href="#contact" className="hover:text-[#FDE047] transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div className="md:col-span-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
                Contact
              </p>
              <p className="text-sm text-slate-200">hello@3daneurolearning.org</p>
              <a
                href="#contact"
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#FDE047] hover:underline"
              >
                School Inquiry Form
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-300">
            <p>© 2026 3DA NeuroLearning. All rights reserved.</p>
            <p>Screening support tool. Results are not a medical diagnosis.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
