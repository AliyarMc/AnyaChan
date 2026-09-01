"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Settings,
  Sparkles,
  Bot,
  MessageSquare,
  Send,
  Ticket,
  Zap,
  Mic,
  Mail,
  ShieldCheck,
  Sword,
  ShieldAlert,
  FileText,
  BarChart4,
  Trophy,
  Users,
  Activity,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Search,
  RefreshCw,
  Server,
  UserCheck,
  Volume2,
  Link2,
  X,
  Check,
  ExternalLink,
  Crown
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

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Server switcher state
  const [isServerDropdownOpen, setIsServerDropdownOpen] = useState(false);
  const [serverSearchQuery, setServerSearchQuery] = useState("");
  const [guilds, setGuilds] = useState<GuildSummary[]>([]);
  const [currentGuild, setCurrentGuild] = useState<{ id: string; name: string; icon: string | null } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const serverDropdownRef = useRef<HTMLDivElement>(null);

  // Category collapsed states
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    general: true,
    messaging: true,
    roles: true,
    moderation: true,
    engagement: true,
    utilities: true,
  });

  // Announcements sub-menu expand state
  const [announcementsExpanded, setAnnouncementsExpanded] = useState(true);

  // Close server dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (serverDropdownRef.current && !serverDropdownRef.current.contains(e.target as Node)) {
        setIsServerDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch guilds for switcher
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
        // Fallback: fetch single guild details if list fails
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
            // Silently fallback
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

  // Handle server refresh
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
      setTimeout(() => setIsRefreshing(false), 600);
    }
  };

  // Keyboard shortcut Ctrl+K to focus search
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

  // Navigation data matching Koya
  const navigationCategories: NavCategory[] = useMemo(() => {
    if (!currentGuildId) {
      return [
        {
          key: "general",
          name: "General",
          items: [
            { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
            { name: "Servers", href: "/dashboard/guilds", icon: Server },
            { name: "Admin Panel", href: "/dashboard/admin", icon: ShieldCheck, badge: "Admin" },
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
          { name: "Premium", href: `/dashboard/guild/${currentGuildId}/settings`, icon: Crown, badge: "PRO", badgeColor: "gold" },
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
          { name: "Sticky Messages", href: `/dashboard/guild/${currentGuildId}/joindm`, icon: Mail, badge: "New", badgeColor: "sky" },
          { name: "Ticketing", href: `/dashboard/guild/${currentGuildId}/tickets`, icon: Ticket },
        ],
      },
      {
        key: "roles",
        name: "Roles",
        items: [
          { name: "Auto Roles", href: `/dashboard/guild/${currentGuildId}/autorole`, icon: Bot },
          { name: "Reaction Roles", href: `/dashboard/guild/${currentGuildId}/reactionroles`, icon: Sparkles },
          { name: "Voice Roles", href: `/dashboard/guild/${currentGuildId}/invcrole`, icon: Volume2 },
          { name: "Vanity Roles", href: `/dashboard/guild/${currentGuildId}/vanityroles`, icon: Link2 },
          { name: "Custom Roles", href: `/dashboard/guild/${currentGuildId}/customroles`, icon: UserCheck },
        ],
      },
      {
        key: "moderation",
        name: "Moderation",
        items: [
          { name: "Auto Mod", href: `/dashboard/guild/${currentGuildId}/automod`, icon: ShieldCheck, badge: "New", badgeColor: "sky" },
          { name: "Anti-Nuke", href: `/dashboard/guild/${currentGuildId}/antinuke`, icon: Sword, badge: "Beta", badgeColor: "orange" },
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

  // Filter items by search query
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

  // Filter guilds for server dropdown
  const filteredGuilds = useMemo(() => {
    if (!serverSearchQuery.trim()) return guilds;
    return guilds.filter((g) => g.name.toLowerCase().includes(serverSearchQuery.toLowerCase()));
  }, [guilds, serverSearchQuery]);

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity duration-200"
          onClick={onClose}
        />
      )}

      {/* Main Single Sidebar */}
      <aside
        className={cn(
          "bg-[#18191e] border-r border-white/10 fixed lg:static inset-y-0 left-0 z-50 h-dvh flex flex-col transition-all duration-200 ease-in-out select-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          isCollapsed ? "w-20 min-w-20" : "w-72 min-w-72 sm:w-[285px] sm:min-w-[285px]"
        )}
      >
        {/* Top Header: Logo + Brand + Action Buttons */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/5 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3 group focus:outline-none">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FC5824] to-[#ff7d4d] flex items-center justify-center p-0.5 ring-1 ring-white/20 shadow-md group-hover:scale-105 transition-transform">
                <Bot className="w-5 h-5 text-white" />
              </div>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <h1 className="text-xl font-bold font-mono tracking-tight text-white group-hover:text-[#FC5824] transition-colors leading-none">
                  Anya
                </h1>
                <span className="text-[10px] font-semibold text-white/40 tracking-wider mt-0.5">
                  DISCORD BOT
                </span>
              </div>
            )}
          </Link>

          <div className="flex items-center gap-1.5">
            {/* Refresh server data button */}
            <button
              onClick={handleRefresh}
              title="Refresh server data"
              className="flex items-center justify-center w-8 h-8 rounded-full ring-1 ring-white/10 hover:bg-white/5 hover:ring-white/20 transition-all text-white/60 hover:text-white"
            >
              <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin text-[#FC5824]")} />
            </button>

            {/* Desktop Collapse button */}
            <button
              onClick={onToggleCollapse}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-full ring-1 ring-white/10 hover:bg-white/5 hover:ring-white/20 transition-all text-white/60 hover:text-white"
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Mobile close button */}
            <button
              onClick={onClose}
              className="flex lg:hidden items-center justify-center w-8 h-8 rounded-full ring-1 ring-white/10 hover:bg-white/5 text-white/60 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Server Selector Dropdown (Koya Style) */}
        {!isCollapsed && (
          <div className="p-3 pb-2 relative shrink-0" ref={serverDropdownRef}>
            <button
              onClick={() => setIsServerDropdownOpen((prev) => !prev)}
              type="button"
              className={cn(
                "w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl bg-[#22242b] hover:bg-[#282a33] border border-white/10 hover:border-white/20 transition-all text-left group",
                isServerDropdownOpen && "border-[#FC5824]/50 ring-2 ring-[#FC5824]/20"
              )}
            >
              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                {currentGuild?.icon ? (
                  <img
                    src={currentGuild.icon}
                    alt={currentGuild.name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-white/15 shrink-0"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#FC5824]/20 border border-[#FC5824]/40 flex items-center justify-center font-bold text-xs text-[#FC5824] shrink-0">
                    {currentGuild?.name ? currentGuild.name.charAt(0).toUpperCase() : "S"}
                  </div>
                )}
                <span className="text-sm font-semibold text-white truncate flex-1">
                  {currentGuild?.name || "Select a Server"}
                </span>
              </div>
              <ChevronDown
                className={cn(
                  "w-4 h-4 text-white/40 group-hover:text-white/80 transition-transform duration-200 shrink-0",
                  isServerDropdownOpen && "rotate-180 text-white"
                )}
              />
            </button>

            {/* Server Dropdown Popover */}
            {isServerDropdownOpen && (
              <div className="absolute left-3 right-3 top-14 mt-1 bg-[#1e1f26] border border-white/15 rounded-xl shadow-2xl z-50 p-2 animate-in fade-in zoom-in-95 duration-150">
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" />
                  <input
                    type="text"
                    value={serverSearchQuery}
                    onChange={(e) => setServerSearchQuery(e.target.value)}
                    placeholder="Search for a server..."
                    className="w-full bg-[#15161a] border border-white/10 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-[#FC5824]/50"
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
                              ? "bg-[#FC5824]/15 text-white font-semibold"
                              : "text-white/70 hover:bg-white/5 hover:text-white"
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
                              <div className="w-5 h-5 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                                {g.name.charAt(0).toUpperCase()}
                              </div>
                            )}
                            <span className="truncate">{g.name}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-[#FC5824] shrink-0" />}
                        </button>
                      );
                    })
                  ) : (
                    <div className="py-3 text-center text-xs text-white/40">No servers found</div>
                  )}
                </div>

                <div className="pt-2 mt-2 border-t border-white/5">
                  <Link
                    href="/dashboard/guilds"
                    onClick={() => setIsServerDropdownOpen(false)}
                    className="flex items-center justify-center gap-1.5 w-full py-1.5 text-xs font-semibold text-[#FC5824] hover:bg-[#FC5824]/10 rounded-lg transition-colors"
                  >
                    <Server className="w-3.5 h-3.5" />
                    <span>View All Servers</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Module Quick Search Bar (Ctrl+K) */}
        {!isCollapsed && (
          <div className="px-3 pb-2 shrink-0">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search modules..."
                className="w-full bg-[#22242b] border border-white/10 rounded-lg pl-9 pr-14 py-1.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-white/20 transition-colors"
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center h-4.5 px-1.5 rounded bg-[#16171a] text-[10px] font-mono text-white/50 ring-1 ring-white/10 pointer-events-none">
                Ctrl+K
              </kbd>
            </div>
          </div>
        )}

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 custom-scrollbar">
          {filteredCategories.map((cat) => {
            const isExpanded = expandedCategories[cat.key] ?? true;

            return (
              <div key={cat.key} className="space-y-1">
                {/* Category Header */}
                {!isCollapsed && (
                  <button
                    onClick={() => toggleCategory(cat.key)}
                    className="w-full flex items-center justify-between px-2 py-1 text-left group focus:outline-none"
                  >
                    <span className="text-[11px] font-bold uppercase tracking-wider text-white/40 group-hover:text-white/70 transition-colors">
                      {cat.name}
                    </span>
                    <ChevronDown
                      className={cn(
                        "w-3.5 h-3.5 text-white/30 group-hover:text-white/60 transition-transform duration-200",
                        !isExpanded && "-rotate-90"
                      )}
                    />
                  </button>
                )}

                {/* Items */}
                {(isExpanded || isCollapsed) && (
                  <div className="space-y-0.5">
                    {cat.items.map((item: any) => {
                      const Icon = item.icon;
                      const hasSubItems = item.subItems && item.subItems.length > 0;
                      const isItemActive = pathname === item.href || (hasSubItems && item.subItems.some((s: any) => pathname === s.href));

                      return (
                        <div key={item.name} className="relative">
                          {/* Item Link or Toggle Header */}
                          <div className="flex items-center">
                            <Link
                              href={item.href}
                              onClick={onClose}
                              className={cn(
                                "flex-1 flex items-center gap-2.5 px-2.5 py-1.75 rounded-lg text-[13px] font-medium transition-all group",
                                isItemActive
                                  ? "bg-white/10 text-white font-semibold shadow-sm"
                                  : "text-white/60 hover:text-white hover:bg-white/[0.04]",
                                isCollapsed && "justify-center px-0 py-2.5"
                              )}
                              title={isCollapsed ? item.name : undefined}
                            >
                              <Icon
                                className={cn(
                                  "w-4 h-4 shrink-0 transition-transform group-hover:scale-110",
                                  isItemActive ? "text-[#FC5824]" : "text-white/60 group-hover:text-white"
                                )}
                              />
                              {!isCollapsed && (
                                <span className="truncate flex-1">{item.name}</span>
                              )}

                              {/* Badges */}
                              {!isCollapsed && item.badge && (
                                <span
                                  className={cn(
                                    "text-[10px] font-bold px-1.5 py-0.5 rounded-full whitespace-nowrap leading-none",
                                    item.badgeColor === "sky" && "bg-sky-500/20 text-sky-300",
                                    item.badgeColor === "orange" && "bg-orange-500/20 text-orange-300",
                                    item.badgeColor === "gold" && "bg-amber-500/20 text-amber-300",
                                    !item.badgeColor && "bg-white/10 text-white/80"
                                  )}
                                >
                                  {item.badge}
                                </span>
                              )}
                            </Link>

                            {/* Sub-item Expand/Collapse Chevron */}
                            {!isCollapsed && hasSubItems && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  item.onToggle?.();
                                }}
                                className="p-1.5 text-white/40 hover:text-white hover:bg-white/5 rounded-md transition-colors ml-0.5"
                                title="Toggle Sub-menu"
                              >
                                <ChevronDown
                                  className={cn(
                                    "w-3.5 h-3.5 transition-transform duration-200",
                                    !item.expanded && "-rotate-90"
                                  )}
                                />
                              </button>
                            )}
                          </div>

                          {/* Sub-items (Tree Guide Lines like Koya) */}
                          {!isCollapsed && hasSubItems && item.expanded && (
                            <div className="ml-5 my-1 pl-3 relative space-y-0.5">
                              {/* Background vertical tree connector */}
                              <div className="absolute left-0 top-1.5 bottom-1.5 w-px bg-white/10 rounded-full" />

                              {item.subItems.map((sub: any) => {
                                const isSubActive = pathname === sub.href;

                                return (
                                  <div key={sub.name} className="relative">
                                    {/* Active marker on tree line */}
                                    {isSubActive && (
                                      <div className="absolute -left-3 top-1.5 bottom-1.5 w-0.5 bg-[#FC5824] rounded-full shadow-[0_0_8px_#FC5824]" />
                                    )}
                                    <Link
                                      href={sub.href}
                                      onClick={onClose}
                                      className={cn(
                                        "block py-1.25 px-2.5 rounded-md text-[12.5px] transition-colors",
                                        isSubActive
                                          ? "text-white font-bold bg-white/5"
                                          : "text-white/50 hover:text-white/90 hover:bg-white/[0.03]"
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
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer / Community */}
        {!isCollapsed && (
          <div className="p-3 border-t border-white/5 text-center shrink-0">
            <a
              href="https://discord.gg/zaptro"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-xs text-white/40 hover:text-white/80 transition-colors py-1"
            >
              <span>Anya Discord Community</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </aside>
    </>
  );
}
