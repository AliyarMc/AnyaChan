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

import React, { useState } from "react";
import {
  RotateCcw,
  Sparkles,
  Variable,
  Check,
  ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Switch } from "@/components/ui/switch";
import { WelcomePreviewCanvas } from "./welcome-preview-canvas";
import { DiscordMessagePreview } from "./discord-message-preview";
import { cn } from "@/lib/utils";
import { WelcomeConfig, DiscordChannel, WelcomeImageConfig } from "@/types/api";

const DISCORD_COLOR_PRESETS = [
  "#2ECC71", "#3498DB", "#9B59B6", "#E91E63", "#F1C40F",
  "#E67E22", "#E74C3C", "#95A5A6", "#607D8B", "#FFFFFF"
];

interface WelcomeFormProps {
  initialConfig: WelcomeConfig;
  channels: DiscordChannel[];
  guildId: string;
  serverName?: string;
}

const defaultImageConfig: WelcomeImageConfig = {
  enabled: false,
  canvas: {
    width: 1020,
    height: 450,
    background_type: "image",
    background_color: "#080808",
    gradient_color1: "#080808",
    gradient_color2: "#140B17",
    background_image_url: "https://cdn.koya.gg/gallery/l/4CqF6Ys.png",
    overlay_opacity: 0.4,
    border_thickness: 2,
    border_color: "#333333"
  },
  avatar: {
    x: 510,
    y: 130,
    size: 130,
    shape: "rounded",
    border_thickness: 4,
    border_color: "#FFFFFF"
  },
  texts: {
    text1: {
      content: "WELCOME",
      x: 510,
      y: 260,
      color: "#FFFFFF",
      font_size: 48,
      is_bold: true
    },
    text2: {
      content: "{user_name}",
      x: 510,
      y: 315,
      color: "#ffffff",
      font_size: 36
    },
    text3: {
      content: "Member #{server_membercount}",
      x: 510,
      y: 370,
      color: "#5865F2",
      font_size: 24
    },
    text4: {
      content: "{server_name}",
      x: 510,
      y: 405,
      color: "#ffffff",
      font_size: 18
    },
    text5: {
      content: "{server_name} • Community",
      x: 510,
      y: 430,
      color: "#A3A3A3",
      font_size: 14
    }
  }
};

