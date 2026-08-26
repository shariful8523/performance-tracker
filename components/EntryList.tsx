"use client";

import { LearningEntry } from "@/lib/firestore";

interface EntryListProps {
  entries: LearningEntry[];
  onDelete: (entryId: string) => Promise<void>;
  dateLabel?: string;
}

export default function EntryList({ entries, onDelete, dateLabel }: EntryListProps) {
  const heading = `📋 ${dateLabel || "Today"}'s Entries`;
  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {heading}
        </h2>
        <p className="text-gray-500 text-center py-8">
          No entries yet today. Start adding your learning topics! 🚀
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {heading}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">
                Topic
              </th>
              <th className="text-left py-3 px-2 text-sm font-medium text-gray-500">
                Duration
              </th>
              <th className="text-right py-3 px-2 text-sm font-medium text-gray-500">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="py-3 px-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {entry.topic}
                  </span>
                </td>
                <td className="py-3 px-2 text-sm text-gray-700">
                  {entry.duration} min
                </td>
                <td className="py-3 px-2 text-right">
                  <button
                    onClick={() => entry.id && onDelete(entry.id)}
                    className="text-red-500 hover:text-red-700 text-sm hover:bg-red-50 px-2 py-1 rounded transition-colors cursor-pointer"
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
