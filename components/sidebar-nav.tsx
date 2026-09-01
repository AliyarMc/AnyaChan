"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  ShieldCheck,
  Ticket,
  BarChart4,
  FileText,
  Settings,
  Layers,
  Sword,
  Activity,
  SmilePlus,
  Shield,
  Sparkles,
  Link as LinkIcon,
  Bot,
  ChevronDown,
  Volume2,
  Link2,
  Zap,
  Mic,
  Mail,
  Send,
  UserMinus,
  ArrowLeft,
  Server,
  Wrench
} from "lucide-react";

interface Tab {
  name: string;
  href: string;
  icon: any;
}

interface Category {
  name: string;
  icon: any;
  tabs: Tab[];
}

export function SidebarNav({
  guildId,
  guildName,
  guildIcon
}: {
  guildId: string;
  guildName: string;
  guildIcon: string | null;
}) {
  const pathname = usePathname();

  // Categorized tabs
  const categories: Category[] = [
    {
      name: "Server Management",
      icon: Server,
      tabs: [
        { name: "Overview", href: `/dashboard/guild/${guildId}`, icon: Layers },
        { name: "Welcome", href: `/dashboard/guild/${guildId}/welcome`, icon: SmilePlus },
        { name: "Leave Log", href: `/dashboard/guild/${guildId}/leave`, icon: UserMinus },
        { name: "Auto Role", href: `/dashboard/guild/${guildId}/autorole`, icon: Bot },
        { name: "Leveling", href: `/dashboard/guild/${guildId}/leveling`, icon: BarChart4 },
        { name: "Custom Roles", href: `/dashboard/guild/${guildId}/customroles`, icon: Sparkles },
      ]
    },
    {
      name: "Security & Safety",
      icon: ShieldCheck,
      tabs: [
        { name: "Anti-Nuke", href: `/dashboard/guild/${guildId}/antinuke`, icon: Sword },
        { name: "Automod", href: `/dashboard/guild/${guildId}/automod`, icon: ShieldCheck },
        { name: "Verification", href: `/dashboard/guild/${guildId}/verification`, icon: Shield },
      ]
    },
    {
      name: "Engagement",
      icon: Zap,
      tabs: [
        { name: "Reaction Roles", href: `/dashboard/guild/${guildId}/reactionroles`, icon: Activity },
        { name: "Tickets", href: `/dashboard/guild/${guildId}/tickets`, icon: Ticket },
        { name: "Auto React", href: `/dashboard/guild/${guildId}/autoreact`, icon: Zap },
      ]
    },
    {
      name: "Utilities",
      icon: Wrench,
      tabs: [
        { name: "Join to Create", href: `/dashboard/guild/${guildId}/j2c`, icon: Mic },
        { name: "Voice Role", href: `/dashboard/guild/${guildId}/invcrole`, icon: Volume2 },
        { name: "Vanity Roles", href: `/dashboard/guild/${guildId}/vanityroles`, icon: Link2 },
        { name: "Join DM", href: `/dashboard/guild/${guildId}/joindm`, icon: Mail },
        { name: "Embed Sender", href: `/dashboard/guild/${guildId}/embedsender`, icon: Send },
        { name: "Invites", href: `/dashboard/guild/${guildId}/invites`, icon: LinkIcon },
        { name: "Logging", href: `/dashboard/guild/${guildId}/logging`, icon: FileText },
      ]
    },
    {
      name: "Configuration",
      icon: Settings,
      tabs: [
        { name: "Settings", href: `/dashboard/guild/${guildId}/settings`, icon: Settings },
      ]
    }
  ];

  // Track expanded categories in client-state
  // Expand all by default for a nice full look, but allow collapsing
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({
    "Server Management": true,
    "Security & Safety": true,
    "Engagement": true,
    "Utilities": true,
    "Configuration": true,
  });

  const toggleCategory = (catName: string) => {
    setExpanded(prev => ({
      ...prev,
      [catName]: !prev[catName]
    }));
  };

  return (
    <div className="flex flex-col gap-6 bg-[#393a41] rounded-2xl p-6 shadow-xl shadow-black/25">
      {/* Back button */}
      <Link href="/dashboard/guilds" className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-black uppercase tracking-wider group">
        <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
        Back to servers
      </Link>

      {/* Mini Guild Header */}
      <div className="flex items-center gap-4 pb-4 border-b border-white/5">
        {guildIcon ? (
          <Image
            src={guildIcon}
            alt={guildName}
            width={48}
            height={48}
            className="rounded-2xl border border-slate-700 shadow-lg"
          />
        ) : (
          <div className="h-12 w-12 bg-primary rounded-2xl flex items-center justify-center font-bold text-white shadow-lg">
            {guildName.charAt(0)}
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-sm font-black text-white truncate tracking-tight leading-none mb-1.5">{guildName}</h2>
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Active Node</span>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex flex-col gap-4">
        {categories.map((cat) => {
          const isExpanded = expanded[cat.name];
          const hasActiveTab = cat.tabs.some(tab => pathname === tab.href);

          return (
            <div key={cat.name} className="flex flex-col gap-1">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(cat.name)}
                className={cn(
                  "flex items-center justify-between w-full py-2.5 px-3 rounded-xl transition-all duration-300 text-left",
                  hasActiveTab ? "text-primary font-bold" : "text-slate-400 hover:text-white hover:bg-slate-800/30"
                )}
              >
                <div className="flex items-center gap-3.5">
                  <cat.icon className="h-4.5 w-4.5 opacity-80" />
                  <span className="text-xs font-black uppercase tracking-widest leading-none">{cat.name}</span>
                </div>
                <ChevronDown className={cn(
                  "h-4 w-4 transform transition-transform duration-300 opacity-60",
                  isExpanded ? "rotate-0" : "-rotate-90"
                )} />
              </button>

              {/* Collapsible Tabs Container */}
              <div className={cn(
                "grid transition-all duration-300 ease-in-out",
                isExpanded ? "grid-rows-[1fr] opacity-100 mt-1" : "grid-rows-[0fr] opacity-0 overflow-hidden pointer-events-none"
              )}>
                <div className="overflow-hidden flex flex-col gap-1 pl-4 border-l border-white/5/60 ml-5 py-0.5">
                  {cat.tabs.map((tab) => {
                    const isActive = pathname === tab.href;
                    return (
                      <Link key={tab.name} href={tab.href}>
                        <div className={cn(
                          "flex items-center gap-3 py-2 px-3.5 rounded-lg text-xs font-bold transition-all duration-300 whitespace-nowrap",
                          isActive
                            ? "bg-primary text-white shadow-md shadow-primary/20"
                            : "text-slate-400 hover:text-white hover:bg-slate-800/20"
                        )}>
                          <tab.icon className={cn("h-4 w-4", isActive ? "opacity-100" : "opacity-40")} />
                          <span>{tab.name}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
