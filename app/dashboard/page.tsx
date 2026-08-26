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
  const [addSuccess, setAddSuccess] = useState<string | null>(null);
  const isMounted = useRef(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);
    setError(null);

    const today = getToday();

    try {
      // Load today's entries
      const dateEntries = await getEntriesByDate(user.uid, today);
      if (!isMounted.current) return;
      setEntries(dateEntries);

      // Topic distribution
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
      // Last 7 days for bar chart
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
      // Last 30 days for trend
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
    setAddSuccess(null);
    try {
      await addEntry(user.uid, { topic, duration, date });
      setAddSuccess(`✅ "${topic}" added successfully! (${formatDuration(duration)})`);
      setTimeout(() => setAddSuccess(null), 3000);
      await loadData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError("Failed to add entry: " + msg);
    }
  };

  const handleDelete = async (entryId: string) => {
    if (!user) return;
    try {
      await deleteEntry(user.uid, entryId);
      await loadData();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError("Failed to delete entry: " + msg);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            ❌ {error}
          </div>
        )}

        {/* Success Message */}
        {addSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
            {addSuccess}
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Today&apos;s Study Time</p>
            <p className="text-3xl font-bold text-blue-600">
              {formatDuration(totalMinutes)}
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Topics Covered</p>
            <p className="text-3xl font-bold text-green-600">{totalTopics}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Avg per Topic</p>
            <p className="text-3xl font-bold text-purple-600">
              {formatDuration(avgMinutesPerTopic)}
            </p>
          </div>
        </div>

        {/* Add Entry Form */}
        <div className="mb-6">
          <AddEntryForm onAdd={handleAdd} selectedDate={getToday()} />
        </div>

        {/* Today's Entries */}
        <div className="mb-6">
          <EntryList entries={entries} onDelete={handleDelete} dateLabel="Today" />
        </div>

        {/* Charts */}
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
