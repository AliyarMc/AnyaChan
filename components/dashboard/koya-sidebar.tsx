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

import React, { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  RotateCcw,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  ChevronDown,
  ChevronRight,
  Check,
  LayoutDashboard,
  Settings,
  UserCheck,
  MessageSquare,
  Send,
  Bot,
  Zap,
  Mail,
  Ticket,
  Sparkles,
  Volume2,
  Link2,
  ShieldCheck,
  Sword,
  ShieldAlert,
  FileText,
  BarChart4,
  Trophy,
  Mic,
  Users,
  Activity,
  Server,
  X,
  FileCode,
  Calendar,
  Gift,
  Heart,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";
import { GuildSummary } from "@/types/api";

interface NavSubItem {
  name: string;
  href: string;
}

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
  isExpandable?: boolean;
  expanded?: boolean;
  onToggle?: () => void;
  subItems?: NavSubItem[];
}

interface NavCategory {
  key: string;
  name: string;
  items: NavItem[];
}

interface KoyaSidebarProps {
  currentGuildId: string | null;
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export function KoyaSidebar({
  currentGuildId,
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
}: KoyaSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [guilds, setGuilds] = useState<GuildSummary[]>([]);
  const [currentGuild, setCurrentGuild] = useState<{ id: string; name: string; icon: string | null } | null>(null);
  const [isServerDropdownOpen, setIsServerDropdownOpen] = useState(false);
  const [serverSearchQuery, setServerSearchQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Collapsible categories state
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    general: true,
    messaging: true,
    commands: true,
    engagement: true,
    roles: true,
    moderation: true,
  });

  const isAnnouncementsActive = pathname.includes("/welcome") || pathname.includes("/leave");
  const [announcementsExpanded, setAnnouncementsExpanded] = useState(isAnnouncementsActive);

