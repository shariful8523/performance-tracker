"use client";

import { LearningEntry } from "@/lib/firestore";
import { confirmDelete } from "@/lib/alerts";

interface EntryListProps {
  entries: LearningEntry[];
  onDelete: (entryId: string) => Promise<void>;
  dateLabel?: string;
}

function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr + "T00:00:00");
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function EntryList({
  entries,
  onDelete,
  dateLabel,
}: EntryListProps) {
  const handleDeleteClick = async (entry: LearningEntry) => {
    if (!entry.id) return;
    const result = await confirmDelete(entry.topic);
    if (result.isConfirmed) {
      await onDelete(entry.id);
    }
  };

  const entryCount = entries.length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-lg shadow-xs">
            📅
          </div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {dateLabel ? `${dateLabel}'s Entries` : "Today's Entries"}
          </h2>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/40">
          {entryCount} {entryCount === 1 ? "Entry" : "Entries"}
        </span>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-10 px-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
          <div className="text-3xl mb-2">📚</div>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No entries found
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Log your first learning topic above to see it appear here!
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
                <th className="py-3 px-3">Date & Time</th>
                <th className="py-3 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {entries.map((entry, index) => {
                const formattedNum = String(index + 1).padStart(2, "0");
                return (
                  <tr
                    key={entry.id || index}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/70 transition-colors group"
                  >
                    {/* Number Badge */}
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

                    {/* Duration Badge */}
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

                    {/* Date & Time */}
                    <td className="py-3.5 px-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 dark:text-slate-300">
                        <span>📅</span>
                        <span>{formatDate(entry.date)}</span>
                      </span>
                    </td>

                    {/* Delete Action Button */}
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={() => handleDeleteClick(entry)}
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
  );
}
