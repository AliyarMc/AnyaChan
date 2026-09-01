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
import { ChevronRight } from "lucide-react";
import dynamic from "next/dynamic";
import { api } from "@/lib/api";

const LeaveForm = dynamic(() => import("@/components/dashboard/leave-form").then(mod => mod.LeaveForm), {
  loading: () => <div className="h-96 w-full animate-pulse bg-white/[0.02] rounded-2xl border border-white/5" />
});

export default async function LeavePage({ params }: { params: { guildId: string } }) {
  const [leaveData, channelsData, guildDetails] = await Promise.all([
    api.getLeave(params.guildId),
    api.getChannels(params.guildId),
    api.getGuildDetails(params.guildId).catch(() => null)
  ]);

  if (!leaveData) return null;

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* Koya Style Breadcrumb Header */}
      <div className="flex items-center justify-between gap-4 pb-2 mb-6">
        <div className="flex items-center gap-2 text-2xl font-bold flex-wrap">
          <Link 
            href={`/dashboard/guild/${params.guildId}`}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Announcements
          </Link>
          <ChevronRight className="w-5 h-5 text-gray-500" />
          <span className="text-white">Leave Message</span>
        </div>
      </div>

      <LeaveForm 
        initialConfig={leaveData} 
        channels={channelsData} 
        guildId={params.guildId} 
        serverName={guildDetails?.name || "Discord Server"} 
      />
    </div>
  );
}
