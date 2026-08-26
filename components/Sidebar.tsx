"use client";

import Image from "next/image";
import { useState } from "react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export default function Sidebar({
  activeTab,
  setActiveTab,
  isOpenMobile,
  setIsOpenMobile,
}: SidebarProps) {
  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      id: "entries",
      label: "My Entries",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      id: "settings",
      label: "Settings",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
    },
    {
      id: "help",
      label: "Help & Support",
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0a1128] text-white flex flex-col justify-between p-5 transition-transform duration-300 ease-in-out border-r border-[#1e2a56]/50 lg:translate-x-0 ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-2 py-3 mb-8">
            <div className="relative w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center p-1.5 shadow-lg shadow-blue-500/20">
              <Image
                src="/logo.png"
                alt="Performance Tracker Logo"
                width={36}
                height={36}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white leading-none">
                Performance
              </h1>
              <span className="text-xs text-blue-400 font-medium">Tracker</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsOpenMobile(false);
                  }}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-[#182654] text-white font-semibold shadow-inner shadow-blue-500/10 border border-blue-500/20"
                      : "text-slate-400 hover:text-slate-200 hover:bg-[#111c40]/60"
                  }`}
                >
                  <span
                    className={`${
                      isActive ? "text-blue-400" : "text-slate-400"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Motivational Widget Card */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#131e44] to-[#0c1430] p-4 border border-[#23356e]/50 shadow-xl shadow-black/40">
          {/* Subtle glow background */}
          <div className="absolute -right-8 -top-8 w-24 h-24 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />

          <h3 className="text-sm font-bold text-white mb-0.5">Keep Learning!</h3>
          <p className="text-xs text-slate-300 mb-3">Small steps, big results. 🚀</p>

          {/* Character illustration representation */}
          <div className="relative w-full h-24 rounded-xl bg-gradient-to-tr from-[#1b2b60] to-[#2a3d7c] flex items-center justify-center overflow-hidden border border-blue-400/20">
            {/* Stars decoration */}
            <span className="absolute top-2 left-3 text-xs opacity-70">✨</span>
            <span className="absolute bottom-2 right-4 text-xs opacity-70">⭐</span>

            {/* Centered animated avatar graphic */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-blue-500/30 border border-blue-300/40 flex items-center justify-center text-xl shadow-inner">
                👨‍💻
              </div>
              <div className="mt-1 px-2.5 py-0.5 rounded-full bg-blue-600/40 text-[10px] text-blue-200 font-semibold tracking-wider">
                ACTIVE
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
