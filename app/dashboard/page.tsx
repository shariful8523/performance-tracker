"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import {
  addEntry,
  getEntriesByDate,
  getEntriesRange,
  deleteEntry,
  LearningEntry,
} from "@/lib/firestore";
import Navbar from "@/components/Navbar";
import AddEntryForm from "@/components/AddEntryForm";
import EntryList from "@/components/EntryList";
import DailyBarChart from "@/components/charts/DailyBarChart";
import TopicPieChart from "@/components/charts/TopicPieChart";
import TrendLineChart from "@/components/charts/TrendLineChart";
import { showToast, showErrorAlert } from "@/lib/alerts";

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function shiftDate(dateStr: string, days: number): string {
  const date = new Date(dateStr + "T00:00:00");
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

function formatDuration(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [entries, setEntries] = useState<LearningEntry[]>([]);
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
      const dateEntries = await getEntriesByDate(user.uid, today);
      if (!isMounted.current) return;
      setEntries(dateEntries);

      const topicMap: Record<string, number> = {};
      dateEntries.forEach((e) => {
        topicMap[e.topic] = (topicMap[e.topic] || 0) + e.duration;
      });
      setTopicData(
        Object.entries(topicMap).map(([topic, totalMinutes]) => ({
          topic,
          totalMinutes,
        }))
      );
    } catch (err) {
      if (!isMounted.current) return;
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes("abort")) {
        setError("Failed to load entries: " + msg);
      }
    }

    try {
      const weekStart = shiftDate(today, -6);
      const weekEntries = await getEntriesRange(user.uid, weekStart, today);
      if (!isMounted.current) return;
      const weekMap: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        weekMap[shiftDate(today, -i)] = 0;
      }
      weekEntries.forEach((e) => {
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
    } catch (err) {
      if (!isMounted.current) return;
      console.error("Error loading week data:", err);
    }

    try {
      const monthStart = shiftDate(today, -29);
      const monthEntries = await getEntriesRange(user.uid, monthStart, today);
      if (!isMounted.current) return;
      const monthMap: Record<string, number> = {};
      for (let i = 29; i >= 0; i--) {
        monthMap[shiftDate(today, -i)] = 0;
      }
      monthEntries.forEach((e) => {
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
      console.error("Error loading month data:", err);
    }

    if (isMounted.current) {
      setDataLoading(false);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalMinutes = entries.reduce((sum, e) => sum + e.duration, 0);
  const totalTopics = new Set(entries.map((e) => e.topic)).size;
  const avgMinutesPerTopic =
    totalTopics > 0 ? Math.round(totalMinutes / totalTopics) : 0;

  const handleAdd = async (topic: string, duration: number, date: string) => {
    if (!user) return;
    setError(null);
    try {
      await addEntry(user.uid, { topic, duration, date });
      showToast("success", `Added "${topic}" (${formatDuration(duration)})`);
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
            ❌ {error}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Today&apos;s Study Time</p>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {formatDuration(totalMinutes)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Topics Covered</p>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{totalTopics}</p>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Avg per Topic</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {formatDuration(avgMinutesPerTopic)}
            </p>
          </div>
        </div>

        <div className="mb-6">
          <AddEntryForm onAdd={handleAdd} selectedDate={getToday()} />
        </div>

        <div className="mb-6">
          <EntryList entries={entries} onDelete={handleDelete} dateLabel="Today" />
        </div>

        {dataLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <DailyBarChart data={weekData} />
            <TopicPieChart data={topicData} />
            <div className="lg:col-span-2">
              <TrendLineChart data={monthData} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
