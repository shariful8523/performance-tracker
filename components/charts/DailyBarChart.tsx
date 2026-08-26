"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { useTheme } from "@/lib/theme-context";

interface DailyBarChartProps {
  data: { date: string; totalMinutes: number }[];
}

export default function DailyBarChart({ data }: DailyBarChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const totalWeekMinutes = data.reduce((sum, d) => sum + d.totalMinutes, 0);

  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
    }),
    displayValue: d.totalMinutes > 0 ? `${d.totalMinutes}m` : "",
  }));

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors flex flex-col justify-between">
      {/* Header matching reference */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg shadow-xs">
            📊
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Last 7 Days
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Daily study minutes
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/40">
          Total: {totalWeekMinutes}m
        </span>
      </div>

      {data.length === 0 ? (
        <p className="text-slate-400 dark:text-slate-500 text-center py-16 text-sm">
          No study data for the last 7 days
        </p>
      ) : (
        <div className="h-[250px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={formatted} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? "#334155" : "#f1f5f9"}
                vertical={false}
              />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }}
                axisLine={{ stroke: isDark ? "#334155" : "#e2e8f0" }}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: isDark ? "#94a3b8" : "#64748b" }}
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
                  color: isDark ? "#60a5fa" : "#2563eb",
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
              <Bar
                dataKey="totalMinutes"
                fill="url(#barGradient)"
                radius={[8, 8, 0, 0]}
                maxBarSize={38}
              >
                <LabelList
                  dataKey="displayValue"
                  position="top"
                  style={{
                    fill: isDark ? "#93c5fd" : "#2563eb",
                    fontSize: 10,
                    fontWeight: 700,
                  }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
