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

import React from "react";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { SidebarNav } from "@/components/sidebar-nav";

export const revalidate = 0; // Never cache any guild dashboard page

interface GuildLayoutProps {
  children: React.ReactNode;
  params: { guildId: string };
}

export default async function GuildLayout({
  children,
  params,
}: GuildLayoutProps) {
  const guildId = params.guildId;
  let guild;
  let error = null;

  try {
    guild = await api.getGuildDetails(guildId);
  } catch (err: any) {
    console.error("Failed to fetch guild details:", err);
    error = err.message || "Failed to load guild data.";
  }

  if (error || !guild) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] border-2 border-dashed border-red-500/20 rounded-3xl bg-red-500/5 p-12 text-center">
        <ShieldAlert className="h-16 w-16 text-red-500 mb-6 opacity-50" />
        <h2 className="text-2xl font-bold text-white">Access Denied</h2>
        <p className="text-slate-400 mt-2 max-w-md">{error || "This guild does not exist or you do not have permission to manage it."}</p>
        <Link href="/dashboard/guilds" className="mt-8">
          <Button variant="outline">Back to Servers</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Sidebar Nav */}
      <aside className="w-full lg:w-[280px] shrink-0 lg:sticky lg:top-[96px] z-20">
        <SidebarNav guildId={guildId} guildName={guild.name} guildIcon={guild.icon} />
      </aside>

      {/* Tab Content Panel */}
      <div className="flex-1 w-full min-w-0 bg-[#141B2D]/40 border border-slate-800/40 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/20 min-h-[600px]">
        {children}
      </div>
    </div>
  );
}