export function WelcomeForm({ initialConfig, channels, guildId, serverName = "Discord Server" }: WelcomeFormProps) {
  const [config, setConfig] = useState<WelcomeConfig>(() => ({
    ...initialConfig,
    welcome_type: initialConfig.welcome_type || "simple",
    image_config: initialConfig.image_config || defaultImageConfig
  }));

  const [initialState] = useState<WelcomeConfig>(config);
  const [saving, setSaving] = useState(false);
  const [messageTab, setMessageTab] = useState<"message" | "components">("message");
  const [showVariables, setShowVariables] = useState(false);
  const [sendInDm, setSendInDm] = useState(false);

  const isEmbed = config.welcome_type === "embed";
  const hasChanges = JSON.stringify(config) !== JSON.stringify(initialState);

  const handleSave = async () => {
    setSaving(true);
    const promise = api.updateWelcome(guildId, config);

    toast.promise(promise, {
      loading: "Saving welcome configuration...",
      success: "Changes saved successfully!",
      error: "Failed to update welcome settings",
    });

    try {
      await promise;
    } catch (err: any) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setConfig(initialState);
    toast.info("Changes reset to previous configuration");
  };

  const handleSurpriseMe = () => {
    const randomGradients = [
      ["#1e3c72", "#2a5298"],
      ["#134e5e", "#71b280"],
      ["#2c3e50", "#3498db"],
      ["#0f2027", "#203a43"],
      ["#3a1c71", "#d76d77"]
    ];
    const pick = randomGradients[Math.floor(Math.random() * randomGradients.length)];
    setConfig({
      ...config,
      image_config: {
        ...(config.image_config || defaultImageConfig),
        canvas: {
          ...(config.image_config?.canvas || defaultImageConfig.canvas!),
          background_type: "gradient",
          gradient_color1: pick[0],
          gradient_color2: pick[1],
        }
      }
    });
    toast.success("Surprise! New gradient theme applied.");
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-200">
      {/* ── STEP 1: CHANNEL SELECTION (Seamless, borderless) ── */}
      <div id="setup-step-1" className="flex flex-col gap-2">
        <div className="text-gray-300 text-sm font-bold tracking-wide uppercase">
          <span>Channel</span> <span className="text-red-400">*</span>
        </div>
        <p className="text-white/50 text-sm">
          Select channel where messages are going to be sent.
        </p>

        <div className="w-full max-w-sm mt-1">
          <div className="bg-[#2b2c32] hover:bg-[#323339] rounded-xl flex items-center px-3.5 py-2.5 transition-colors border border-white/10">
            <span className="text-white/40 mr-2 font-mono">#</span>
            <select
              value={config.channel_id || ""}
              onChange={(e) => setConfig({ ...config, channel_id: e.target.value })}
              className="bg-transparent text-white text-sm w-full focus:outline-none cursor-pointer appearance-none"
            >
              <option value="" disabled className="bg-[#2b2c32] text-white">Select a channel...</option>
              {channels.map((c) => (
                <option key={c.id} value={c.id.toString()} className="bg-[#2b2c32] text-white">
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-white/40 shrink-0 pointer-events-none" />
          </div>
        </div>

        <label className="flex items-center gap-2.5 cursor-pointer select-none mt-2 w-fit">
          <input
            type="checkbox"
            checked={sendInDm}
            onChange={(e) => setSendInDm(e.target.checked)}
            className="w-4 h-4 rounded bg-white/10 text-white focus:ring-0 cursor-pointer border-none"
          />
          <span className="text-white/70 text-sm hover:text-white transition-colors">
            Send the message in user DMs
          </span>
        </label>
      </div>

      <div className="h-px bg-white/5 my-6" />

      {/* ── STEP 2: MESSAGE CONFIGURATION & DISCORD LIVE PREVIEW ── */}
      <div id="setup-step-2" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="text-gray-300 text-sm font-bold tracking-wide uppercase">Message</div>
          <p className="text-white/50 text-sm">Set the custom message that will be sent.</p>
        </div>

        {/* Tab & Utility Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
          {/* Pill Tabs */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMessageTab("message")}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors",
                messageTab === "message"
                  ? "bg-white/10 text-white"
                  : "bg-transparent text-white/50 hover:text-white"
              )}
            >
              Message &amp; Embeds
            </button>
            <button
              type="button"
              onClick={() => setMessageTab("components")}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5",
                messageTab === "components"
                  ? "bg-white/10 text-white"
                  : "bg-transparent text-white/50 hover:text-white"
              )}
            >
              <span>Components</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-white/10 text-white/80">
                New
              </span>
            </button>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowVariables(!showVariables)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            >
              <Variable className="w-3.5 h-3.5" />
              <span>Variables</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setConfig({
                  ...config,
                  welcome_type: "embed",
                  welcome_message: "Welcome {user.mention} to **{server.name}**!",
                  embed_data: {
                    title: "Welcome to {server.name}!",
                    description: "Hi {user.mention}, we're excited to have you here! You are member #{server_membercount}.",
                    color: "#5865F2",
                    thumbnail: "{user_avatar}",
                    timestamp_enabled: true
                  }
                });
                toast.success("Preset layout applied!");
              }}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto Setup</span>
            </button>
          </div>
        </div>

        {/* Variables Reference Box */}
        {showVariables && (
          <div className="bg-white/[0.04] rounded-2xl p-4 animate-in fade-in duration-150 border border-white/10">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Available Variables</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono text-white/70">
              <div className="p-2.5 rounded-xl bg-white/[0.03]"><span className="text-white font-bold">{'{user.mention}'}</span> — @Username</div>
              <div className="p-2.5 rounded-xl bg-white/[0.03]"><span className="text-white font-bold">{'{user.name}'}</span> — Plain Username</div>
              <div className="p-2.5 rounded-xl bg-white/[0.03]"><span className="text-white font-bold">{'{server.name}'}</span> — Server Name</div>
              <div className="p-2.5 rounded-xl bg-white/[0.03]"><span className="text-white font-bold">{'{server_membercount}'}</span> — Member Count</div>
              <div className="p-2.5 rounded-xl bg-white/[0.03]"><span className="text-white font-bold">{'{user_avatar}'}</span> — User Avatar URL</div>
              <div className="p-2.5 rounded-xl bg-white/[0.03]"><span className="text-white font-bold">{'{server_icon}'}</span> — Server Icon URL</div>
            </div>
          </div>
        )}

        {/* Side-by-Side Editor & Discord Live Preview */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* Left: Editor Column */}
          <div className="xl:col-span-7 space-y-4">
            {/* Raw Message Card (Clean surface with subtle border) */}
            <div className="bg-white/[0.03] rounded-2xl p-5 space-y-3 border border-white/10">
              <div className="flex items-center gap-3">
                <img
                  src="/utilities/avatar.png"
                  alt="Anya"
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                  onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                />
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-white text-sm">Anya</span>
                  <span className="bg-[#5865f2] text-[10px] font-bold uppercase px-1 text-white rounded">APP</span>
                  <span className="text-white/40 text-xs">Today at 11:53 AM</span>
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={config.welcome_message || ""}
                  onChange={(e) => setConfig({ ...config, welcome_message: e.target.value })}
                  placeholder="Insert image message (e.g. Welcome {user.mention} to **{server.name}**!)"
                  maxLength={2000}
                  className="bg-[#2b2c32] rounded-xl p-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none w-full min-h-[95px] resize-y"
                />
                <div className="text-right text-[11px] text-white/40 font-mono mt-1">
                  {(config.welcome_message || "").length} / 2000
                </div>
              </div>

              {/* Embed Toggle */}
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-medium text-white/80 select-none">
                  Send an embed with this message
                </span>
                <Switch
                  checked={isEmbed}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, welcome_type: checked ? "embed" : "simple" })
                  }
                />
              </div>
            </div>

            {/* Embed Configuration Card */}
            {isEmbed && (
              <div
                className="bg-white/[0.03] rounded-2xl p-5 space-y-4 relative border border-white/10"
                style={{ borderLeft: `4px solid ${config.embed_data?.color || "#5865F2"}` }}
              >
                {/* Swatches */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-white/50">
                      Embed Color
                    </label>
                    <input
                      type="text"
                      value={config.embed_data?.color || "#5865F2"}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          embed_data: { ...config.embed_data, color: e.target.value }
                        })
                      }
                      className="w-24 bg-[#2b2c32] rounded-lg px-2.5 py-1 text-xs text-white font-mono text-center focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    {DISCORD_COLOR_PRESETS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() =>
                          setConfig({
                            ...config,
                            embed_data: { ...config.embed_data, color }
                          })
                        }
                        style={{ backgroundColor: color }}
                        className={cn(
                          "w-6 h-6 rounded-full transition-transform hover:scale-110",
                          config.embed_data?.color?.toLowerCase() === color.toLowerCase() && "ring-2 ring-white scale-110"
                        )}
                        title={color}
                      />
                    ))}
                  </div>
                </div>

                {/* Author Name and Icon */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-xs font-medium text-white/50">Author Name</label>
                    <input
                      type="text"
                      value={config.embed_data?.author_name || ""}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          embed_data: { ...config.embed_data, author_name: e.target.value }
                        })
                      }
                      placeholder="Author text"
                      className="bg-[#2b2c32] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none w-full mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-white/50">Author Icon URL</label>
                    <input
                      type="text"
                      value={config.embed_data?.author_icon || ""}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          embed_data: { ...config.embed_data, author_icon: e.target.value }
                        })
                      }
                      placeholder="https://... or {server_icon}"
                      className="bg-[#2b2c32] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none w-full mt-1"
                    />
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="text-xs font-medium text-white/50">Embed Title</label>
                  <input
                    type="text"
                    value={config.embed_data?.title || ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        embed_data: { ...config.embed_data, title: e.target.value }
                      })
                    }
                    placeholder="Welcome to the server!"
                    className="bg-[#2b2c32] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none w-full mt-1"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-xs font-medium text-white/50">Embed Description</label>
                  <textarea
                    value={config.embed_data?.description || ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        embed_data: { ...config.embed_data, description: e.target.value }
                      })
                    }
                    placeholder="We're glad to have you here, {user.mention}!"
                    rows={3}
                    className="bg-[#2b2c32] rounded-xl p-3.5 text-xs text-white placeholder:text-white/30 focus:outline-none w-full mt-1 resize-y"
                  />
                </div>

                {/* Thumbnail & Image */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-white/50">Thumbnail URL</label>
                    <input
                      type="text"
                      value={config.embed_data?.thumbnail || ""}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          embed_data: { ...config.embed_data, thumbnail: e.target.value }
                        })
                      }
                      placeholder="{user_avatar} or https://..."
                      className="bg-[#2b2c32] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none w-full mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-white/50">Main Image URL</label>
                    <input
                      type="text"
                      value={config.embed_data?.image || ""}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          embed_data: { ...config.embed_data, image: e.target.value }
                        })
                      }
                      placeholder="https://..."
                      className="bg-[#2b2c32] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none w-full mt-1"
                    />
                  </div>
                </div>

                {/* Footer & Timestamp */}
                <div className="pt-2 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-white/50">Footer Text</label>
                      <input
                        type="text"
                        value={config.embed_data?.footer_text || ""}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            embed_data: { ...config.embed_data, footer_text: e.target.value }
                          })
                        }
                        placeholder="Footer text"
                        className="bg-[#2b2c32] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none w-full mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-white/50">Footer Icon URL</label>
                      <input
                        type="text"
                        value={config.embed_data?.footer_icon || ""}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            embed_data: { ...config.embed_data, footer_icon: e.target.value }
                          })
                        }
                        placeholder="https://..."
                        className="bg-[#2b2c32] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none w-full mt-1"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-white/70">Enable Embed Timestamp</span>
                    <Switch
                      checked={config.embed_data?.timestamp_enabled !== false}
                      onCheckedChange={(val) =>
                        setConfig({
                          ...config,
                          embed_data: { ...config.embed_data, timestamp_enabled: val }
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Sticky Discord Live Preview */}
          <div className="xl:col-span-5 sticky top-4 space-y-4">
            <DiscordMessagePreview
              welcomeType={config.welcome_type as "simple" | "embed"}
              messageContent={config.welcome_message || ""}
              embedData={config.embed_data}
              cardEnabled={config.image_config?.enabled}
              imageConfig={config.image_config}
              serverName={serverName}
            />
          </div>
        </div>
      </div>

      <div className="h-px bg-white/5 my-6" />

      {/* ── STEP 3: IMAGE BETA (Canvas, borderless) ── */}
      <div id="setup-step-3" className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="text-gray-300 text-sm font-bold tracking-wide uppercase">Image</div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white/80">
                Beta
              </span>
            </div>
            <p className="text-white/50 text-sm mt-1">Add a custom image to the message.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleSurpriseMe}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-white/80 hover:text-white transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Surprise Me</span>
            </button>

            <Switch
              checked={config.image_config?.enabled || false}
              onCheckedChange={(checked) =>
                setConfig({
                  ...config,
                  image_config: {
                    ...(config.image_config || defaultImageConfig),
                    enabled: checked
                  }
                })
              }
            />
          </div>
        </div>

        {config.image_config?.enabled && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start pt-2">
            {/* Controls */}
            <div className="xl:col-span-5 bg-white/[0.03] rounded-2xl p-5 space-y-4 border border-white/10">
              <div>
                <label className="text-white/60 text-xs font-semibold uppercase tracking-wide block mb-2">
                  Background Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["gradient", "solid", "image"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() =>
                        setConfig({
                          ...config,
                          image_config: {
                            ...(config.image_config || defaultImageConfig),
                            canvas: {
                              ...(config.image_config?.canvas || defaultImageConfig.canvas!),
                              background_type: type
                            }
                          }
                        })
                      }
                      className={cn(
                        "py-2 text-xs font-medium rounded-xl transition-colors capitalize",
                        config.image_config?.canvas?.background_type === type
                          ? "bg-white/15 text-white font-bold"
                          : "bg-white/5 text-white/40 hover:text-white"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Background Image URL */}
              {config.image_config?.canvas?.background_type === "image" && (
                <div>
                  <label className="text-white/60 text-xs font-semibold uppercase tracking-wide block mb-2">
                    Background Image
                  </label>
                  <input
                    type="text"
                    value={config.image_config?.canvas?.background_image_url || ""}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        image_config: {
                          ...(config.image_config || defaultImageConfig),
                          canvas: {
                            ...(config.image_config?.canvas || defaultImageConfig.canvas!),
                            background_image_url: e.target.value
                          }
                        }
                      })
                    }
                    placeholder="Insert image URL"
                    className="bg-[#2b2c32] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none w-full"
                  />
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setConfig({
                          ...config,
                          image_config: {
                            ...(config.image_config || defaultImageConfig),
                            canvas: {
                              ...(config.image_config?.canvas || defaultImageConfig.canvas!),
                              background_image_url: "https://cdn.koya.gg/gallery/l/4CqF6Ys.png"
                            }
                          }
                        })
                      }
                      className="text-[11px] text-white/50 hover:text-white px-2.5 py-1 rounded-lg bg-white/5"
                    >
                      Use Gallery Default
                    </button>
                  </div>
                </div>
              )}

              {/* Gradient Colors */}
              {config.image_config?.canvas?.background_type === "gradient" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-white/50">Gradient Color 1</label>
                    <input
                      type="text"
                      value={config.image_config?.canvas?.gradient_color1 || "#080808"}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          image_config: {
                            ...(config.image_config || defaultImageConfig),
                            canvas: {
                              ...(config.image_config?.canvas || defaultImageConfig.canvas!),
                              gradient_color1: e.target.value
                            }
                          }
                        })
                      }
                      className="bg-[#2b2c32] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none w-full mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-white/50">Gradient Color 2</label>
                    <input
                      type="text"
                      value={config.image_config?.canvas?.gradient_color2 || "#140B17"}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          image_config: {
                            ...(config.image_config || defaultImageConfig),
                            canvas: {
                              ...(config.image_config?.canvas || defaultImageConfig.canvas!),
                              gradient_color2: e.target.value
                            }
                          }
                        })
                      }
                      className="bg-[#2b2c32] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none w-full mt-1"
                    />
                  </div>
                </div>
              )}

              {/* Avatar Shape */}
              <div>
                <label className="text-white/60 text-xs font-semibold uppercase tracking-wide block mb-2">
                  Avatar Shape
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["rounded", "square"].map((shape) => (
                    <button
                      key={shape}
                      type="button"
                      onClick={() =>
                        setConfig({
                          ...config,
                          image_config: {
                            ...(config.image_config || defaultImageConfig),
                            avatar: {
                              ...(config.image_config?.avatar || defaultImageConfig.avatar!),
                              shape
                            }
                          }
                        })
                      }
                      className={cn(
                        "py-2 text-xs font-medium rounded-xl transition-colors capitalize",
                        config.image_config?.avatar?.shape === shape
                          ? "bg-white/15 text-white font-bold"
                          : "bg-white/5 text-white/40 hover:text-white"
                      )}
                    >
                      {shape}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Live Canvas */}
            <div className="xl:col-span-7 sticky top-4 bg-white/[0.03] rounded-2xl p-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-3">
                Live Card Canvas
              </div>
              <div className="rounded-xl overflow-hidden shadow-lg">
                <WelcomePreviewCanvas
                  imageConfig={config.image_config}
                  serverName={serverName}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── FLOATING SAVE BAR (Clean flat shadow, borderless) ── */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-8 z-50 transition-all duration-200">
        <div className="shadow-2xl rounded-2xl py-3 px-5 select-none bg-[#2b2c32] max-w-xl mx-auto sm:mx-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="font-medium text-sm text-gray-200">
              {hasChanges ? "You have unsaved changes! Save or reset them." : "All changes are saved."}
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleReset}
                disabled={!hasChanges || saving}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-1 sm:flex-none"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 flex-1 sm:flex-none disabled:opacity-50"
              >
                {saving ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
