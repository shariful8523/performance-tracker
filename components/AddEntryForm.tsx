"use client";

import { useState } from "react";

interface AddEntryFormProps {
  onAdd: (topic: string, duration: number, date: string) => Promise<void>;
  selectedDate: string;
}

export default function AddEntryForm({
  onAdd,
  selectedDate,
}: AddEntryFormProps) {
  const [topic, setTopic] = useState("");
  const [hours, setHours] = useState("0");
  const [minutes, setMinutes] = useState("0");
  const [date, setDate] = useState(selectedDate);
  const [loading, setLoading] = useState(false);

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

  const today = (() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  })();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#172554] via-[#1e1b4b] to-[#3b0764] p-6 sm:p-7 text-white shadow-xl shadow-indigo-950/20 border border-blue-400/20">
      {/* Background radial glow */}
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Decorative Book Illustration on Right (visible on desktop) */}
      <div className="hidden lg:flex absolute right-6 bottom-4 flex-col items-center pointer-events-none select-none opacity-90">
        {/* Floating Icons */}
        <div className="flex gap-4 mb-2">
          <span className="w-8 h-8 rounded-full bg-blue-500/30 border border-blue-300/40 flex items-center justify-center text-xs font-mono text-cyan-300 shadow-md">
            &lt;/&gt;
          </span>
          <span className="w-8 h-8 rounded-full bg-indigo-500/30 border border-indigo-300/40 flex items-center justify-center text-xs text-indigo-200 shadow-md">
            🧪
          </span>
          <span className="w-8 h-8 rounded-full bg-amber-500/30 border border-amber-300/40 flex items-center justify-center text-xs text-amber-200 shadow-md">
            💡
          </span>
        </div>
        {/* 3D Book Graphic */}
        <div className="text-6xl drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]">
          📖
        </div>
      </div>

      <div className="relative z-10 max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-lg shadow-md shadow-purple-500/30">
            ✍️
          </div>
          <div>
            <h2 className="text-lg font-bold text-white leading-tight">
              Add Learning Entry
            </h2>
            <p className="text-xs text-blue-200/80">
              Log your study session and stay consistent
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Topic Input with Glass effect */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-blue-200/70">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Topic (e.g., React, DSA, English...)"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 focus:border-blue-400 rounded-2xl text-sm text-white placeholder-blue-200/60 outline-none backdrop-blur-md transition-all shadow-inner"
              required
            />
          </div>

          {/* Row 2: Hours, Minutes, Date & Submit Button */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            {/* Hours Select */}
            <div>
              <label className="block text-[11px] font-semibold text-blue-200/80 mb-1.5 ml-1">
                Hours <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <select
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-400 backdrop-blur-md cursor-pointer transition-all appearance-none"
                >
                  {Array.from({ length: 25 }, (_, i) => (
                    <option key={i} value={i} className="bg-[#1e1b4b] text-white">
                      ⏳ {i}h
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-blue-200/60 text-xs">
                  ▼
                </div>
              </div>
            </div>

            {/* Minutes Select */}
            <div>
              <label className="block text-[11px] font-semibold text-blue-200/80 mb-1.5 ml-1">
                Minutes <span className="text-cyan-400">*</span>
              </label>
              <div className="relative">
                <select
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-400 backdrop-blur-md cursor-pointer transition-all appearance-none"
                >
                  {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map((m) => (
                    <option key={m} value={m} className="bg-[#1e1b4b] text-white">
                      ⏱️ {m}m
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-blue-200/60 text-xs">
                  ▼
                </div>
              </div>
            </div>

            {/* Date Select */}
            <div>
              <label className="block text-[11px] font-semibold text-blue-200/80 mb-1.5 ml-1">
                Date <span className="text-cyan-400">*</span>
              </label>
              <input
                type="date"
                value={date}
                max={today}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-400 backdrop-blur-md cursor-pointer transition-all"
              />
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading || totalMinutes <= 0}
                className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-purple-900/40 hover:shadow-purple-900/60 transition-all transform active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <span className="inline-block animate-spin">⏳</span>
                ) : (
                  <>
                    <span>+</span>
                    <span>Add Entry</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Helper Preview text */}
          {totalMinutes > 0 && (
            <div className="text-xs text-cyan-300/90 font-medium pl-1">
              ✨ Total duration:{" "}
              <span className="font-bold text-white">
                {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
              </span>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
