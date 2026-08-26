"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "@/lib/theme-context";

interface TopicPieChartProps {
  data: { topic: string; totalMinutes: number }[];
}

const COLORS = [
  "#2563eb", // blue-600
  "#8b5cf6", // purple-500
  "#06b6d4", // cyan-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#ec4899", // pink-500
];

export default function TopicPieChart({ data }: TopicPieChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const totalMinutes = data.reduce((sum, d) => sum + d.totalMinutes, 0);
  const primaryTopic = data.length > 0 ? data[0].topic : "";
  const primaryPercent =
    totalMinutes > 0 && data.length > 0
      ? Math.round((data[0].totalMinutes / totalMinutes) * 100)
      : 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors flex flex-col justify-between">
      {/* Header matching reference */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center text-lg shadow-xs">
            🎯
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Topic Distribution
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Time spent per topic
            </p>
          </div>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/60 dark:border-purple-800/40">
          {data.length} {data.length === 1 ? "Topic" : "Topics"}
        </span>
      </div>

      {data.length === 0 ? (
        <p className="text-slate-400 dark:text-slate-500 text-center py-16 text-sm">
          No topic data available for today
        </p>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 h-[250px] pt-2">
          {/* Donut Chart with Center Text */}
          <div className="relative w-full sm:w-1/2 h-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="totalMinutes"
                  nameKey="topic"
                >
                  {data.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      stroke={isDark ? "#0f172a" : "#ffffff"}
                      strokeWidth={3}
                    />
                  ))}
                </Pie>
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
                  formatter={(value) => {
                    const mins = Number(value);
                    const h = Math.floor(mins / 60);
                    const m = mins % 60;
                    return [h > 0 ? `${h}h ${m}m` : `${m}m`, "Time Spent"];
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Centered Donut Percentage and Topic */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                {primaryPercent}%
              </span>
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 max-w-[80px] truncate text-center">
                {primaryTopic}
              </span>
            </div>
          </div>

          {/* Right Custom Legend */}
          <div className="w-full sm:w-1/2 flex flex-col gap-2.5 max-h-[220px] overflow-y-auto pr-1">
            {data.map((item, idx) => {
              const percent =
                totalMinutes > 0
                  ? Math.round((item.totalMinutes / totalMinutes) * 100)
                  : 0;
              return (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs py-1 px-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{
                        backgroundColor: COLORS[idx % COLORS.length],
                      }}
                    />
                    <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                      {item.topic}
                    </span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white ml-2">
                    {percent}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
