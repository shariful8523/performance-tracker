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

// Fetch all entries for today across all users via collectionGroup
async function getTodayStudyData() {
  const today = getTodayBD();

  // Query all entries across collectionGroup without index requirement
  const entriesSnapshot = await adminDb
    .collectionGroup("entries")
    .get();

  let totalMinutes = 0;
  const topicMap: Record<string, number> = {};

  entriesSnapshot.docs.forEach((doc) => {
    const data = doc.data();
    if (data.date === today) {
      totalMinutes += data.duration || 0;
      const topic = data.topic || "Unknown";
      topicMap[topic] = (topicMap[topic] || 0) + (data.duration || 0);
    }
  });

  // Try to find user custom goal and reminder toggle (default 120 minutes = 2 hours)
  let dailyGoal = 120;
  let remindersEnabled = true;
  try {
    const prefsSnapshot = await adminDb.collectionGroup("preferences").get();
    if (!prefsSnapshot.empty) {
      const data = prefsSnapshot.docs[0].data();
      if (data?.dailyGoal && Number(data.dailyGoal) > 0) {
        dailyGoal = Number(data.dailyGoal);
      }
      if (data?.remindersEnabled !== undefined) {
        remindersEnabled = Boolean(data.remindersEnabled);
      }
    }
  } catch (err) {
    console.error("Could not fetch user preferences, using default 120m:", err);
  }

  return { totalMinutes, dailyGoal, remindersEnabled, topicMap, today };
}

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  const url = new URL(request.url);
  const secretParam = url.searchParams.get("secret");
  const force = url.searchParams.get("force") === "true";

  // Check auth via header or query param
  const isAuthorized =
    (cronSecret && authHeader === `Bearer ${cronSecret}`) ||
    (cronSecret && secretParam === cronSecret);

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const currentHour = getCurrentHourBD();

    // Only send between 7 PM (19) and 11 PM (23) Bangladesh time (unless force=true)
    if (!force && (currentHour < 19 || currentHour > 23)) {
      return NextResponse.json({
        message: `Skipped — current BD hour is ${currentHour}, outside 7PM-12AM window`,
      });
    }

    const { totalMinutes, dailyGoal, remindersEnabled, topicMap, today } =
      await getTodayStudyData();

    if (!force && !remindersEnabled) {
      return NextResponse.json({
        message: "Reminders are disabled in Settings by user",
      });
    }

    const remaining = Math.max(0, dailyGoal - totalMinutes);
    const percentage = Math.min(100, Math.round((totalMinutes / dailyGoal) * 100));
    const isGoalComplete = totalMinutes >= dailyGoal;

    // Build topic breakdown
    const topicList = Object.entries(topicMap)
      .sort((a, b) => b[1] - a[1])
      .map(([topic, mins]) => `  • <b>${topic}</b>: ${formatDuration(mins)}`)
      .join("\n");

    // Build the message
    let emoji = "📊";
    let status = "";
    if (percentage >= 100) {
      emoji = "🎉";
      status = "TARGET ACHIEVED! 🏆 মাশাল্লাহ!";
    } else if (percentage >= 75) {
      emoji = "🔥";
      status = "Almost there! আর একটু বাকি!";
    } else if (percentage >= 50) {
      emoji = "💪";
      status = "Good progress! চালিয়ে যাও!";
    } else if (percentage >= 25) {
      emoji = "⏰";
      status = "Keep going! পড়ার সময় হয়েছে!";
    } else {
      emoji = "🚀";
      status = "Time to study! শুরু করে দাও!";
    }

    const progressBar =
      "█".repeat(Math.floor(percentage / 10)) +
      "░".repeat(10 - Math.floor(percentage / 10));

    const message = `${emoji} <b>Study Reminder — ${today}</b>

<b>${status}</b>

<b>📈 Progress:</b> ${progressBar} ${percentage}%
<b>✅ Studied:</b> ${formatDuration(totalMinutes)}
<b>🎯 Daily Goal:</b> ${formatDuration(dailyGoal)}
${isGoalComplete ? "<b>✨ Goal Completed! Keep it up! 🌟</b>\n" : `<b>⏳ Remaining:</b> ${formatDuration(remaining)}\n`}
${topicList ? `<b>📚 Topics Today:</b>\n${topicList}` : "📚 No topics logged yet today — start now!"}

<i>— Performance Tracker Bot 🤖</i>`;

    await sendTelegramMessage(message);

    return NextResponse.json({
      success: true,
      message: "Reminder sent successfully to Telegram!",
      data: { totalMinutes, dailyGoal, percentage, remaining, today },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Reminder error:", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