  const serverDropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (serverDropdownRef.current && !serverDropdownRef.current.contains(e.target as Node)) {
        setIsServerDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Fetch guilds
  useEffect(() => {
    let isMounted = true;
    const fetchGuilds = async () => {
      try {
        const list = await api.listGuilds();
        if (isMounted && Array.isArray(list)) {
          setGuilds(list);
          if (currentGuildId) {
            const found = list.find((g) => g.id.toString() === currentGuildId);
            if (found) {
              setCurrentGuild({
                id: found.id.toString(),
                name: found.name,
                icon: found.icon_url || null,
              });
            }
          }
        }
      } catch (err) {
        if (currentGuildId && isMounted) {
          try {
            const details = await api.getGuildDetails(currentGuildId);
            if (details && isMounted) {
              setCurrentGuild({
                id: currentGuildId,
                name: details.name || "Discord Server",
                icon: details.icon || null,
              });
            }
          } catch {
            if (isMounted) {
              setCurrentGuild({
                id: currentGuildId,
                name: "Discord Server",
                icon: null,
              });
            }
          }
        }
      }
    };

    fetchGuilds();
    return () => {
      isMounted = false;
    };
  }, [currentGuildId]);

  const handleRefresh = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefreshing(true);
    try {
      const list = await api.listGuilds();
      if (Array.isArray(list)) {
        setGuilds(list);
        if (currentGuildId) {
          const found = list.find((g) => g.id.toString() === currentGuildId);
          if (found) {
            setCurrentGuild({
              id: found.id.toString(),
              name: found.name,
              icon: found.icon_url || null,
            });
          }
        }
      }
    } catch (err) {
      console.error("Failed to refresh guilds:", err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleCategory = (key: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Exact Koya Navigation Architecture
  const navigationCategories: NavCategory[] = useMemo(() => {
    if (!currentGuildId) {
      return [
        {
          key: "general",
          name: "General",
          items: [
            { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
            { name: "Servers", href: "/dashboard/guilds", icon: Server },
            { name: "Admin Panel", href: "/dashboard/admin", icon: ShieldCheck },
          ],
        },
      ];
    }

    return [
      {
        key: "general",
        name: "General",
        items: [
          { name: "Main", href: `/dashboard/guild/${currentGuildId}`, icon: LayoutDashboard },
          { name: "Settings", href: `/dashboard/guild/${currentGuildId}/settings`, icon: Settings },
          { name: "Custom Profile", href: `/dashboard/guild/${currentGuildId}/customroles`, icon: UserCheck },
        ],
      },
      {
        key: "messaging",
        name: "Messaging",
        items: [
          {
            name: "Announcements",
            href: `/dashboard/guild/${currentGuildId}/welcome`,
            icon: MessageSquare,
            isExpandable: true,
            expanded: announcementsExpanded,
            onToggle: () => setAnnouncementsExpanded((prev) => !prev),
            subItems: [
              { name: "Join", href: `/dashboard/guild/${currentGuildId}/welcome` },
              { name: "Leave", href: `/dashboard/guild/${currentGuildId}/leave` },
            ],
          },
          { name: "Message Builder", href: `/dashboard/guild/${currentGuildId}/embedsender`, icon: Send },
          { name: "Auto Responders", href: `/dashboard/guild/${currentGuildId}/autoreact`, icon: Bot },
          { name: "Auto Threads", href: `/dashboard/guild/${currentGuildId}/j2c`, icon: Zap },
          { name: "Sticky Messages", href: `/dashboard/guild/${currentGuildId}/joindm`, icon: Mail, badge: "New" },
          { name: "Ticketing", href: `/dashboard/guild/${currentGuildId}/tickets`, icon: Ticket },
        ],
      },
      {
        key: "roles",
        name: "Roles",
        items: [
          { name: "Auto Roles", href: `/dashboard/guild/${currentGuildId}/autorole`, icon: Bot },
          { name: "Reaction Roles", href: `/dashboard/guild/${currentGuildId}/reactionroles`, icon: Sparkles },
          { name: "Temporary Roles", href: `/dashboard/guild/${currentGuildId}/invcrole`, icon: Volume2 },
          { name: "Vanity Roles", href: `/dashboard/guild/${currentGuildId}/vanityroles`, icon: Link2 },
          { name: "Custom Roles", href: `/dashboard/guild/${currentGuildId}/customroles`, icon: UserCheck },
        ],
      },
      {
        key: "moderation",
        name: "Moderation",
        items: [
          { name: "Auto Mod", href: `/dashboard/guild/${currentGuildId}/automod`, icon: ShieldCheck, badge: "New" },
          { name: "Anti-Nuke", href: `/dashboard/guild/${currentGuildId}/antinuke`, icon: Sword },
          { name: "Verification", href: `/dashboard/guild/${currentGuildId}/verification`, icon: ShieldAlert },
          { name: "Logs", href: `/dashboard/guild/${currentGuildId}/logging`, icon: FileText },
        ],
      },
      {
        key: "engagement",
        name: "Server Engagement",
        items: [
          { name: "Levels", href: `/dashboard/guild/${currentGuildId}/leveling`, icon: BarChart4 },
          { name: "Leaderboard", href: `/dashboard/guild/${currentGuildId}/leveling/leaderboard`, icon: Trophy },
          { name: "Temporary Voice", href: `/dashboard/guild/${currentGuildId}/j2c`, icon: Mic },
          { name: "Invites", href: `/dashboard/guild/${currentGuildId}/invites`, icon: Users },
          { name: "Tracking", href: `/dashboard/guild/${currentGuildId}/tracking`, icon: Activity },
        ],
      },
    ];
  }, [currentGuildId, announcementsExpanded]);

  const filteredCategories: NavCategory[] = useMemo(() => {
    if (!searchQuery.trim()) return navigationCategories;
    const q = searchQuery.toLowerCase();

    return navigationCategories
      .map((cat) => {
        const filteredItems = cat.items.filter((item: NavItem) => {
          const matchItem = item.name.toLowerCase().includes(q);
          const matchSub = item.subItems?.some((sub: NavSubItem) => sub.name.toLowerCase().includes(q));
          return matchItem || matchSub;
        });
        return { ...cat, items: filteredItems };
      })
      .filter((cat) => cat.items.length > 0);
  }, [navigationCategories, searchQuery]);

  const filteredGuilds = useMemo(() => {
    if (!serverSearchQuery.trim()) return guilds;
    return guilds.filter((g) => g.name.toLowerCase().includes(serverSearchQuery.toLowerCase()));
  }, [guilds, serverSearchQuery]);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Main Sidebar Container (Matching Koya: w-full sm:w-75 lg:w-75 lg:min-w-75 bg-kgray-680) */}
      <aside
        className={cn(
          "bg-kgray-680 border-r border-white/10 fixed lg:static top-0 bottom-0 left-0 z-50 transition-all duration-200 ease-in-out flex flex-col shrink-0 select-none",
          isCollapsed ? "lg:w-20" : "w-full sm:w-[300px] lg:w-[300px] lg:min-w-[300px]",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="w-full h-full flex flex-col overflow-hidden">
          {/* Top Brand Header matching Koya */}
          <div className="p-5 pb-0 flex items-center justify-between shrink-0">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <img
                src="/utilities/avatar.png"
                alt="Anya"
                className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-white/10"
                onError={(e) => {
                  // Fallback to text avatar if image fails
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
              {!isCollapsed && (
                <span className="self-center whitespace-nowrap text-3xl font-mono font-bold tracking-tight heading-gradient-neutral text-white">
                  Anya
                </span>
              )}
            </Link>

            <div className="flex items-center gap-2">
              {/* Refresh Server Data */}
              <button
                onClick={handleRefresh}
                title="Refresh server data"
                className="flex items-center justify-center w-8 h-8 rounded-full ring-1 ring-white/10 hover:shadow-lg transition-colors duration-200 text-white/60 hover:text-white"
              >
                <RotateCcw className={cn("w-3.5 h-3.5", isRefreshing && "animate-spin text-white")} />
              </button>

              {/* Desktop Collapse Toggle */}
              <button
                onClick={onToggleCollapse}
                title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                className="hidden lg:flex items-center justify-center w-8 h-8 rounded-full ring-1 ring-white/10 hover:shadow-lg transition-colors duration-200 text-white/60 hover:text-white"
              >
                {isCollapsed ? <PanelLeftOpen className="w-3.5 h-3.5" /> : <PanelLeftClose className="w-3.5 h-3.5" />}
              </button>

              {/* Mobile Close Button */}
              <button
                onClick={onClose}
                className="lg:hidden flex items-center justify-center w-8 h-8 rounded-full ring-1 ring-white/10 text-white/60 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Server Selector Combobox (Matching Koya #dashboard-menu-guilds) */}
          {!isCollapsed && currentGuildId && (
            <div className="p-5 pb-0 relative shrink-0" ref={serverDropdownRef}>
              <div
                onClick={() => setIsServerDropdownOpen(!isServerDropdownOpen)}
                className="kinput bg-kgray-800 ring-1 ring-white/10 hover:ring-white/20 rounded-lg p-2.5 flex items-center justify-between cursor-pointer transition-all duration-150"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {currentGuild?.icon ? (
                    <img
                      src={currentGuild.icon}
                      alt={currentGuild.name}
                      className="w-6 h-6 rounded-full object-cover shrink-0 ring-1 ring-white/10"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-kgray-700 ring-1 ring-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {currentGuild?.name?.charAt(0)?.toUpperCase() || "S"}
                    </div>
                  )}
                  <span className="text-[13px] font-medium text-white truncate">
                    {currentGuild?.name || "Select Server"}
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-white/40 transition-transform duration-200 shrink-0",
                    isServerDropdownOpen && "rotate-180"
                  )}
                />
              </div>

              {/* Server Dropdown Popover */}
              {isServerDropdownOpen && (
                <div className="absolute left-5 right-5 top-[calc(100%+4px)] z-50 bg-kgray-800 border border-white/10 rounded-xl shadow-2xl p-2 animate-in fade-in zoom-in-95 duration-150">
                  <div className="relative mb-2">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      value={serverSearchQuery}
                      onChange={(e) => setServerSearchQuery(e.target.value)}
                      placeholder="Search for a server..."
                      className="w-full bg-kgray-850 border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-white/30"
                      autoFocus
                    />
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                    {filteredGuilds.length > 0 ? (
                      filteredGuilds.map((g) => {
                        const isSelected = g.id.toString() === currentGuildId;
                        return (
                          <button
                            key={g.id}
                            onClick={() => {
                              setIsServerDropdownOpen(false);
                              router.push(`/dashboard/guild/${g.id}`);
                            }}
                            className={cn(
                              "w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-xs transition-colors",
                              isSelected
                                ? "bg-white/10 text-white font-semibold"
                                : "text-white/60 hover:bg-white/4 hover:text-white"
                            )}
                          >
                            <div className="flex items-center gap-2 truncate">
                              {g.icon_url ? (
                                <img
                                  src={g.icon_url}
                                  alt={g.name}
                                  className="w-5 h-5 rounded-full object-cover shrink-0"
                                />
                              ) : (
                                <div className="w-5 h-5 rounded-full bg-kgray-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                                  {g.name.charAt(0).toUpperCase()}
                                </div>
                              )}
                              <span className="truncate">{g.name}</span>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-white shrink-0" />}
                          </button>
                        );
                      })
                    ) : (
                      <div className="py-3 text-center text-xs text-white/40">No servers found</div>
                    )}
                  </div>

                  <div className="pt-2 mt-2 border-t border-white/10">
                    <Link
                      href="/dashboard/guilds"
                      onClick={() => setIsServerDropdownOpen(false)}
                      className="block text-center text-[11px] font-medium text-white/50 hover:text-white py-1 transition-colors"
                    >
                      View All Servers →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Module Search Button (Matching Koya exact search modules button) */}
          {!isCollapsed && (
            <div className="px-5 pt-3 pb-1 shrink-0">
              <button
                type="button"
                onClick={() => searchInputRef.current?.focus()}
                className="flex items-center gap-2.5 w-full px-2.5 py-1.75 rounded-lg border border-white/10 text-white/40 hover:text-white/60 hover:bg-white/4 transition-colors duration-150 cursor-pointer"
              >
                <Search className="w-4 h-4 shrink-0 opacity-80" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search modules..."
                  className="bg-transparent text-[13px] font-medium flex-1 text-left truncate text-white placeholder:text-white/40 focus:outline-none"
                />
                <kbd className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded bg-kgray-800 text-[10px] font-mono text-white/50 ring-1 ring-white/10">
                  K
                </kbd>
              </button>
            </div>
          )}

          {/* Navigation Category & Item Tree (Matching Koya structure) */}
          <nav className="flex-1 overflow-y-auto px-5 py-3 space-y-4 custom-scrollbar">
            {filteredCategories.map((category) => {
              const isCatExpanded = expandedCategories[category.key] !== false;

              return (
                <div key={category.key} className="mb-3">
                  {/* Category Header */}
                  {!isCollapsed && (
                    <button
                      onClick={() => toggleCategory(category.key)}
                      className="mb-1 px-2 w-full flex items-center justify-between group cursor-pointer"
                    >
                      <span className="text-white/40 text-[11px] font-medium truncate tracking-wide group-hover:text-white/60 transition-colors">
                        {category.name}
                      </span>
                      <ChevronDown
                        className={cn(
                          "w-3 h-3 text-white/30 group-hover:text-white/50 transition-all duration-200",
                          !isCatExpanded && "-rotate-90"
                        )}
                      />
                    </button>
                  )}

                  {/* Category Items */}
                  {(isCollapsed || isCatExpanded) && (
                    <div className="flex flex-col gap-0.5">
                      {category.items.map((item) => {
                        const Icon = item.icon;
                        const isMainActive = pathname === item.href;
                        const isAnySubActive = item.subItems?.some((sub) => pathname === sub.href);
                        const isActive = isMainActive || isAnySubActive;

                        // Expandable Item (Announcements)
                        if (item.isExpandable && !isCollapsed) {
                          return (
                            <div key={item.name} className="flex flex-col">
                              <div
                                onClick={item.onToggle}
                                className={cn(
                                  "flex items-center relative py-1.75 rounded-lg mb-px w-full text-left transition-colors duration-150 gap-2.5 px-2.5 cursor-pointer",
                                  isActive
                                    ? "text-white bg-white/8"
                                    : "text-white/60 hover:text-white/90 hover:bg-white/4"
                                )}
                              >
                                <Icon className="w-4 h-4 shrink-0 opacity-80" />
                                <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                                  <span className="text-[13px] font-medium truncate flex-1 min-w-0">
                                    {item.name}
                                  </span>
                                  <ChevronRight
                                    className={cn(
                                      "w-3.5 h-3.5 text-white/40 transition-transform duration-200",
                                      item.expanded && "rotate-90"
                                    )}
                                  />
                                </div>
                              </div>

                              {/* Nested Sub-items with Tree Line Guide */}
                              {item.expanded && item.subItems && (
                                <div className="ml-4.5 my-0.5 pl-2.5 relative">
                                  <div className="absolute left-0 top-1 bottom-1 w-px bg-white/10 rounded-full" />
                                  {item.subItems.map((sub) => {
                                    const isSubActive = pathname === sub.href;
                                    return (
                                      <div key={sub.name} className="relative">
                                        {isSubActive && (
                                          <div className="absolute -left-[11px] top-1.5 bottom-1.5 w-0.5 bg-white/70 rounded-full" />
                                        )}
                                        <Link
                                          href={sub.href}
                                          className={cn(
                                            "block py-1.25 text-[13px] w-full text-left rounded-md px-2 transition-colors duration-150",
                                            isSubActive
                                              ? "text-white font-medium bg-white/4"
                                              : "text-white/40 hover:text-white/70"
                                          )}
                                        >
                                          {sub.name}
                                        </Link>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        }

                        // Regular Link
                        return (
                          <Link
                            key={item.name}
                            href={item.href}
                            title={isCollapsed ? item.name : undefined}
                            className={cn(
                              "flex items-center relative py-1.75 rounded-lg mb-px w-full text-left transition-colors duration-150 gap-2.5 px-2.5",
                              isActive
                                ? "text-white bg-white/8"
                                : "text-white/60 hover:text-white/90 hover:bg-white/4"
                            )}
                          >
                            <Icon className="w-4 h-4 shrink-0 opacity-80" />
                            {!isCollapsed && (
                              <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                                <span className="text-[13px] font-medium truncate flex-1 min-w-0">
                                  {item.name}
                                </span>
                                {item.badge && (
                                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap bg-sky-500/15 text-sky-300">
                                    {item.badge}
                                  </span>
                                )}
                              </div>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}
