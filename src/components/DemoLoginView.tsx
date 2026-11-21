import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Building2, GraduationCap, HeartHandshake, Lock } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import type { UserRole } from '../types/neuro';

const PORTAL_CREDENTIALS: Record<
  UserRole,
  { email: string; password: string; title: string; subtitle: string; icon: React.ReactNode }
> = {
  school: {
    email: 'school@3da.org',
    password: 'SchoolPortal123',
    title: 'School & Counsellor Portal',
    subtitle: 'Manage student profiles, observations, analytics, and monthly support plans.',
    icon: <Building2 className="h-5 w-5 text-[#0B1D3A]" aria-hidden="true" />,
  },
  parent: {
    email: 'parent@3da.org',
    password: 'ParentPortal123',
    title: 'Parent Portal',
    subtitle: 'Track monthly & daily learning rhythms, celebrate effort milestones, and connect with educators.',
    icon: <HeartHandshake className="h-5 w-5 text-teal-700" aria-hidden="true" />,
  },
  student: {
    email: 'student@3da.org',
    password: 'StudentPortal123',
    title: 'Student Learning Worlds',
    subtitle: 'Explore interactive Reading, Number, Writing, and Focus tools with Lumi.',
    icon: <GraduationCap className="h-5 w-5 text-amber-700" aria-hidden="true" />,
  },
};

export const DemoLoginView: React.FC = () => {
  const { state, activeStudentId, setActiveStudentId, setActiveRole, setRoute } = useAppData();
  const [selectedRole, setSelectedRole] = useState<UserRole>('school');
  const [email, setEmail] = useState(PORTAL_CREDENTIALS.school.email);
  const [password, setPassword] = useState(PORTAL_CREDENTIALS.school.password);
  const [error, setError] = useState('');

  const handleSelectRoleCard = (role: UserRole) => {
    setSelectedRole(role);
    setEmail(PORTAL_CREDENTIALS[role].email);
    setPassword(PORTAL_CREDENTIALS[role].password);
    setError('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const expected = PORTAL_CREDENTIALS[selectedRole];
    if (email.trim().toLowerCase() !== expected.email || password !== expected.password) {
      setError(
        `Please check credentials or click Open Portal directly for ${expected.title}.`
      );
      return;
    }
    setActiveRole(selectedRole);
    setRoute('portal');
  };

  const handleQuickExplore = (role: UserRole) => {
    setActiveRole(role);
    setRoute('portal');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-8 px-6 py-4">
          <button
            type="button"
            onClick={() => setRoute('landing')}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-[#0B1D3A] cursor-pointer whitespace-nowrap"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Home
          </button>
          <span className="font-display text-lg font-bold tracking-tight text-[#0B1D3A] whitespace-nowrap">
            3DA NeuroLearning
          </span>
          <span className="text-xs font-medium text-slate-500 whitespace-nowrap hidden sm:inline">
            Workspace Portal Access
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-10 lg:py-14">
        <div className="max-w-2xl mb-8">
          <p className="text-xs font-semibold text-sky-700 uppercase tracking-wider mb-1">
            Role-Based Access
          </p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-[#0B1D3A]">
            Choose a portal to enter 3DA NeuroLearning
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            All three portals share the same synchronized workspace. Activities and screening checks
            completed in Student view immediately update Parent and School views.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: 3 Role Cards */}
          <div className="lg:col-span-7 space-y-4">
            {(['school', 'parent', 'student'] as UserRole[]).map((role) => {
              const info = PORTAL_CREDENTIALS[role];
              const isSelected = selectedRole === role;
              return (
                <div
                  key={role}
                  className={`rounded-xl border p-5 transition-colors ${
                    isSelected
                      ? 'border-[#0B1D3A] bg-white ring-2 ring-[#0B1D3A]/15'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="mt-0.5 rounded-lg border border-slate-200 bg-slate-50 p-2.5 shrink-0">
                        {info.icon}
                      </div>
                      <div>
                        <h2 className="font-display text-lg font-semibold text-[#0B1D3A]">
                          {info.title}
                        </h2>
                        <p className="mt-1 text-sm text-slate-600 leading-relaxed">
                          {info.subtitle}
                        </p>
                        <p className="mt-2 font-mono text-xs text-slate-500">
                          Sign-in ID: {info.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex sm:flex-col gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleSelectRoleCard(role)}
                        className={`rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                          isSelected
                            ? 'bg-sky-50 text-[#0B1D3A] border border-sky-200'
                            : 'border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected ? 'Selected' : 'Select Role'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickExplore(role)}
                        className="inline-flex items-center justify-center gap-1 rounded-lg bg-[#0B1D3A] px-3.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 cursor-pointer whitespace-nowrap"
                      >
                        Open Portal
                        <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right: Credential Form + Student Context Selector */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-1">
                <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Portal Sign-In</span>
              </div>
              <h2 className="font-display text-xl font-semibold text-[#0B1D3A]">
                Sign in to {PORTAL_CREDENTIALS[selectedRole].title.replace(' Portal', '')}
              </h2>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {error && (
                <div
                  role="alert"
                  className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs text-rose-800"
                >
                  {error}
                </div>
              )}
              <div>
                <label
                  htmlFor="portal-email"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Account Email
                </label>
                <input
                  id="portal-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-sm text-slate-900 focus:border-[#0B1D3A] focus:outline-none focus:ring-2 focus:ring-[#0B1D3A]/20"
                />
              </div>
              <div>
                <label
                  htmlFor="portal-password"
                  className="block text-xs font-semibold text-slate-700 mb-1.5"
                >
                  Password
                </label>
                <input
                  id="portal-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 font-mono text-sm text-slate-900 focus:border-[#0B1D3A] focus:outline-none focus:ring-2 focus:ring-[#0B1D3A]/20"
                />
              </div>

              {(selectedRole === 'parent' || selectedRole === 'student') && (
                <div>
                  <label
                    htmlFor="portal-student-select"
                    className="block text-xs font-semibold text-slate-700 mb-1.5"
                  >
                    Active Student Profile
                  </label>
                  <select
                    id="portal-student-select"
                    value={activeStudentId}
                    onChange={(e) => setActiveStudentId(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-[#0B1D3A] focus:outline-none focus:ring-2 focus:ring-[#0B1D3A]/20"
                  >
                    {state.students.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.id} · {st.name} ({st.className} · {st.supportProfile})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#0B1D3A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0B1D3A] cursor-pointer"
              >
                Enter Portal
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </form>

            <div className="pt-4 border-t border-slate-100 text-xs text-slate-500 leading-relaxed">
              Screening support tool. Results are not a medical diagnosis.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
