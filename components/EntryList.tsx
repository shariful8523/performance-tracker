"use client";

import { LearningEntry } from "@/lib/firestore";
import { confirmDelete } from "@/lib/alerts";

interface EntryListProps {
  entries: LearningEntry[];
  onDelete: (entryId: string) => Promise<void>;
  dateLabel?: string;
}

export default function EntryList({ entries, onDelete, dateLabel }: EntryListProps) {
  const heading = `📋 ${dateLabel || "Today"}'s Entries`;

  const handleDeleteClick = async (entry: LearningEntry) => {
    if (!entry.id) return;
    const result = await confirmDelete(entry.topic);
    if (result.isConfirmed) {
      await onDelete(entry.id);
    }
  };

  if (entries.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {heading}
        </h2>
        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
          No entries yet today. Start adding your learning topics! 🚀
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        {heading}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                Topic
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                Duration
              </th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-500 dark:text-gray-400">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry.id}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <td className="py-3 px-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300">
                    {entry.topic}
                  </span>
                </td>
                <td className="py-3 px-2 text-sm text-gray-700 dark:text-gray-300">
                  {entry.duration >= 60
                    ? `${Math.floor(entry.duration / 60)}h ${entry.duration % 60}m`
                    : `${entry.duration}m`}
                </td>
                <td className="py-3 px-2 text-right">
                  <button
                    onClick={() => handleDeleteClick(entry)}
                    className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm hover:bg-red-50 dark:hover:bg-red-900/30 px-2 py-1 rounded transition-colors cursor-pointer"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
