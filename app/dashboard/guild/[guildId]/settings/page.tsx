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
import { api } from "@/lib/api";
import { SettingsForm } from "@/components/dashboard/settings-form";

export default async function GuildSettingsPage({ params }: { params: { guildId: string } }) {
  let initialPrefix = "^^";
  try {
    const config = await api.getPrefix(params.guildId);
    if (config?.prefix) {
      initialPrefix = config.prefix;
    }
  } catch {
    // Fallback if offline
  }

  return (
    <div className="w-full max-w-5xl mx-auto animate-in fade-in duration-200">
      <SettingsForm initialPrefix={initialPrefix} guildId={params.guildId} />
    </div>
  );
}
