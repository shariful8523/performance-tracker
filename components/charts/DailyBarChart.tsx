"use client";

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

interface DailyBarChartProps {
  data: { date: string; totalMinutes: number }[];
}

export default function DailyBarChart({ data }: DailyBarChartProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        📊 Last 7 Days
      </h3>
      {data.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">No data yet</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={formatted}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={isDark ? "#334155" : "#f0f0f0"}
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: isDark ? "#94a3b8" : "#6b7280" }}
              axisLine={{ stroke: isDark ? "#334155" : "#e5e7eb" }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: isDark ? "#94a3b8" : "#6b7280" }}
              axisLine={{ stroke: isDark ? "#334155" : "#e5e7eb" }}
              label={{
                value: "Minutes",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 12, fill: isDark ? "#94a3b8" : "#6b7280" },
              }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: isDark ? "#1e293b" : "#ffffff",
                borderColor: isDark ? "#334155" : "#e2e8f0",
                color: isDark ? "#f8fafc" : "#0f172a",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.2)",
              }}
              itemStyle={{
                color: isDark ? "#60a5fa" : "#2563eb",
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
                return [h > 0 ? `${h}h ${m}m` : `${m}m`, "Study Time"];
              }}
            />
            <Bar
              dataKey="totalMinutes"
              fill="#3b82f6"
              radius={[6, 6, 0, 0]}
              maxBarSize={50}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
