"use client";

import { useMemo } from "react";
import { LearningEntry } from "@/lib/firestore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "@/lib/theme-context";

interface AnalyticsViewProps {
  entries: LearningEntry[];
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function AnalyticsView({ entries }: AnalyticsViewProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Calculate All-time stats
  const totalMinutes = useMemo(() => {
    return entries.reduce((sum, e) => sum + e.duration, 0);
  }, [entries]);

  // Topic totals
  const topicStats = useMemo(() => {
    const map: Record<string, number> = {};
    entries.forEach((e) => {
      map[e.topic] = (map[e.topic] || 0) + e.duration;
    });
    return Object.entries(map)
      .map(([topic, totalMinutes]) => ({ topic, totalMinutes }))
      .sort((a, b) => b.totalMinutes - a.totalMinutes);
  }, [entries]);

  const topTopic = topicStats.length > 0 ? topicStats[0].topic : "None";

  // Day of Week Distribution
  const dayOfWeekData = useMemo(() => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const counts = [0, 0, 0, 0, 0, 0, 0];

    entries.forEach((e) => {
      try {
        const d = new Date(e.date + "T00:00:00");
        const dayIndex = d.getDay();
        counts[dayIndex] += e.duration;
      } catch {
        // ignore
      }
    });

    return days.map((day, idx) => ({
      day,
      minutes: counts[idx],
    }));
  }, [entries]);

  // Unique active days count
  const uniqueDays = useMemo(() => {
    return new Set(entries.map((e) => e.date)).size;
  }, [entries]);

  const dailyAverage = uniqueDays > 0 ? Math.round(totalMinutes / uniqueDays) : 0;

  // Badges calculations
  const badges = [
    {
      title: "First Step",
      desc: "Logged your first study session",
      icon: "🌱",
      unlocked: entries.length >= 1,
    },
    {
      title: "Consistency Starter",
      desc: "Studied on 3 different days",
      icon: "🔥",
      unlocked: uniqueDays >= 3,
    },
    {
      title: "Deep Focus",
      desc: "Logged over 5 hours of learning",
      icon: "🎯",
      unlocked: totalMinutes >= 300,
    },
    {
      title: "Knowledge Explorer",
      desc: "Learned 3 distinct topics",
      icon: "🚀",
      unlocked: topicStats.length >= 3,
    },
  ];

  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Performance Analytics 📊
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Deep insights, trends, and milestone achievements from your learning journey.
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">⏳</span>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Study Time
            </p>
          </div>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400">
            {formatDuration(totalMinutes)}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🔥</span>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Active Study Days
            </p>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {uniqueDays} Days
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">🏆</span>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Top Studied Topic
            </p>
          </div>
          <p className="text-xl font-bold text-purple-600 dark:text-purple-400 truncate">
            {topTopic}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📈</span>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Daily Average
            </p>
          </div>
          <p className="text-2xl font-black text-amber-500">
            {formatDuration(dailyAverage)}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Day of the Week Chart */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg">
              📅
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Study Time by Day of Week
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Total minutes logged for each weekday
              </p>
            </div>
          </div>

          <div className="h-[240px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayOfWeekData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="dayGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#334155" : "#f1f5f9"} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }} axisLine={{ stroke: isDark ? "#334155" : "#e2e8f0" }} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }} axisLine={false} tickLine={false} unit="m" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDark ? "#0f172a" : "#ffffff",
                    borderColor: isDark ? "#334155" : "#e2e8f0",
                    color: isDark ? "#f8fafc" : "#0f172a",
                    borderRadius: "12px",
                  }}
                  formatter={(val) => [`${val} min`, "Time"]}
                />
                <Bar dataKey="minutes" fill="url(#dayGradient)" radius={[8, 8, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Topic Breakdown List */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center text-lg">
              🎯
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                All-Time Topic Rankings
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Where you spend most of your learning energy
              </p>
            </div>
          </div>

          <div className="space-y-3 max-h-[240px] overflow-y-auto pr-1">
            {topicStats.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10">No topic data logged yet</p>
            ) : (
              topicStats.map((item, idx) => {
                const percent =
                  totalMinutes > 0
                    ? Math.round((item.totalMinutes / totalMinutes) * 100)
                    : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-800 dark:text-slate-200">{item.topic}</span>
                      <span className="text-slate-500 dark:text-slate-400">{formatDuration(item.totalMinutes)} ({percent}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Milestones & Achievements 🏅
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {badges.map((badge, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-2xl border transition-all flex items-start gap-3.5 ${
                badge.unlocked
                  ? "bg-gradient-to-br from-amber-500/10 to-orange-500/5 border-amber-500/30 text-slate-900 dark:text-white shadow-xs"
                  : "bg-slate-50/50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 opacity-50 grayscale"
              }`}
            >
              <div className="text-3xl p-1 bg-white/60 dark:bg-slate-800/60 rounded-xl shadow-xs">
                {badge.icon}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold">{badge.title}</h4>
                  {badge.unlocked && <span className="text-[10px] text-amber-500">✓</span>}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-tight">
                  {badge.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
