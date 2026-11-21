import React, { useMemo } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DailyActivity, StudentRecord } from '../../types/neuro';

interface SchoolDashboardChartsProps {
  students: StudentRecord[];
  activities: DailyActivity[];
}

const MODULE_COLORS: Record<string, string> = {
  'Reading World': '#0284C7',
  'Number World': '#0D9488',
  'Writing World': '#D97706',
  'Focus World': '#E11D48',
};

export const SchoolDashboardCharts: React.FC<SchoolDashboardChartsProps> = ({
  students,
  activities,
}) => {
  const profileData = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach((s) => {
      counts[s.supportProfile] = (counts[s.supportProfile] || 0) + 1;
    });
    return Object.entries(counts).map(([profile, count]) => ({
      profile,
      count,
    }));
  }, [students]);

  const moduleData = useMemo(() => {
    const order = ['Reading World', 'Number World', 'Writing World', 'Focus World'];
    const counts: Record<string, number> = {
      'Reading World': 0,
      'Number World': 0,
      'Writing World': 0,
      'Focus World': 0,
    };
    activities.forEach((a) => {
      counts[a.module] = (counts[a.module] || 0) + 1;
    });
    return order.map((module) => ({
      module: module.replace(' World', ''),
      fullModule: module,
      sessions: counts[module] || 0,
      color: MODULE_COLORS[module] || '#4F46E5',
    }));
  }, [activities]);

  const trendData = useMemo(() => {
    // Group activities into 6 five-day buckets across the last 30 days
    const buckets: Record<string, number> = {};
    const sorted = [...activities].sort((a, b) => a.date.localeCompare(b.date));
    sorted.forEach((a) => {
      const label = a.date.slice(5); // MM-DD
      buckets[label] = (buckets[label] || 0) + 1;
    });
    const entries = Object.entries(buckets).slice(-12);
    return entries.map(([date, sessions]) => ({ date, sessions }));
  }, [activities]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Support-Profile Distribution */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-4">
          <h3 className="font-display text-base font-semibold text-slate-900">
            Support-Profile Distribution
          </h3>
          <p className="text-xs text-slate-500">
            {students.length} student profiles · Learning preferences
          </p>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={profileData} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis
                type="category"
                dataKey="profile"
                width={118}
                tick={{ fontSize: 11, fill: '#334155' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" name="Students" fill="#0B1D3A" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 30-Day Activity Trends */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-4">
          <h3 className="font-display text-base font-semibold text-slate-900">
            Recent Activity Trend
          </h3>
          <p className="text-xs text-slate-500">
            Completed &amp; logged sessions by date
          </p>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ left: -16, right: 12, top: 8, bottom: 4 }}>
              <defs>
                <linearGradient id="schoolActivityFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0D9488" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0D9488" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="sessions"
                name="Sessions"
                stroke="#0D9488"
                strokeWidth={2}
                fill="url(#schoolActivityFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Module Usage */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-4">
          <h3 className="font-display text-base font-semibold text-slate-900">
            Learning World Usage
          </h3>
          <p className="text-xs text-slate-500">
            Sessions across Reading, Number, Writing &amp; Focus
          </p>
        </div>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={moduleData} margin={{ left: -16, right: 12, top: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="module" tick={{ fontSize: 11, fill: '#334155' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#64748B' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderColor: '#E2E8F0',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="sessions" name="Sessions" radius={[4, 4, 0, 0]}>
                {moduleData.map((entry) => (
                  <Cell key={entry.module} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
