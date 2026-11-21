import React, { useState } from 'react';
import { LogOut, Menu, RotateCcw, X } from 'lucide-react';
import { useAppData } from '../context/AppDataContext';
import type { UserRole } from '../types/neuro';

export interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface PortalShellProps {
  roleLabel: string;
  navItems: NavItem[];
  activeNavId: string;
  onSelectNav: (id: string) => void;
  breadcrumb: string;
  children: React.ReactNode;
  headerRightExtra?: React.ReactNode;
}

export const PortalShell: React.FC<PortalShellProps> = ({
  roleLabel,
  navItems,
  activeNavId,
  onSelectNav,
  breadcrumb,
  children,
  headerRightExtra,
}) => {
  const {
    activeRole,
    setActiveRole,
    setRoute,
    resetDemoData,
    geminiConfigured,
    accessibilityPrefs,
  } = useAppData();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [resetConfirmed, setResetConfirmed] = useState(false);

  const handleReset = () => {
    resetDemoData();
    setResetConfirmed(true);
    setTimeout(() => setResetConfirmed(false), 2400);
  };

  const handleSwitchRole = (role: UserRole) => {
    setActiveRole(role);
  };

  return (
    <div
      className={`min-h-screen bg-[#FAF9F6] text-slate-900 flex ${
        accessibilityPrefs.reducedMotion ? 'reduced-motion' : ''
      }`}
    >
      {/* Desktop Sidebar */}
      <aside className="no-print hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 border-r border-slate-200 bg-white">
        <div className="px-5 py-5 border-b border-slate-100">
          <button
            type="button"
            onClick={() => setRoute('landing')}
            className="font-display text-lg font-bold tracking-tight text-slate-900 hover:text-indigo-700 transition-colors text-left cursor-pointer"
          >
            3DA NeuroLearning
          </button>
          <p className="mt-0.5 text-xs text-slate-500">{roleLabel}</p>
        </div>

        <nav aria-label="Portal navigation" className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = item.id === activeNavId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectNav(item.id)}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {item.icon}
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-3">
          <div>
            <p className="text-[11px] font-medium text-slate-500 mb-1.5">
              Explore demo as...
            </p>
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1">
              {(['school', 'parent', 'student'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => handleSwitchRole(role)}
                  className={`rounded-md py-1.5 text-xs font-semibold capitalize transition-colors cursor-pointer ${
                    activeRole === role
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              {resetConfirmed ? 'Reset done' : 'Reset demo data'}
            </button>
            <button
              type="button"
              onClick={() => setRoute('login')}
              className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Switch
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <div className="no-print fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          <div className="relative z-10 w-72 max-w-[85vw] bg-white h-full flex flex-col border-r border-slate-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <span className="font-display text-lg font-bold text-slate-900">
                3DA NeuroLearning
              </span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const active = item.id === activeNavId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onSelectNav(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium cursor-pointer ${
                      active
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="p-4 border-t border-slate-100 space-y-3">
              <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1">
                {(['school', 'parent', 'student'] as UserRole[]).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      handleSwitchRole(role);
                      setSidebarOpen(false);
                    }}
                    className={`rounded-md py-1.5 text-xs font-semibold capitalize cursor-pointer ${
                      activeRole === role ? 'bg-white text-indigo-700' : 'text-slate-600'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 text-slate-600 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                  Reset demo data
                </button>
                <button
                  type="button"
                  onClick={() => setRoute('landing')}
                  className="text-indigo-700 font-medium cursor-pointer"
                >
                  Landing Page
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 py-3.5">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                aria-label="Open navigation menu"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden rounded-lg border border-slate-200 bg-white p-2 text-slate-700 hover:bg-slate-50 cursor-pointer shrink-0"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{breadcrumb}</p>
                <p className="text-xs text-slate-500 truncate">
                  Demo data — fictional · Educational support only ·{' '}
                  {geminiConfigured ? 'Gemini AI connected' : 'Simulated AI demo mode'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {headerRightExtra}
              <div className="hidden md:flex items-center gap-1 rounded-lg bg-slate-100 p-1">
                {(['school', 'parent', 'student'] as UserRole[]).map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleSwitchRole(role)}
                    className={`rounded-md px-2.5 py-1 text-xs font-semibold capitalize transition-colors cursor-pointer whitespace-nowrap ${
                      activeRole === role
                        ? 'bg-white text-indigo-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
};
