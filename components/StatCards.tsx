"use client";

interface StatCardsProps {
  totalMinutes: number;
  totalTopics: number;
  avgMinutes: number;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function StatCards({
  totalMinutes,
  totalTopics,
  avgMinutes,
}: StatCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {/* Card 1: Today's Study Time */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-100/80 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xl shadow-xs">
              ⏱️
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Today&apos;s Study Time
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {formatDuration(totalMinutes)}
                </span>
              </div>
            </div>
          </div>
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
            ↑ +12%
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Great start today! 🎯
          </span>
        </div>

        {/* Decorative Wave Graphic in Background */}
        <div className="absolute right-0 bottom-0 pointer-events-none opacity-40 dark:opacity-20 translate-x-2 translate-y-1">
          <svg width="120" height="48" viewBox="0 0 120 48" fill="none">
            <path
              d="M0 38C20 38 35 24 55 24C75 24 90 8 120 8V48H0V38Z"
              fill="url(#blue-gradient-wave)"
            />
            <path
              d="M0 38C20 38 35 24 55 24C75 24 90 8 120 8"
              stroke="#3b82f6"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="blue-gradient-wave" x1="0" y1="8" x2="0" y2="48" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3b82f6" stopOpacity="0.4" />
                <stop stopColor="#3b82f6" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Card 2: Topics Covered */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-xl shadow-xs">
              📖
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Topics Covered
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {totalTopics}
                </span>
              </div>
            </div>
          </div>
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
            ↑ +1
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Keep exploring! 📚
          </span>
        </div>

        {/* Decorative Wave Graphic in Background */}
        <div className="absolute right-0 bottom-0 pointer-events-none opacity-40 dark:opacity-20 translate-x-2 translate-y-1">
          <svg width="120" height="48" viewBox="0 0 120 48" fill="none">
            <path
              d="M0 40C25 40 40 30 65 30C90 30 100 12 120 12V48H0V40Z"
              fill="url(#green-gradient-wave)"
            />
            <path
              d="M0 40C25 40 40 30 65 30C90 30 100 12 120 12"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="green-gradient-wave" x1="0" y1="12" x2="0" y2="48" gradientUnits="userSpaceOnUse">
                <stop stopColor="#10b981" stopOpacity="0.4" />
                <stop stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Card 3: Avg per Topic */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-purple-100/80 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xl shadow-xs">
              🎯
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Avg per Topic
              </p>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {formatDuration(avgMinutes)}
                </span>
              </div>
            </div>
          </div>
          <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/40">
            ↑ +8%
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Good consistency! ⚡
          </span>
        </div>

        {/* Decorative Wave Graphic in Background */}
        <div className="absolute right-0 bottom-0 pointer-events-none opacity-40 dark:opacity-20 translate-x-2 translate-y-1">
          <svg width="120" height="48" viewBox="0 0 120 48" fill="none">
            <path
              d="M0 36C20 36 45 28 70 28C95 28 105 10 120 10V48H0V36Z"
              fill="url(#purple-gradient-wave)"
            />
            <path
              d="M0 36C20 36 45 28 70 28C95 28 105 10 120 10"
              stroke="#8b5cf6"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="purple-gradient-wave" x1="0" y1="10" x2="0" y2="48" gradientUnits="userSpaceOnUse">
                <stop stopColor="#8b5cf6" stopOpacity="0.4" />
                <stop stopColor="#8b5cf6" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
}
