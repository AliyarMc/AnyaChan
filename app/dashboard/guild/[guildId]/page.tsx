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

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Settings, 
  Bot, 
  Megaphone, 
  Send, 
  MessageCircle, 
  Mail, 
  Ticket, 
  Smile, 
  UserPlus, 
  SmilePlus, 
  Clock, 
  Tag, 
  Users, 
  ShieldAlert, 
  ShieldCheck, 
  CheckCircle, 
  FileText, 
  Trophy, 
  Radio, 
  BarChart3, 
  Medal, 
  PartyPopper, 
  X,
  Sparkles
} from "lucide-react";
import { api } from "@/lib/api";

interface FeatureCardItem {
  title: string;
  desc: string;
  icon: React.ElementType;
  href: string;
  badge?: "New" | "Beta";
}

interface FeatureCategory {
  title: string;
  features: FeatureCardItem[];
}

export default function GuildOverviewPage({ params }: { params: { guildId: string } }) {
  const [showBanner, setShowBanner] = useState(true);
  const [guildName, setGuildName] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    const fetchGuild = async () => {
      try {
        const details = await api.getGuildDetails(params.guildId);
        if (isMounted && details?.name) {
          setGuildName(details.name);
        }
      } catch {
        // silent fallback
      }
    };
    fetchGuild();
    return () => {
      isMounted = false;
    };
  }, [params.guildId]);

  const categories: FeatureCategory[] = [
    {
      title: "General",
      features: [
        {
          title: "Settings",
          desc: "Change the settings of the app",
          icon: Settings,
          href: `/dashboard/guild/${params.guildId}/settings`,
        },
        {
          title: "Custom Profile",
          desc: "Customize Anya's appearance in your server or set up a custom bot for full customization",
          icon: Bot,
          href: `/dashboard/guild/${params.guildId}/customroles`,
          badge: "New",
        },
      ],
    },
    {
      title: "Messaging",
      features: [
        {
          title: "Announcements",
          desc: "Send join, leave, and system announcements to your server",
          icon: Megaphone,
          href: `/dashboard/guild/${params.guildId}/welcome`,
        },
        {
          title: "Message Builder",
          desc: "Create and broadcast custom rich embed messages with link buttons",
          icon: Send,
          href: `/dashboard/guild/${params.guildId}/embedsender`,
        },
        {
          title: "Auto Responders",
          desc: "Configure automatic responses triggered by message content",
          icon: MessageCircle,
          href: `/dashboard/guild/${params.guildId}/autoreact`,
        },
        {
          title: "Join DM",
          desc: "Send welcoming direct messages to users when they join your server",
          icon: Mail,
          href: `/dashboard/guild/${params.guildId}/joindm`,
        },
        {
          title: "Ticketing",
          desc: "Create interactive ticket panels for member support",
          icon: Ticket,
          href: `/dashboard/guild/${params.guildId}/tickets`,
        },
        {
          title: "Auto React",
          desc: "Automatically add emoji reactions to messages in specific channels",
          icon: Smile,
          href: `/dashboard/guild/${params.guildId}/autoreact`,
          badge: "New",
        },
      ],
    },
    {
      title: "Roles",
      features: [
        {
          title: "Auto Roles",
          desc: "Give roles to users when they join your server",
          icon: UserPlus,
          href: `/dashboard/guild/${params.guildId}/autorole`,
        },
        {
          title: "Reaction Roles",
          desc: "Give roles to users when they react to a message",
          icon: SmilePlus,
          href: `/dashboard/guild/${params.guildId}/reactionroles`,
        },
        {
          title: "Voice Roles",
          desc: "Automatically assign or remove roles when users join voice channels",
          icon: Clock,
          href: `/dashboard/guild/${params.guildId}/invcrole`,
        },
        {
          title: "Tag Role",
          desc: "Automatically assign a role to members who represent your server using the server tag or vanity",
          icon: Tag,
          href: `/dashboard/guild/${params.guildId}/vanityroles`,
        },
        {
          title: "Custom Roles",
          desc: "Create and manage custom roles and member perks",
          icon: Users,
          href: `/dashboard/guild/${params.guildId}/customroles`,
        },
      ],
    },
    {
      title: "Moderation",
      features: [
        {
          title: "Anti-Nuke",
          desc: "Protect your server against unauthorized mass actions, bans, and channel wipes",
          icon: ShieldAlert,
          href: `/dashboard/guild/${params.guildId}/antinuke`,
        },
        {
          title: "Auto-Mod",
          desc: "Automatically moderate rule violations, spam, invites, and bad words in chat",
          icon: ShieldCheck,
          href: `/dashboard/guild/${params.guildId}/automod`,
        },
        {
          title: "Verification",
          desc: "Gate your server with CAPTCHA or reaction verification",
          icon: CheckCircle,
          href: `/dashboard/guild/${params.guildId}/verification`,
        },
        {
          title: "Server Logging",
          desc: "Keep detailed audit logs of server events, message edits, and role changes",
          icon: FileText,
          href: `/dashboard/guild/${params.guildId}/logging`,
        },
      ],
    },
    {
      title: "Engagement & Utilities",
      features: [
        {
          title: "Leveling",
          desc: "Reward active chatters with XP, levels, and custom rank rewards",
          icon: Trophy,
          href: `/dashboard/guild/${params.guildId}/leveling`,
        },
        {
          title: "Join to Create (J2C)",
          desc: "Dynamic temporary voice channels created automatically on demand",
          icon: Radio,
          href: `/dashboard/guild/${params.guildId}/j2c`,
        },
        {
          title: "Server Tracking",
          desc: "Live statistical counters and server tracking voice channels",
          icon: BarChart3,
          href: `/dashboard/guild/${params.guildId}/tracking`,
        },
        {
          title: "Leaderboard",
          desc: "Public leaderboard showcase for server activity and ranks",
          icon: Medal,
          href: `/dashboard/guild/${params.guildId}/leveling/leaderboard`,
          badge: "Beta",
        },
      ],
    },
  ];

  return (
    <div className="w-full space-y-8 pb-16 animate-in fade-in duration-200">
      {/* ── Optional Server Title ── */}
      {guildName && (
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white tracking-tight">{guildName}</h1>
        </div>
      )}

      {/* ── Top Welcome Banner (Exact match to reference Image 2) ── */}
      {showBanner && (
        <div className="relative rounded-2xl border border-[#614a29]/60 bg-[#252321]/80 p-6 shadow-xl backdrop-blur-sm">
          {/* Close button */}
          <button
            type="button"
            onClick={() => setShowBanner(false)}
            className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors p-1"
            title="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex flex-col sm:flex-row items-start gap-4">
            {/* Horn / Party Popper Icon in rounded square */}
            <div className="w-12 h-12 rounded-xl bg-[#453216] flex items-center justify-center text-[#ffc107] shrink-0">
              <PartyPopper className="w-6 h-6" />
            </div>

            <div className="space-y-3 flex-1 min-w-0">
              <div>
                <h2 className="text-lg font-bold text-white leading-snug">
                  Thanks for adding Anya!
                </h2>
                <p className="text-white/60 text-sm mt-0.5">
                  You&apos;re all set! Here are some popular features to get started:
                </p>
              </div>

              {/* Quick action buttons */}
              <div className="flex flex-wrap gap-2.5 pt-1">
                <Link
                  href={`/dashboard/guild/${params.guildId}/welcome`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/90 hover:text-white text-xs font-semibold border border-white/5 transition-colors"
                >
                  <span>👋</span>
                  <span>Welcome new users</span>
                </Link>

                <Link
                  href={`/dashboard/guild/${params.guildId}/leveling`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/90 hover:text-white text-xs font-semibold border border-white/5 transition-colors"
                >
                  <span>🏆</span>
                  <span>Set up leveling</span>
                </Link>

                <Link
                  href={`/dashboard/guild/${params.guildId}/reactionroles`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/90 hover:text-white text-xs font-semibold border border-white/5 transition-colors"
                >
                  <span>➕</span>
                  <span>Create a reaction role</span>
                </Link>

                <Link
                  href={`/dashboard/guild/${params.guildId}/tracking`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/90 hover:text-white text-xs font-semibold border border-white/5 transition-colors"
                >
                  <span>📈</span>
                  <span>Track server stats</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Categorized Feature Grid Sections (Exact 1:1 match to reference Images 1, 2, 3) ── */}
      {categories.map((category) => (
        <section key={category.title} className="space-y-4">
          <h2 className="text-xl font-bold text-white tracking-tight">{category.title}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {category.features.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group relative bg-[#24252a] hover:bg-[#2c2d33] rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-150 shadow-sm border border-white/10 hover:border-white/20"
              >
                {/* Badge if present */}
                {item.badge && (
                  <span
                    className={`absolute top-3.5 right-3.5 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      item.badge === "New"
                        ? "bg-[#183642] text-[#4dd0e1]"
                        : "bg-[#3d2b14] text-[#f59e0b] border border-[#f59e0b]/20"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {/* Centered Circular Icon */}
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white/70 group-hover:text-white group-hover:bg-white/10 transition-all mb-3.5">
                  <item.icon className="w-5 h-5" />
                </div>

                {/* Title */}
                <h3 className="text-base font-bold text-white mb-1.5 group-hover:text-white transition-colors">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-xs text-white/50 leading-relaxed max-w-[240px]">
                  {item.desc}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
