"use client";

import { useAuth } from "@/lib/auth-context";
import { useTheme } from "@/lib/theme-context";
import { confirmSignOut, showToast } from "@/lib/alerts";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function SettingsView() {
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [goalHours, setGoalHours] = useState<number>(2);
  const [goalMinutes, setGoalMinutes] = useState<number>(0);
  const [notifications, setNotifications] = useState<boolean>(true);
  const [testingReminder, setTestingReminder] = useState<boolean>(false);

  useEffect(() => {
    const loadGoal = async () => {
      if (user) {
        try {
          const { getUserPreferences } = await import("@/lib/firestore");
          const prefs = await getUserPreferences(user.uid);
          if (prefs?.dailyGoal && prefs.dailyGoal > 0) {
            setGoalHours(Math.floor(prefs.dailyGoal / 60));
            setGoalMinutes(prefs.dailyGoal % 60);
            localStorage.setItem("daily_study_goal", String(prefs.dailyGoal));
          }
          if (prefs && "remindersEnabled" in prefs) {
            setNotifications(Boolean((prefs as Record<string, unknown>).remindersEnabled));
          }
        } catch (err) {
          console.error("Could not load preferences from Firestore:", err);
        }
      }
      const savedGoal = localStorage.getItem("daily_study_goal");
      if (savedGoal) {
        const total = parseInt(savedGoal, 10);
        if (!isNaN(total) && total > 0) {
          setGoalHours(Math.floor(total / 60));
          setGoalMinutes(total % 60);
        }
      }
    };
    loadGoal();
  }, [user]);

  const totalGoalMinutes = goalHours * 60 + goalMinutes;

  const handleSaveGoal = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (totalGoalMinutes <= 0) {
      showToast("warning", "Please set a goal greater than 0 minutes");
      return;
    }
    localStorage.setItem("daily_study_goal", String(totalGoalMinutes));
    if (user) {
      try {
        const { saveUserPreferences } = await import("@/lib/firestore");
        await saveUserPreferences(user.uid, { dailyGoal: totalGoalMinutes });
      } catch (err) {
        console.error("Could not sync goal to cloud:", err);
      }
    }
    showToast(
      "success",
      `Daily goal saved: ${goalHours > 0 ? `${goalHours}h ` : ""}${goalMinutes}m / day`
    );
  };

  const handlePreset = async (hours: number, minutes: number = 0) => {
    setGoalHours(hours);
    setGoalMinutes(minutes);
    const total = hours * 60 + minutes;
    localStorage.setItem("daily_study_goal", String(total));
    if (user) {
      try {
        const { saveUserPreferences } = await import("@/lib/firestore");
        await saveUserPreferences(user.uid, { dailyGoal: total });
      } catch (err) {
        console.error("Could not sync goal to cloud:", err);
      }
    }
    showToast("success", `Daily goal set to ${hours}h ${minutes > 0 ? `${minutes}m ` : ""}/ day`);
  };

  const handleToggleNotifications = async () => {
    const nextState = !notifications;
    setNotifications(nextState);
    if (user) {
      try {
        const { saveUserPreferences } = await import("@/lib/firestore");
        await saveUserPreferences(user.uid, {
          dailyGoal: totalGoalMinutes,
          remindersEnabled: nextState,
        } as { dailyGoal: number });
      } catch (err) {
        console.error("Error saving reminder preference:", err);
      }
    }
    showToast("info", `Telegram Reminders ${nextState ? "Enabled 🔔" : "Paused 🔕"}`);
  };

  const handleTestReminder = async () => {
    setTestingReminder(true);
    try {
      const res = await fetch("/api/reminder?secret=pt-reminder-secret-2026&force=true");
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("success", "Test reminder sent to your Telegram! 📱");
      } else {
        showToast("error", data.message || "Failed to send test reminder");
      }
    } catch (err) {
      showToast("error", "Error connecting to reminder service");
      console.error(err);
    } finally {
      setTestingReminder(false);
    }
  };

  const handleSignOut = async () => {
    const result = await confirmSignOut();
    if (result.isConfirmed) {
      await signOut();
      showToast("info", "Signed out successfully");
    }
  };

  return (
    <div className="space-y-7 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Settings & Preferences ⚙️
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Customize your study goals, appearance, and Telegram reminders.
        </p>
      </div>

      {/* User Profile Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {user?.photoURL ? (
            <Image
              src={user.photoURL}
              alt={user.displayName || "User"}
              width={64}
              height={64}
              className="rounded-full ring-4 ring-blue-500/20"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
              {user?.displayName?.charAt(0) || "U"}
            </div>
          )}
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {user?.displayName || "Shariful Islam"}
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500">{user?.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-[10px] font-bold">
              Google Authenticated
            </span>
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="px-4 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 rounded-xl border border-rose-200/60 dark:border-rose-800/40 transition-colors cursor-pointer"
        >
          Sign Out Account
        </button>
      </div>

      {/* Preferences Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <h3 className="text-base font-bold text-slate-900 dark:text-white pb-3 border-b border-slate-100 dark:border-slate-800">
          App Preferences
        </h3>

        {/* Theme Toggle */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Color Theme
            </h4>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Currently using {theme === "dark" ? "Dark Mode 🌙" : "Light Mode ☀️"}
            </p>
          </div>
          <button
            onClick={toggleTheme}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 dark:hover:text-white transition-colors cursor-pointer shadow-xs"
          >
            Switch to {theme === "dark" ? "Light Mode ☀️" : "Dark Mode 🌙"}
          </button>
        </div>

        {/* Custom Daily Study Goal Setting */}
        <div className="pt-5 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <div>
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Daily Target Goal 🎯
              </h4>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Set your custom target study duration (hours & minutes)
              </p>
            </div>

            {totalGoalMinutes > 0 && (
              <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800/60">
                Target: {goalHours > 0 ? `${goalHours}h ` : ""}{goalMinutes}m ({totalGoalMinutes} min/day)
              </span>
            )}
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 mr-1">
              Quick Presets:
            </span>
            {[
              { label: "1 Hour", h: 1, m: 0 },
              { label: "2 Hours", h: 2, m: 0 },
              { label: "3 Hours", h: 3, m: 0 },
              { label: "4 Hours", h: 4, m: 0 },
              { label: "5 Hours", h: 5, m: 0 },
              { label: "6 Hours", h: 6, m: 0 },
            ].map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handlePreset(preset.h, preset.m)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  goalHours === preset.h && goalMinutes === preset.m
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 dark:hover:text-white"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom Input Fields */}
          <form
            onSubmit={handleSaveGoal}
            className="flex flex-col sm:flex-row items-end gap-3 p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800"
          >
            {/* Custom Hours Input */}
            <div className="w-full sm:w-1/3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Hours
              </label>
              <input
                type="number"
                min="0"
                max="24"
                value={goalHours}
                onChange={(e) => setGoalHours(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            {/* Custom Minutes Input */}
            <div className="w-full sm:w-1/3">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Minutes
              </label>
              <input
                type="number"
                min="0"
                max="59"
                value={goalMinutes}
                onChange={(e) =>
                  setGoalMinutes(Math.min(59, Math.max(0, parseInt(e.target.value) || 0)))
                }
                className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>

            {/* Save Goal Button */}
            <div className="w-full sm:w-1/3">
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>💾</span>
                <span>Save Goal</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Telegram Study Reminder Control Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center text-xl shadow-xs">
              🤖
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Telegram Study Reminder
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Automated study progress alerts to your Telegram
              </p>
            </div>
          </div>

          {/* Toggle On/Off Switch */}
          <button
            onClick={handleToggleNotifications}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
              notifications ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-700"
            }`}
            title={notifications ? "Click to Pause Reminders" : "Click to Enable Reminders"}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                notifications ? "translate-x-6" : "translate-x-0"
              }`}
            />
          </button>
        </div>

        {/* Status Pills and Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 block">
              Bot Status
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {notifications ? "Active & Ready" : "Paused"}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 block">
              Schedule Times
            </span>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mt-0.5">
              7:00 PM, 9:00 PM, 11:00 PM
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 block">
              Connected Bot
            </span>
            <a
              href="https://t.me/Performance_Tracker_Reminder_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline block mt-0.5 truncate"
            >
              @Performance_Tracker_Reminder_bot ↗
            </a>
          </div>
        </div>

        {/* Send Test Reminder Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/60">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Want to see how your reminder looks right now?
          </p>
          <button
            onClick={handleTestReminder}
            disabled={testingReminder}
            className="w-full sm:w-auto px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            {testingReminder ? (
              <>
                <span className="animate-spin text-sm">⏳</span>
                <span>Sending...</span>
              </>
            ) : (
              <>
                <span>📨</span>
                <span>Send Test Reminder to Telegram</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Cloud & Security Info */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
          Cloud & Synchronization ☁️
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Your learning sessions and statistics are automatically backed up in real-time to
          <strong> Google Cloud Firestore</strong>. You can sign in from any device to continue tracking.
        </p>
      </div>
    </div>
  );
}
