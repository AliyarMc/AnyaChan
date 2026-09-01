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

import React from "react";
import { cn } from "@/lib/utils";
import { WelcomePreviewCanvas } from "./welcome-preview-canvas";

interface DiscordMessagePreviewProps {
  welcomeType: "simple" | "embed";
  messageContent?: string;
  embedData?: {
    title?: string | null;
    description?: string | null;
    color?: string | number | null;
    thumbnail?: string | null;
    image?: string | null;
    author_name?: string | null;
    author_icon?: string | null;
    footer_text?: string | null;
    footer_icon?: string | null;
    timestamp_enabled?: boolean;
  } | null;
  cardEnabled?: boolean;
  imageConfig?: any;
  serverName?: string;
  userName?: string;
  avatarUrl?: string;
  buttons?: {
    label: string;
    style?: number;
    emoji?: string;
  }[];
}

export function DiscordMessagePreview({
  welcomeType,
  messageContent = "",
  embedData = {},
  cardEnabled = false,
  imageConfig = null,
  serverName = "Discord Server",
  userName = "Member",
  avatarUrl = "https://cdn.discordapp.com/embed/avatars/0.png",
  buttons = []
}: DiscordMessagePreviewProps) {
  const safeEmbedData = embedData || {};

  // Format variables in strings in real-time
  const formatText = (text: string) => {
    if (!text) return "";
    return text
      .replace(/{user}/g, `@${userName}`)
      .replace(/{user\.mention}/g, `@${userName}`)
      .replace(/{user_name}/g, userName)
      .replace(/{user\.name}/g, userName)
      .replace(/{user_id}/g, "123456789012345678")
      .replace(/{server_name}/g, serverName)
      .replace(/{server\.name}/g, serverName)
      .replace(/{server_membercount}/g, "364")
      .replace(/{user_joindate}/g, "Today");
  };

  // Convert embed hex color to css valid hex/rgb
  const getEmbedColor = (rawColor: string | number | null | undefined = "") => {
    if (!rawColor) return "#5865F2";
    let color = String(rawColor).trim();
    if (color.startsWith("#")) return color;
    if (/^[0-9A-F]{6}$/i.test(color)) return `#${color}`;
    const num = parseInt(color, 10);
    if (!isNaN(num)) {
      return `#${num.toString(16).padStart(6, "0")}`;
    }
    return "#5865F2";
  };

  const formattedContent = formatText(messageContent);
  const formattedEmbedTitle = formatText(safeEmbedData.title || "");
  const formattedEmbedDesc = formatText(safeEmbedData.description || "");
  const formattedAuthorName = formatText(safeEmbedData.author_name || "");
  const formattedFooterText = formatText(safeEmbedData.footer_text || "");

  const embedColor = getEmbedColor(safeEmbedData.color);

  return (
    <div className="bg-white/[0.03] rounded-2xl p-5 shadow-xl space-y-3 font-sans border border-white/10">
      <div className="flex items-center justify-between pb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Preview</span>
        <span className="text-[10px] bg-white/5 px-2.5 py-0.5 rounded-full text-white/50 font-mono">
          Discord Look
        </span>
      </div>

      {/* Discord Message Container matching Koya */}
      <div className="pt-2">
        <div className="relative pl-12 sm:pl-14 select-text">
          {/* Bot Avatar */}
          <div className="absolute left-0 top-0.5 w-10 h-10 rounded-full overflow-hidden select-none shrink-0 bg-white/10 flex items-center justify-center text-white font-bold text-sm">
            <img
              src="/utilities/avatar.png"
              alt="Anya"
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
            />
            <span>A</span>
          </div>

          {/* Bot Name & Header */}
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="font-semibold text-white text-sm hover:underline cursor-pointer">
              Anya
            </span>
            <span className="inline-flex items-center bg-[#5865f2] rounded text-[10px] font-bold uppercase px-1 text-white leading-tight">
              APP
            </span>
            <time className="text-white/40 cursor-default text-xs">
              Today at 11:53 AM
            </time>
          </div>

          {/* Formatted Message Content */}
          {formattedContent && (
            <div className="text-[#dcddde] text-sm leading-relaxed mt-1 break-words whitespace-pre-wrap">
              {formattedContent.split(/(@\S+)/g).map((part, i) => {
                if (part.startsWith("@")) {
                  return (
                    <span
                      key={i}
                      className="text-[#dee0fc] bg-[#5865f24d] hover:bg-[#5865f2] hover:text-white rounded px-1 py-0.5 font-medium transition-colors cursor-pointer"
                    >
                      {part}
                    </span>
                  );
                }
                return part;
              })}
            </div>
          )}

          {/* Discord Embed (if embed type) */}
          {welcomeType === "embed" && (
            <div
              className="bg-[#2f3136] rounded border-l-4 p-3.5 mt-2 space-y-2.5 shadow-md max-w-[520px]"
              style={{ borderLeftColor: embedColor }}
            >
              {/* Embed Author */}
              {formattedAuthorName && (
                <div className="flex items-center gap-2">
                  {safeEmbedData.author_icon && (
                    <img
                      src={safeEmbedData.author_icon.includes("{server_icon}") ? avatarUrl : safeEmbedData.author_icon}
                      alt=""
                      className="w-5 h-5 rounded-full object-cover shrink-0"
                      onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                    />
                  )}
                  <span className="text-xs font-semibold text-white">{formattedAuthorName}</span>
                </div>
              )}

              {/* Embed Body with Thumbnail */}
              <div className="flex gap-4 items-start justify-between">
                <div className="flex-1 min-w-0 space-y-1">
                  {formattedEmbedTitle && (
                    <h4 className="font-semibold text-white hover:underline cursor-pointer text-sm leading-snug">
                      {formattedEmbedTitle}
                    </h4>
                  )}
                  {formattedEmbedDesc && (
                    <p className="text-xs text-[#dcddde] break-words whitespace-pre-wrap leading-relaxed">
                      {formattedEmbedDesc}
                    </p>
                  )}
                </div>

                {safeEmbedData.thumbnail && (
                  <img
                    src={safeEmbedData.thumbnail.includes("{user_avatar}") ? avatarUrl : safeEmbedData.thumbnail}
                    alt=""
                    className="w-16 h-16 rounded-lg object-cover shrink-0 ml-3"
                    onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                  />
                )}
              </div>

              {/* Embed Main Image */}
              {safeEmbedData.image && (
                <div className="rounded overflow-hidden mt-2 max-w-[400px]">
                  <img src={safeEmbedData.image} alt="" className="w-full object-cover" />
                </div>
              )}

              {/* Embed Footer */}
              {(formattedFooterText || safeEmbedData.timestamp_enabled !== false) && (
                <div className="flex items-center gap-2 text-[11px] text-white/50 pt-1 border-t border-white/5">
                  {safeEmbedData.footer_icon && (
                    <img
                      src={safeEmbedData.footer_icon}
                      alt=""
                      className="w-4 h-4 rounded-full object-cover shrink-0"
                      onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                    />
                  )}
                  <span>
                    {formattedFooterText}
                    {safeEmbedData.timestamp_enabled !== false && (
                      <>
                        {formattedFooterText ? " • " : ""}
                        Today at 11:53 AM
                      </>
                    )}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Card Image inside message if card is enabled */}
          {cardEnabled && imageConfig && (
            <div className="rounded-xl overflow-hidden mt-3 max-w-[480px] border border-white/10 shadow-lg">
              <WelcomePreviewCanvas imageConfig={imageConfig} serverName={serverName} />
            </div>
          )}

          {/* Action Buttons if any */}
          {buttons.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {buttons.map((b, i) => (
                <button
                  key={i}
                  className="px-3 py-1.5 rounded text-xs font-semibold bg-[#4f545c] hover:bg-[#686d73] text-white transition-colors flex items-center gap-1.5"
                >
                  {b.emoji && <span>{b.emoji}</span>}
                  <span>{b.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
