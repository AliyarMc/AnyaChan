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

const WelcomeForm = dynamic(() => import("@/components/dashboard/welcome-form").then(mod => mod.WelcomeForm), {
  loading: () => <div className="h-96 w-full animate-pulse bg-white/[0.02] rounded-2xl border border-white/5" />
});

export default async function WelcomePage({ params }: { params: { guildId: string } }) {
  const [welcomeData, channelsData, guildDetails] = await Promise.all([
    api.getWelcome(params.guildId),
    api.getChannels(params.guildId),
    api.getGuildDetails(params.guildId).catch(() => null)
  ]);

  if (!welcomeData) return null;

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300">
      {/* Koya Style Breadcrumb Header */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/10 mb-6">
        <div className="flex items-center gap-2 text-2xl font-bold flex-wrap">
          <Link 
            href={`/dashboard/guild/${params.guildId}`}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Announcements
          </Link>
          <ChevronRight className="w-5 h-5 text-gray-500" />
          <span className="text-white">Join Message</span>
        </div>
      </div>

      <WelcomeForm 
        initialConfig={welcomeData} 
        channels={channelsData} 
        guildId={params.guildId} 
        serverName={guildDetails?.name || "Discord Server"} 
      />
    </div>
  );
}
