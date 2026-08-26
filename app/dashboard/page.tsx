"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  addEntry,
  getAllEntries,
  deleteEntry,
  LearningEntry,
} from "@/lib/firestore";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import StatCards from "@/components/StatCards";
import AddEntryForm from "@/components/AddEntryForm";
import EntryList from "@/components/EntryList";
import DailyBarChart from "@/components/charts/DailyBarChart";
import TopicPieChart from "@/components/charts/TopicPieChart";
import TrendLineChart from "@/components/charts/TrendLineChart";
import MyEntriesView from "@/components/views/MyEntriesView";
import AnalyticsView from "@/components/views/AnalyticsView";
import SettingsView from "@/components/views/SettingsView";
import HelpView from "@/components/views/HelpView";
import { showToast, showErrorAlert } from "@/lib/alerts";

// Timezone-safe local date functions (prevents UTC offset date-shifting)
function getToday(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function shiftDate(dateStr: string, days: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const resY = date.getFullYear();
  const resM = String(date.getMonth() + 1).padStart(2, "0");
  const resD = String(date.getDate()).padStart(2, "0");
  return `${resY}-${resM}-${resD}`;
}

function getFormattedToday(): string {
  const date = new Date();
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [entries, setEntries] = useState<LearningEntry[]>([]);
  const [allEntries, setAllEntries] = useState<LearningEntry[]>([]);
  const [weekData, setWeekData] = useState<
    { date: string; totalMinutes: number }[]
  >([]);
  const [monthData, setMonthData] = useState<
    { date: string; totalMinutes: number }[]
  >([]);
  const [topicData, setTopicData] = useState<
    { topic: string; totalMinutes: number }[]
  >([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);
    setError(null);

    const today = getToday();

    try {
      // Fetch all entries once and aggregate client-side
      const all = await getAllEntries(user.uid);
      if (!isMounted.current) return;
      setAllEntries(all);

      // 1. Today's entries
      const todayEntries = all.filter((e) => e.date === today);
      setEntries(todayEntries);

      // 2. Topic distribution (from today's entries, or all if today has no entries yet)
      const topicSource = todayEntries.length > 0 ? todayEntries : all;
      const topicMap: Record<string, number> = {};
      topicSource.forEach((e) => {
        topicMap[e.topic] = (topicMap[e.topic] || 0) + e.duration;
      });
      setTopicData(
        Object.entries(topicMap).map(([topic, totalMinutes]) => ({
          topic,
          totalMinutes,
        }))
      );

      // 3. Last 7 Days for Bar Chart (relative to today)
      const weekMap: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        const d = shiftDate(today, -i);
        weekMap[d] = 0;
      }
      all.forEach((e) => {
        if (weekMap[e.date] !== undefined) {
          weekMap[e.date] += e.duration;
        }
      });
      setWeekData(
        Object.entries(weekMap).map(([date, totalMinutes]) => ({
          date,
          totalMinutes,
        }))
      );

      // 4. Last 30 Days for Trend Area Chart
      const monthMap: Record<string, number> = {};
      for (let i = 29; i >= 0; i--) {
        const d = shiftDate(today, -i);
        monthMap[d] = 0;
      }
      all.forEach((e) => {
        if (monthMap[e.date] !== undefined) {
          monthMap[e.date] += e.duration;
        }
      });
      setMonthData(
        Object.entries(monthMap).map(([date, totalMinutes]) => ({
          date,
          totalMinutes,
        }))
      );
    } catch (err) {
      if (!isMounted.current) return;
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes("abort")) {
        setError("Failed to load study data: " + msg);
      }
    } finally {
      if (isMounted.current) {
        setDataLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f6fb] dark:bg-[#070d1e]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-xs text-slate-500 font-medium">
            Loading your dashboard...
          </p>
        </div>
      </div>
    );
  }

  const totalMinutes = entries.reduce((sum, e) => sum + e.duration, 0);
  const totalTopics = new Set(entries.map((e) => e.topic)).size;
  const avgMinutes =
    totalTopics > 0 ? Math.round(totalMinutes / totalTopics) : 0;

  const handleAdd = async (topic: string, duration: number, date: string) => {
    if (!user) return;
    setError(null);
    try {
      await addEntry(user.uid, { topic, duration, date });
      const h = Math.floor(duration / 60);
      const m = duration % 60;
      const formattedTime = h > 0 ? `${h}h ${m}m` : `${m}m`;
      showToast("success", `Added "${topic}" (${formattedTime})`);
      await loadData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      showErrorAlert("Error adding entry", msg);
      setError("Failed to add entry: " + msg);
    }
  };

  const handleDelete = async (entryId: string) => {
    if (!user) return;
    try {
      await deleteEntry(user.uid, entryId);
      showToast("success", "Entry deleted successfully");
      await loadData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      showErrorAlert("Error deleting entry", msg);
      setError("Failed to delete entry: " + msg);
    }
  };

  // Filter entries based on search query
  const filteredEntries = entries.filter((entry) =>
    entry.topic.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Extract first name for greeting
  const firstName =
    user.displayName?.split(" ")[0] || user.email?.split("@")[0] || "Shariful";

  return (
    <div className="min-h-screen bg-[#f4f6fb] dark:bg-[#070d1e] text-slate-900 dark:text-slate-100 flex transition-colors">
      {/* Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpenMobile={isMobileSidebarOpen}
        setIsOpenMobile={setIsMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header */}
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Dynamic Views Container */}
        <main className="p-4 sm:p-7 lg:p-8 max-w-[1600px] w-full mx-auto">
          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-2xl text-red-700 dark:text-red-300 text-sm flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-xs font-bold hover:underline"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* 1. Main Dashboard View */}
          {activeTab === "dashboard" && (
            <div className="space-y-7">
              {/* Welcome Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                    Welcome Back, {firstName}! 👋
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    Track your learning journey and make progress every day.
                  </p>
                </div>

                {/* Live Date Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs self-start sm:self-center">
                  <span className="text-sm">📅</span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    {getFormattedToday()}
                  </span>
                </div>
              </div>

              {/* Stat Cards (3 Columns) */}
              <StatCards
                totalMinutes={totalMinutes}
                totalTopics={totalTopics}
                avgMinutes={avgMinutes}
              />

              {/* Featured Gradient Add Entry Banner */}
              <AddEntryForm onAdd={handleAdd} selectedDate={getToday()} />

              {/* Today's Entries Table Card */}
              <EntryList
                entries={filteredEntries}
                onDelete={handleDelete}
                dateLabel="Today"
              />

              {/* Middle Section: 2 Charts Side-by-Side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DailyBarChart data={weekData} />
                <TopicPieChart data={topicData} />
              </div>

              {/* Bottom Section: 30-Day Trend Full Width Area Chart */}
              <div>
                <TrendLineChart data={monthData} />
              </div>
            </div>
          )}

          {/* 2. My Entries View */}
          {activeTab === "entries" && (
            <MyEntriesView
              entries={allEntries}
              onDelete={handleDelete}
              onRefresh={loadData}
            />
          )}

          {/* 3. Analytics View */}
          {activeTab === "analytics" && (
            <AnalyticsView entries={allEntries} />
          )}

          {/* 4. Settings View */}
          {activeTab === "settings" && <SettingsView />}

          {/* 5. Help & Support View */}
          {activeTab === "help" && <HelpView />}
        </main>
      </div>
    </div>
  );
}
