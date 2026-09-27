import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

// Telegram Bot config
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID!;

// Helper: Get today's date in YYYY-MM-DD format (Bangladesh time UTC+6)
function getTodayBD(): string {
  const now = new Date();
  // Shift to UTC+6 (Bangladesh)
  const bdTime = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  const y = bdTime.getUTCFullYear();
  const m = String(bdTime.getUTCMonth() + 1).padStart(2, "0");
  const d = String(bdTime.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Helper: Get current hour in Bangladesh time
function getCurrentHourBD(): number {
  const now = new Date();
  const bdTime = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  return bdTime.getUTCHours();
}

// Helper: Format minutes to readable string
function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
}

// Send message via Telegram Bot API
async function sendTelegramMessage(text: string) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text,
      parse_mode: "HTML",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Telegram API error: ${err}`);
  }

  return res.json();
}

// Fetch all entries for all users for today (we iterate user docs)
async function getTodayStudyData() {
  const today = getTodayBD();

  // Get all user documents
  const usersSnapshot = await adminDb.collection("users").listDocuments();

  let totalMinutes = 0;
  let dailyGoal = 120; // Default 2 hours
  const topicMap: Record<string, number> = {};
  let userName = "Shariful";

  for (const userDoc of usersSnapshot) {
    const userId = userDoc.id;

    // Get today's entries for this user
    const entriesRef = userDoc.collection("entries");
    const entriesSnapshot = await entriesRef.where("date", "==", today).get();

    entriesSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      totalMinutes += data.duration || 0;
      const topic = data.topic || "Unknown";
      topicMap[topic] = (topicMap[topic] || 0) + (data.duration || 0);
    });

    // Try to get user settings (daily goal)
    const settingsDoc = await adminDb
      .collection("users")
      .doc(userId)
      .collection("settings")
      .doc("preferences")
      .get();

    if (settingsDoc.exists) {
      const settings = settingsDoc.data();
      if (settings?.dailyGoal) {
        dailyGoal = settings.dailyGoal;
      }
      if (settings?.userName) {
        userName = settings.userName;
      }
    }
  }

  return { totalMinutes, dailyGoal, topicMap, userName, today };
}

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const currentHour = getCurrentHourBD();

    // Only send between 7 PM (19) and 11 PM (23) Bangladesh time
    if (currentHour < 19 || currentHour > 23) {
      return NextResponse.json({
        message: `Skipped — current BD hour is ${currentHour}, outside 7PM-12AM window`,
      });
    }

    const { totalMinutes, dailyGoal, topicMap, today } =
      await getTodayStudyData();

    const remaining = Math.max(0, dailyGoal - totalMinutes);
    const percentage = Math.min(100, Math.round((totalMinutes / dailyGoal) * 100));
    const isGoalComplete = totalMinutes >= dailyGoal;

    // Build topic breakdown
    const topicList = Object.entries(topicMap)
      .sort((a, b) => b[1] - a[1])
      .map(([topic, mins]) => `  • ${topic}: ${formatDuration(mins)}`)
      .join("\n");

    // Build the message
    let emoji = "📊";
    let status = "";
    if (percentage >= 100) {
      emoji = "🎉";
      status = "TARGET ACHIEVED! 🏆";
    } else if (percentage >= 75) {
      emoji = "🔥";
      status = "Almost there!";
    } else if (percentage >= 50) {
      emoji = "💪";
      status = "Good progress!";
    } else if (percentage >= 25) {
      emoji = "⏰";
      status = "Keep going!";
    } else {
      emoji = "🚀";
      status = "Time to study!";
    }

    const progressBar =
      "█".repeat(Math.floor(percentage / 10)) +
      "░".repeat(10 - Math.floor(percentage / 10));

    const message = `${emoji} <b>Study Reminder — ${today}</b>

${status}

<b>📈 Progress:</b> ${progressBar} ${percentage}%
<b>✅ Studied:</b> ${formatDuration(totalMinutes)}
<b>🎯 Daily Goal:</b> ${formatDuration(dailyGoal)}
${isGoalComplete ? "" : `<b>⏳ Remaining:</b> ${formatDuration(remaining)}\n`}
${topicList ? `<b>📚 Topics Today:</b>\n${topicList}` : "📚 No topics logged yet — start studying!"}

<i>— Performance Tracker Bot 🤖</i>`;

    await sendTelegramMessage(message);

    return NextResponse.json({
      success: true,
      message: "Reminder sent!",
      data: { totalMinutes, dailyGoal, percentage, remaining },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Reminder error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
