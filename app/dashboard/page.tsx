"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
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

function getDateNDaysAgo(n: number): string {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return date.toISOString().split("T")[0];
}

function shiftDate(dateStr: string, days: number): string {
  const date = new Date(dateStr + "T00:00:00");
  date.setDate(date.getDate() + days);
  return date.toISOString().split("T")[0];
}

function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  const today = getToday();
  const yesterday = shiftDate(today, -1);

  if (dateStr === today) return "Today";
  if (dateStr === yesterday) return "Yesterday";

  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function Dashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(getToday());
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

  const isToday = selectedDate === getToday();

  const loadData = useCallback(async () => {
    if (!user) return;
    setDataLoading(true);

    try {
      // Load entries for selected date
      const dateEntries = await getEntriesByDate(user.uid, selectedDate);
      setEntries(dateEntries);

      // Topic distribution from selected date's entries
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

      // Last 7 days for bar chart (relative to selected date)
      const weekStart = shiftDate(selectedDate, -6);
      const weekEntries = await getEntriesRange(
        user.uid,
        weekStart,
        selectedDate
      );
      const weekMap: Record<string, number> = {};
      for (let i = 6; i >= 0; i--) {
        weekMap[shiftDate(selectedDate, -i)] = 0;
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

      // Last 30 days for trend (relative to selected date)
      const monthStart = shiftDate(selectedDate, -29);
      const monthEntries = await getEntriesRange(
        user.uid,
        monthStart,
        selectedDate
      );
      const monthMap: Record<string, number> = {};
      for (let i = 29; i >= 0; i--) {
        monthMap[shiftDate(selectedDate, -i)] = 0;
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
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setDataLoading(false);
    }
  }, [user, selectedDate]);

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
    await addEntry(user.uid, { topic, duration, date });
    // If added to selected date, reload. If different date, also reload to keep charts updated.
    await loadData();
  };

  const handleDelete = async (entryId: string) => {
    if (!user) return;
    await deleteEntry(user.uid, entryId);
    await loadData();
  };

  const goToPreviousDay = () => {
    setSelectedDate((prev) => shiftDate(prev, -1));
  };

  const goToNextDay = () => {
    const next = shiftDate(selectedDate, 1);
    if (next <= getToday()) {
      setSelectedDate(next);
    }
  };

  const goToToday = () => {
    setSelectedDate(getToday());
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Study Time</p>
            <p className="text-3xl font-bold text-blue-600">
              {totalMinutes}{" "}
              <span className="text-lg font-normal text-gray-400">min</span>
            </p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Topics Covered</p>
            <p className="text-3xl font-bold text-green-600">{totalTopics}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Avg per Topic</p>
            <p className="text-3xl font-bold text-purple-600">
              {avgMinutesPerTopic}{" "}
              <span className="text-lg font-normal text-gray-400">min</span>
            </p>
          </div>
        </div>

        {/* Add Entry Form */}
        <div className="mb-6">
          <AddEntryForm onAdd={handleAdd} selectedDate={selectedDate} />
        </div>

        {/* Entries for Selected Date */}
        <div className="mb-6">
          <EntryList
            entries={entries}
            onDelete={handleDelete}
            dateLabel={formatDisplayDate(selectedDate)}
          />
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
