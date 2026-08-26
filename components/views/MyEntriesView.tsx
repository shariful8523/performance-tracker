"use client";

import { useState, useMemo } from "react";
import { LearningEntry } from "@/lib/firestore";
import { confirmDelete, showToast } from "@/lib/alerts";

interface MyEntriesViewProps {
  entries: LearningEntry[];
  onDelete: (entryId: string) => Promise<void>;
  onRefresh: () => Promise<void>;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function MyEntriesView({
  entries,
  onDelete,
}: MyEntriesViewProps) {
  const [filterPeriod, setFilterPeriod] = useState<"all" | "week" | "month">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTopic, setSelectedTopic] = useState<string>("all");

  // Get unique topics for dropdown
  const uniqueTopics = useMemo(() => {
    return Array.from(new Set(entries.map((e) => e.topic))).sort();
  }, [entries]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split("T")[0];

    const weekAgo = new Date();
    weekAgo.setDate(now.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split("T")[0];

    const monthAgo = new Date();
    monthAgo.setDate(now.getDate() - 30);
    const monthAgoStr = monthAgo.toISOString().split("T")[0];

    return entries.filter((entry) => {
      // Period filter
      if (filterPeriod === "week" && (entry.date < weekAgoStr || entry.date > todayStr)) {
        return false;
      }
      if (filterPeriod === "month" && (entry.date < monthAgoStr || entry.date > todayStr)) {
        return false;
      }

      // Topic filter
      if (selectedTopic !== "all" && entry.topic !== selectedTopic) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          entry.topic.toLowerCase().includes(query) ||
          entry.date.includes(query)
        );
      }

      return true;
    });
  }, [entries, filterPeriod, selectedTopic, searchQuery]);

  const totalFilteredMinutes = useMemo(() => {
    return filteredEntries.reduce((sum, e) => sum + e.duration, 0);
  }, [filteredEntries]);

  const handleDelete = async (entry: LearningEntry) => {
    if (!entry.id) return;
    const result = await confirmDelete(entry.topic);
    if (result.isConfirmed) {
      await onDelete(entry.id);
    }
  };

  // Export data to CSV
  const exportToCSV = () => {
    if (filteredEntries.length === 0) {
      showToast("warning", "No entries to export");
      return;
    }
    const headers = ["Index,Topic,Duration (Minutes),Date"];
    const rows = filteredEntries.map(
      (e, idx) => `"${idx + 1}","${e.topic}","${e.duration}","${e.date}"`
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `study_entries_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("success", "Exported CSV successfully");
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My Learning Entries 📋
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse, search, filter and export your complete learning history.
          </p>
        </div>

        {/* Export Button */}
        <button
          onClick={exportToCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 dark:hover:text-white transition-colors shadow-xs cursor-pointer self-start sm:self-center"
        >
          <span>📥</span>
          <span>Export to CSV</span>
        </button>
      </div>

      {/* Summary Mini-Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Total Logged Entries
          </p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {filteredEntries.length}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Filtered Total Study Time
          </p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">
            {formatDuration(totalFilteredMinutes)}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Distinct Topics
          </p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {new Set(filteredEntries.map((e) => e.topic)).size}
          </p>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Period Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full md:w-auto">
          <button
            onClick={() => setFilterPeriod("all")}
            className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterPeriod === "all"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => setFilterPeriod("week")}
            className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterPeriod === "week"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setFilterPeriod("month")}
            className={`flex-1 md:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterPeriod === "month"
                ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            Last 30 Days
          </button>
        </div>

        {/* Search & Topic Selector */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
          {/* Topic Select */}
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-full sm:w-44 px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer"
          >
            <option value="all" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">All Topics</option>
            {uniqueTopics.map((topic) => (
              <option key={topic} value={topic} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                {topic}
              </option>
            ))}
          </select>

          {/* Search Input */}
          <input
            type="text"
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-52 px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Entries Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-16 px-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-base font-bold text-slate-700 dark:text-slate-300">
              No entries found
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Try adjusting your search query or filters.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-3">#</th>
                  <th className="py-3 px-3">Topic</th>
                  <th className="py-3 px-3">Duration</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredEntries.map((entry, index) => {
                  const formattedNum = String(index + 1).padStart(2, "0");
                  return (
                    <tr
                      key={entry.id || index}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors group"
                    >
                      {/* Number */}
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                          {formattedNum}
                        </span>
                      </td>

                      {/* Topic Badge */}
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                          <span>📖</span>
                          <span>{entry.topic}</span>
                        </span>
                      </td>

                      {/* Duration */}
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-800 dark:text-slate-200">
                          <span className="text-purple-500">⏱️</span>
                          <span>
                            {entry.duration >= 60
                              ? `${Math.floor(entry.duration / 60)}h ${
                                  entry.duration % 60
                                }m`
                              : `${entry.duration} min`}
                          </span>
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                          <span>📅</span>
                          <span>{formatDate(entry.date)}</span>
                        </span>
                      </td>

                      {/* Delete */}
                      <td className="py-3.5 px-3 text-right">
                        <button
                          onClick={() => handleDelete(entry)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/80 transition-colors cursor-pointer"
                          title="Delete entry"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
