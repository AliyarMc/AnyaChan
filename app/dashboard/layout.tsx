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
  Shield
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

  const match = pathname.match(/\/dashboard\/guild\/([^\/]+)/);
  const currentGuildId = match ? match[1] : null;

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

  useEffect(() => {
    setIsSidebarOpen(false);
    setIsProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn("discord");
    }

    const fetchNotification = async () => {
      try {
        const config = await api.getAdminConfig();
        setGlobalNotification(config.global_notification);
      } catch (err) {
        // Fallback silently if offline
      }
    };
    fetchNotification();
  }, [status]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="h-screen w-screen bg-[#323339] flex items-center justify-center">
        <div className="animate-spin text-gray-400">
          <svg viewBox="0 0 24 24" style={{ width: "2.5rem", height: "2.5rem" }} role="presentation">
            <path d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z" style={{ fill: "currentColor" }} />
          </svg>
        </div>
      </div>
    );
  }

  return (
    <div className="h-dvh flex flex-col lg:flex-row overflow-hidden bg-[#323339] text-white">
      {/* Koya Unified Sidebar */}
      <KoyaSidebar
        currentGuildId={currentGuildId}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
      />

      {/* Main Content Viewport: Unified seamless dark background */}
      <div className="overflow-hidden bg-[#323339] max-w-screen flex flex-col grow relative lg:max-w-[calc(100vw-320px)]">
        {/* Top Navbar: subtle 1px border between header and body */}
        <nav className="bg-[#323339] z-20 border-b border-white/10">
          <div className="flex flex-wrap items-center justify-between lg:justify-start mx-auto gap-4 px-6 py-4">
            {/* Mobile Trigger */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 text-white/70 hover:text-white"
                aria-label="Open Sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Brand */}
            <Link href="/dashboard" className="flex gap-3 items-center order-2 lg:hidden">
              <img
                src="/utilities/avatar.png"
                alt="Anya"
                className="w-9 h-9 rounded-full object-cover"
                onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
              />
              <span className="self-center whitespace-nowrap text-2xl font-mono font-bold tracking-tight text-white">
                Anya
              </span>
            </Link>

            <div className="hidden lg:flex lg:flex-1 lg:order-2" />

            {/* Right Controls */}
            <div className="flex items-center order-3 lg:order-3 gap-4 ml-auto">
              <div className="hidden lg:block">
                <button
                  type="button"
                  id="language-menu-button"
                  className="relative z-20 flex items-center cursor-pointer gap-2 select-none text-white/70 hover:text-white transition-colors text-sm font-medium px-2.5 py-1.5 rounded-lg hover:bg-white/5"
                >
                  <span className="text-base">🇺🇸</span>
                  <span>EN</span>
                  <ChevronDown className="w-3.5 h-3.5 text-white/40" />
                </button>
              </div>

              {/* Notification Button */}
              <div className="hidden lg:block relative" ref={bellRef}>
                <button
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                  className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 transition-colors duration-150 relative text-white/80 hover:text-white"
                  title="View notifications"
                >
                  <Bell className="w-4 h-4" />
                  {globalNotification && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-white ring-2 ring-[#323339]" />
                  )}
                </button>

                {isNotificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-[#2b2c32] rounded-xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 border border-white/10">
                    <div className="flex items-center justify-between pb-2 mb-3 border-b border-white/5">
                      <span className="text-xs font-bold uppercase tracking-wider text-white/50">
                        Notifications
                      </span>
                      {globalNotification && (
                        <button
                          onClick={() => setGlobalNotification(null)}
                          className="text-[10px] font-semibold text-white/60 hover:text-white uppercase"
                        >
                          Dismiss
                        </button>
                      )}
                    </div>

                    {globalNotification ? (
                      <div className="bg-white/5 rounded-lg p-3">
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

              {/* User Menu Button */}
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  id="user-menu-button"
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center cursor-pointer gap-2.5 p-1 rounded-xl hover:bg-white/5 transition-colors"
                >
                  <div className="relative">
                    {session?.user?.image ? (
                      <img
                        src={session.user.image}
                        alt={session.user.name || "User Avatar"}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                        <User className="w-4 h-4 text-white/60" />
                      </div>
                    )}
                  </div>
                  <ChevronDown
                    className={cn(
                      "w-3.5 h-3.5 text-white/40 transition-transform duration-200",
                      isProfileOpen && "rotate-180"
                    )}
                  />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#2b2c32] rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 border border-white/10">
                    <div className="px-3 py-2 border-b border-white/5 mb-1">
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
          </div>
        </nav>

        {/* Scrollable Content Viewport: Unified seamless dark background */}
        <div className="overflow-y-scroll overflow-x-hidden bg-[#323339] p-4 pb-14 lg:p-8 flex-1 min-h-0 custom-scrollbar">
          <div className="w-full max-w-[1400px] mx-auto min-w-0">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}