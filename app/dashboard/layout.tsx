/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║                                                                  ║
 * ║   ░█▀▀░█▀█░█▀▄░█▀▀░█░█   ░█▀▄░█▀▀░█░█░█▀▀                     ║
 * ║   ░█░░░█░█░█░█░█▀▀░▄▀▄   ░█░█░█▀▀░▀▄▀░▀▀█                     ║
 * ║   ░▀▀▀░▀▀▀░▀▀░░▀▀▀░▀░▀   ░▀▀░░▀▀▀░░▀░░▀▀▀                     ║
 * ║                                                                  ║
 * ║           © 2026 ZAPTRO — All Rights Reserved               ║
 * ║                                                                  ║
 * ║   discord  ──  https://discord.gg/zaptro                      ║
 * ║   youtube  ──  https://youtube.com/@ZAPTRO                   ║
 * ║   github   ──  https://github.com/ZAPTRO                        ║
 * ║                                                                  ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Bell,
  User,
  ChevronDown,
  LifeBuoy,
  LogOut,
  Shield,
  Bot
} from "lucide-react";
import { useSession, signIn, signOut } from "next-auth/react";
import { cn, isAdmin } from "@/lib/utils";
import { api } from "@/lib/api";
import { KoyaSidebar } from "@/components/dashboard/koya-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [globalNotification, setGlobalNotification] = useState<string | null>(null);

  const pathname = usePathname();
  const { data: session, status } = useSession();

  const bellRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Extract current guild id if inside guild route
  const match = pathname.match(/\/dashboard\/guild\/([^\/]+)/);
  const currentGuildId = match ? match[1] : null;

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (bellRef.current && !bellRef.current.contains(target)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-close mobile sidebar when navigating
  useEffect(() => {
    setIsSidebarOpen(false);
    setIsProfileOpen(false);
  }, [pathname]);

  // Check auth & global notifications
  useEffect(() => {
    if (status === "unauthenticated") {
      signIn("discord");
    }

    const fetchNotification = async () => {
      try {
        const config = await api.getAdminConfig();
        setGlobalNotification(config.global_notification);
      } catch (err) {
        // Silently fallback if API isn't online
      }
    };
    fetchNotification();
  }, [status]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="h-screen w-screen bg-[#202225] flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-white/10 border border-white/15 flex items-center justify-center">
            <Bot className="h-5 w-5 text-white" />
          </div>
          <p className="text-white/40 font-mono text-xs uppercase tracking-wider">
            Loading Anya...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-[#202225] text-white">
      {/* Unified Left Sidebar (Koya Style) */}
      <KoyaSidebar
        currentGuildId={currentGuildId}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col h-dvh overflow-hidden min-w-0 bg-[#25272c]">
        {/* Top Navbar matching Koya (No Upgrade button, neutral theme) */}
        <header className="bg-[#202225] border-b border-white/10 px-4 lg:px-8 py-3 shrink-0 flex items-center justify-between gap-4 z-20">
          {/* Mobile Menu Trigger & Logo */}
          <div className="flex items-center gap-3 lg:hidden">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-1.5 rounded-lg border border-white/10 text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              aria-label="Open Sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white/10 border border-white/15 flex items-center justify-center font-bold text-xs text-white">
                A
              </div>
              <span className="font-mono font-bold text-white text-base">Anya</span>
            </Link>
          </div>

          {/* Desktop Left Spacer */}
          <div className="hidden lg:flex items-center gap-2 text-sm text-white/40" />

          {/* Right Header Controls */}
          <div className="flex items-center gap-4 ml-auto">
            {/* Language Badge (Koya Style) */}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] text-xs font-medium text-white/70 select-none">
              <span>🇺🇸</span>
              <span>EN</span>
              <ChevronDown className="w-3 h-3 text-white/40" />
            </div>

            {/* Notifications Bell */}
            <div className="relative" ref={bellRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2 text-white/50 hover:text-white rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {globalNotification && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-white ring-2 ring-[#202225]" />
                )}
              </button>

              {isNotificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#2b2c32] border border-white/15 rounded-xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/10">
                    <span className="text-xs font-bold uppercase tracking-wider text-white/50">
                      Notifications
                    </span>
                    {globalNotification && (
                      <button
                        onClick={() => setGlobalNotification(null)}
                        className="text-[10px] font-semibold text-white/60 hover:text-white hover:underline uppercase"
                      >
                        Dismiss
                      </button>
                    )}
                  </div>

                  {globalNotification ? (
                    <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                      <p className="text-xs text-white/80 leading-relaxed">{globalNotification}</p>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-white/40">
                      <Bell className="w-6 h-6 mx-auto mb-2 opacity-30" />
                      No new notifications
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/15 bg-slate-800 flex items-center justify-center shrink-0">
                  {session?.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User Avatar"}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-white/60" />
                  )}
                </div>
                <span className="hidden md:inline-block text-xs font-medium text-white/80 max-w-[120px] truncate">
                  {session?.user?.name || "Discord User"}
                </span>
                <ChevronDown className={cn("w-3.5 h-3.5 text-white/40 transition-transform duration-200", isProfileOpen && "rotate-180")} />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-[#2b2c32] border border-white/15 rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-white/40">Signed in as</p>
                    <p className="text-xs font-semibold text-white truncate">{session?.user?.name || "User"}</p>
                  </div>

                  {isAdmin(session?.user?.id) && (
                    <Link
                      href="/dashboard/admin"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <Shield className="w-3.5 h-3.5 text-white/60" />
                      <span>Admin Control Panel</span>
                    </Link>
                  )}

                  <a
                    href="https://discord.gg/zaptro"
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-white/70 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <LifeBuoy className="w-3.5 h-3.5 text-white/60" />
                    <span>Support Server</span>
                  </a>

                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors mt-1 border-t border-white/5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Content Viewport (Exact Koya background and padding) */}
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-10 bg-[#25272c] custom-scrollbar">
          <div className="w-full max-w-[1400px] mx-auto min-w-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}