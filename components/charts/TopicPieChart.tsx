"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useTheme } from "@/lib/theme-context";

interface TopicPieChartProps {
  data: { topic: string; totalMinutes: number }[];
}

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#f97316",
  "#14b8a6",
  "#6366f1",
];

export default function TopicPieChart({ data }: TopicPieChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        🎯 Topic Distribution
      </h3>
      {data.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">No data yet</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={4}
              dataKey="totalMinutes"
              nameKey="topic"
              label={({ name, percent }) =>
                `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`
              }
              labelLine={{ stroke: isDark ? "#64748b" : "#9ca3af" }}
            >
              {data.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "#1e293b" : "#ffffff",
                borderColor: isDark ? "#334155" : "#e2e8f0",
                color: isDark ? "#f8fafc" : "#0f172a",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.2)",
              }}
              itemStyle={{
                color: isDark ? "#f8fafc" : "#0f172a",
                fontWeight: 500,
              }}
              labelStyle={{
                color: isDark ? "#e2e8f0" : "#1e293b",
                fontWeight: 600,
              }}
              formatter={(value) => {
                const mins = Number(value);
                const h = Math.floor(mins / 60);
                const m = mins % 60;
                return [h > 0 ? `${h}h ${m}m` : `${m}m`, "Time Spent"];
              }}
            />
            <Legend
              formatter={(value) => (
                <span className="text-gray-700 dark:text-gray-300 text-xs font-medium">
                  {value}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
