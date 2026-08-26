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

interface DailyBarChartProps {
  data: { date: string; totalMinutes: number }[];
}

export default function DailyBarChart({ data }: DailyBarChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        📊 Last 7 Days
      </h3>
      {data.length === 0 ? (
        <p className="text-gray-500 text-center py-8">No data yet</p>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={formatted}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: "#6b7280" }}
              axisLine={{ stroke: "#e5e7eb" }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#6b7280" }}
              axisLine={{ stroke: "#e5e7eb" }}
              label={{
                value: "Minutes",
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 12, fill: "#6b7280" },
              }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
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
