"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { MessageSquare, Calendar } from "lucide-react";
import { WelcomePreviewCanvas } from "./welcome-preview-canvas";

interface DiscordMessagePreviewProps {
  welcomeType: "simple" | "embed";
  messageContent?: string;
  embedData?: {
    title?: string;
    description?: string;
    color?: string;
    thumbnail?: string;
    image?: string;
    author_name?: string;
    author_icon?: string;
    footer_text?: string;
    footer_icon?: string;
    timestamp_enabled?: boolean;
  };
  cardEnabled?: boolean;
  imageConfig?: any;
  serverName?: string;
  userName?: string;
  avatarUrl?: string;
  buttons?: {
    label: string;
    style: number; // 1 = grey, 2 = blurple, 3 = green, 4 = red
    emoji?: string;
  }[];
}

export function DiscordMessagePreview({
  welcomeType,
  messageContent = "",
  embedData = {},
  cardEnabled = false,
  imageConfig = null,
  serverName = "AliyarMC",
  userName = "dinixooji.",
  avatarUrl = "https://cdn.discordapp.com/embed/avatars/0.png",
  buttons = []
}: DiscordMessagePreviewProps) {
  
  // Format variables in strings in real-time
  const formatText = (text: string) => {
    if (!text) return "";
    return text
      .replace(/{user}/g, `@${userName}`)
      .replace(/{user_name}/g, userName)
      .replace(/{user_id}/g, "123456789012345678")
      .replace(/{server_name}/g, serverName)
      .replace(/{server_membercount}/g, "364")
      .replace(/{user_joindate}/g, "Tue, Aug 25, 2026");
  };

  // Convert embed hex color (can be e.g. "3498db" or "#3498db" or number) to css valid hex/rgb
  const getEmbedColor = (hex: string = "") => {
    if (!hex) return "#FC5824"; // default koya/primary orange
    let color = hex.trim();
    if (color.startsWith("#")) return color;
    if (/^[0-9A-F]{6}$/i.test(color)) return `#${color}`;
    // handle decimal color code if exists
    const num = parseInt(color, 10);
    if (!isNaN(num)) {
      return `#${num.toString(16).padStart(6, "0")}`;
    }
    return "#FC5824";
  };

  const formattedContent = formatText(messageContent);
  const formattedEmbedTitle = formatText(embedData.title || "");
  const formattedEmbedDesc = formatText(embedData.description || "");
  const formattedAuthorName = formatText(embedData.author_name || "");
  const formattedFooterText = formatText(embedData.footer_text || "");

  const embedColor = getEmbedColor(embedData.color);

  return (
    <div className="bg-[#141B2D] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Discord Preview</span>
        <span className="text-[9px] bg-slate-800/80 px-2 py-0.5 rounded text-slate-400 font-bold uppercase">Mockup</span>
      </div>

      {/* Discord Client Layout Frame */}
      <div className="bg-[#313338] text-[#dbdee1] rounded-2xl p-4 shadow-inner border border-black/10 font-sans text-sm select-none">
        <div className="flex gap-4 items-start">
          {/* Avatar Icon */}
          <div className="h-10 w-10 shrink-0 rounded-full bg-[#5865F2] flex items-center justify-center text-white overflow-hidden shadow">
            <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
          </div>

          {/* Message Content Area */}
          <div className="flex-1 min-w-0 space-y-2">
            {/* Header info */}
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white hover:underline cursor-pointer">Anya</span>
              <span className="bg-[#5865F2] text-[9px] font-black uppercase tracking-wider text-white px-1.5 py-0.5 rounded text-center leading-none">BOT</span>
              <span className="text-xs text-[#949ba4]">Today at 9:45 PM</span>
            </div>

            {/* Response contents */}
            {welcomeType === "simple" ? (
              formattedContent ? (
                <p className="text-[#dbdee1] break-words whitespace-pre-wrap">{formattedContent}</p>
              ) : (
                <p className="text-[#949ba4] italic">Empty message content...</p>
              )
            ) : (
              /* Rich Embed Layout */
              <div 
                className="bg-[#2b2d31] rounded-lg border-l-4 p-4 space-y-3 shadow-md max-w-[520px]"
                style={{ borderLeftColor: embedColor }}
              >
                {/* Embed Author */}
                {formattedAuthorName && (
                  <div className="flex items-center gap-2">
                    {embedData.author_icon && (
                      <img 
                        src={embedData.author_icon.includes("{server_icon}") ? "/assets/brand-logo.png" : embedData.author_icon} 
                        alt="Author Icon" 
                        className="h-5 w-5 rounded-full object-cover"
                        onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                      />
                    )}
                    <span className="text-xs font-semibold text-white">{formattedAuthorName}</span>
                  </div>
                )}

                {/* Embed Body with Thumbnail */}
                <div className="flex gap-4 items-start justify-between">
                  <div className="flex-1 min-w-0 space-y-1.5">
                    {formattedEmbedTitle && (
                      <h4 className="font-bold text-white hover:underline cursor-pointer text-[15px]">{formattedEmbedTitle}</h4>
                    )}
                    {formattedEmbedDesc && (
                      <p className="text-[13px] text-[#dbdee1] break-words whitespace-pre-wrap">{formattedEmbedDesc}</p>
                    )}
                  </div>
                  
                  {embedData.thumbnail && (
                    <img 
                      src={embedData.thumbnail.includes("{user_avatar}") ? avatarUrl : embedData.thumbnail} 
                      alt="Thumbnail" 
                      className="h-14 w-14 rounded-lg object-cover shrink-0 ml-3"
                      onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                    />
                  )}
                </div>

                {/* Embed Main Image */}
                {embedData.image && (
                  <div className="rounded-lg overflow-hidden mt-2 max-w-[400px] border border-black/10">
                    <img src={embedData.image} alt="Embed Image" className="w-full object-cover" />
                  </div>
                )}

                {/* Welcome Card Image inside Embed (if card enabled and embed type) */}
                {cardEnabled && imageConfig && (
                  <div className="rounded-xl overflow-hidden mt-3 border border-black/15 shadow max-w-[450px]">
                    <WelcomePreviewCanvas imageConfig={imageConfig} serverName={serverName} />
                  </div>
                )}

                {/* Embed Footer */}
                {(formattedFooterText || embedData.timestamp_enabled) && (
                  <div className="flex items-center gap-2 text-[10px] text-[#949ba4] font-medium pt-1 border-t border-white/[0.03]">
                    {embedData.footer_icon && (
                      <img 
                        src={embedData.footer_icon} 
                        alt="Footer Icon" 
                        className="h-4 w-4 rounded-full object-cover"
                        onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                      />
                    )}
                    <span>
                      {formattedFooterText}
                      {embedData.timestamp_enabled !== false && (
                        <>
                          {formattedFooterText ? " • " : ""}
                          Today at 9:45 PM
                        </>
                      )}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Welcome Card Image Attachment (if card enabled and simple response type) */}
            {welcomeType === "simple" && cardEnabled && imageConfig && (
              <div className="rounded-xl overflow-hidden mt-3 border border-black/15 shadow max-w-[450px]">
                <WelcomePreviewCanvas imageConfig={imageConfig} serverName={serverName} />
              </div>
            )}

            {/* Interactive Discord Buttons Mock */}
            {buttons && buttons.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 pl-1">
                {buttons.map((btn, idx) => {
                  let btnBgClass = "bg-[#5865F2] hover:bg-[#4752C4]"; // Blurple (2)
                  if (btn.style === 1) btnBgClass = "bg-[#4e5058] hover:bg-[#6d6f78]"; // Grey
                  if (btn.style === 3) btnBgClass = "bg-[#248046] hover:bg-[#1a6535]"; // Green
                  if (btn.style === 4) btnBgClass = "bg-[#da373c] hover:bg-[#a92b2f]"; // Red

                  return (
                    <button
                      key={idx}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm active:scale-95",
                        btnBgClass
                      )}
                    >
                      {btn.emoji && <span className="text-sm">{btn.emoji}</span>}
                      <span>{btn.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
