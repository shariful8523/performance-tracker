"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "@/lib/theme-context";

interface TrendLineChartProps {
  data: { date: string; totalMinutes: number }[];
}

export default function TrendLineChart({ data }: TrendLineChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const totalStudyMinutes = data.reduce((sum, d) => sum + d.totalMinutes, 0);
  const activeDaysCount = data.filter((d) => d.totalMinutes > 0).length;

  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
      {/* Header matching reference */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg shadow-xs">
            📈
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              30-Day Trend
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Your study activity over the last 30 days
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40">
            Total Study: {totalStudyMinutes}m
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/40">
            Active Days: {activeDaysCount}/30
          </span>
        </div>
      </div>

      {data.length === 0 ? (
        <p className="text-slate-400 dark:text-slate-500 text-center py-16 text-sm">
          No 30-day activity data recorded yet
        </p>
      ) : (
        <div className="h-[260px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={formatted} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? "#334155" : "#f1f5f9"}
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: isDark ? "#94a3b8" : "#64748b" }}
                axisLine={{ stroke: isDark ? "#334155" : "#e2e8f0" }}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: isDark ? "#94a3b8" : "#64748b" }}
                axisLine={false}
                tickLine={false}
                unit="m"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? "#0f172a" : "#ffffff",
                  borderColor: isDark ? "#334155" : "#e2e8f0",
                  color: isDark ? "#f8fafc" : "#0f172a",
                  borderRadius: "12px",
                  boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                }}
                itemStyle={{
                  color: isDark ? "#a78bfa" : "#7c3aed",
                  fontWeight: 600,
                }}
                labelStyle={{
                  color: isDark ? "#e2e8f0" : "#1e293b",
                  fontWeight: 600,
                  marginBottom: "4px",
                }}
                formatter={(value) => {
                  const mins = Number(value);
                  const h = Math.floor(mins / 60);
                  const m = mins % 60;
                  return [h > 0 ? `${h}h ${m}m` : `${m}m`, "Study Time"];
                }}
              />
              <Area
                type="monotone"
                dataKey="totalMinutes"
                stroke="#8b5cf6"
                strokeWidth={3}
                fill="url(#trendGradient)"
                dot={{
                  fill: "#8b5cf6",
                  stroke: isDark ? "#0f172a" : "#ffffff",
                  strokeWidth: 2,
                  r: 4,
                }}
                activeDot={{
                  r: 6,
                  fill: "#6366f1",
                  stroke: "#ffffff",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
