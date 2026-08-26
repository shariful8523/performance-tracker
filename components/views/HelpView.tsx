"use client";

import { useState } from "react";
import { showToast } from "@/lib/alerts";

export default function HelpView() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [feedback, setFeedback] = useState("");

  const faqs = [
    {
      q: "How do I record a new learning session?",
      a: "Go to the Dashboard, enter your topic name in the Add Learning Entry card, select the hours and minutes you studied, and click '+ Add Entry'. It will instantly sync to your cloud database and update your charts.",
    },
    {
      q: "Can I log sessions for past dates?",
      a: "Yes! In the Add Learning Entry banner, click the Date field to pick any date from the past, then submit your entry.",
    },
    {
      q: "How does the search filter work?",
      a: "Press '/' on your keyboard or click the search bar in the top navigation to search for specific topics. Your entries and charts will instantly filter.",
    },
    {
      q: "Is my data stored securely?",
      a: "Yes! All entries are private to your Google account and safely stored in Google Cloud Firestore with real-time sync.",
    },
  ];

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    showToast("success", "Thank you for your feedback! 💌");
    setFeedback("");
  };

  return (
    <div className="space-y-7 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Help & Support 💬
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Everything you need to know about getting the most out of Performance Tracker.
        </p>
      </div>

      {/* 3 Quick Start Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-sm mb-3">
            01
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Log Topics Daily</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Record what you studied, whether it&apos;s 15 minutes or 3 hours.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black text-sm mb-3">
            02
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Visualize Progress</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Watch your 7-day bar chart and 30-day trend lines rise over time.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-sm mb-3">
            03
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Build Consistency</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Check your milestones, unlock achievement badges, and keep learning!
          </p>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Frequently Asked Questions ❓
        </h3>

        {faqs.map((faq, idx) => {
          const isOpen = openFaq === idx;
          return (
            <div
              key={idx}
              className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden transition-all"
            >
              <button
                onClick={() => setOpenFaq(isOpen ? null : idx)}
                className="w-full px-5 py-3.5 text-left flex items-center justify-between font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/80 dark:hover:text-white cursor-pointer transition-colors"
              >
                <span>{faq.q}</span>
                <span className={`text-slate-400 dark:text-slate-300 transition-transform ${isOpen ? "rotate-180" : ""}`}>
                  ▼
                </span>
              </button>
              {isOpen && (
                <div className="px-5 pb-4 pt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/60">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Send Feedback Box */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Have a Question or Feedback? ✉️
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Tell us how we can make Performance Tracker even better for you.
        </p>

        <form onSubmit={handleFeedbackSubmit} className="space-y-3">
          <textarea
            rows={3}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Write your feedback or suggestions here..."
            className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
          >
            Submit Feedback
          </button>
        </form>
      </div>
    </div>
  );
}
