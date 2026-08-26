"use client";

import { useState } from "react";

interface AddEntryFormProps {
  onAdd: (topic: string, duration: number, date: string) => Promise<void>;
  selectedDate: string;
}

export default function AddEntryForm({ onAdd, selectedDate }: AddEntryFormProps) {
  const [topic, setTopic] = useState("");
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("0");
  const [date, setDate] = useState(selectedDate);
  const [loading, setLoading] = useState(false);

  // Sync date when parent's selectedDate changes
  const handleDateFromParent = selectedDate;
  if (date !== handleDateFromParent && !loading) {
    // Only auto-sync if user hasn't manually changed it
  }

  const totalMinutes = parseInt(hours || "0") * 60 + parseInt(minutes || "0");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim() || totalMinutes <= 0) return;

    setLoading(true);
    try {
      await onAdd(topic.trim(), totalMinutes, date);
      setTopic("");
      setHours("0");
      setMinutes("0");
      setDate(selectedDate);
    } catch (error) {
      console.error("Error adding entry:", error);
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        ➕ Add Learning Entry
      </h2>
      <div className="flex flex-col gap-4">
        {/* Row 1: Topic */}
        <input
          type="text"
          placeholder="Topic (e.g., React, DSA, English)"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 placeholder-gray-400"
          required
        />

        {/* Row 2: Duration (Hours + Minutes) + Date + Add Button */}
        <div className="flex flex-col sm:flex-row gap-3 items-end">
          {/* Duration */}
          <div className="flex gap-2 items-end">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Hours</label>
              <select
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-20 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 bg-white cursor-pointer"
              >
                {Array.from({ length: 25 }, (_, i) => (
                  <option key={i} value={i}>
                    {i}h
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Minutes
              </label>
              <select
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                className="w-22 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 bg-white cursor-pointer"
              >
                {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                  <option key={m} value={m}>
                    {m}m
                  </option>
                ))}
              </select>
            </div>
            {totalMinutes > 0 && (
              <span className="text-sm text-blue-600 font-medium pb-2.5">
                = {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
              </span>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Date</label>
            <input
              type="date"
              value={date}
              max={today}
              onChange={(e) => setDate(e.target.value)}
              className="px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-gray-900 cursor-pointer"
            />
          </div>

          {/* Add Button */}
          <button
            type="submit"
            disabled={loading || totalMinutes <= 0}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium cursor-pointer whitespace-nowrap"
          >
            {loading ? "Adding..." : "Add Entry"}
          </button>
        </div>
      </div>
    </form>
  );
}
