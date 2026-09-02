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
  ChevronDown,
  Layout,
  User,
  Type
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Switch } from "@/components/ui/switch";
import { WelcomePreviewCanvas } from "./welcome-preview-canvas";
import { DiscordMessagePreview } from "./discord-message-preview";
import { cn } from "@/lib/utils";
import { WelcomeConfig, DiscordChannel, WelcomeImageConfig } from "@/types/api";

const renderFormattedWords = (content: string, baseColor: string, accentColor: string) => {
  if (!content) return <span style={{ color: baseColor }}>Empty</span>;
  const regex = /\[(accent|#[0-9a-fA-F]{6}):(.*?)\]/g;
  const segments: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push(
        <span key={key++} style={{ color: baseColor }}>
          {content.substring(lastIndex, match.index)}
        </span>
      );
    }
    const colorSpec = match[1];
    const segText = match[2];
    const segColor = colorSpec === "accent" ? accentColor : colorSpec;
    segments.push(
      <span key={key++} style={{ color: segColor }} className="font-bold underline decoration-dotted">
        {segText}
      </span>
    );
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < content.length) {
    segments.push(
      <span key={key++} style={{ color: baseColor }}>
        {content.substring(lastIndex)}
      </span>
    );
  }
  return <span className="flex items-center gap-0.5 flex-wrap">{segments}</span>;
};

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
    background_type: "gradient",
    background_color: "#080808",
    gradient_color1: "#080808",
    gradient_color2: "#140B17",
    background_image_url: "https://cdn.koya.gg/gallery/l/4CqF6Ys.png",
    overlay_opacity: 0.4,
    border_thickness: 8,
    border_color: "#FF6B00",
    border_enabled: true
  },
  avatar: {
    x: 510,
    y: 180,
    size: 150,
    shape: "rounded",
    border_thickness: 6,
    border_color: "#FF6B00",
    border_enabled: true
  },
  texts: {
    text1: {
      content: "WELCOME",
      x: 510,
      y: 290,
      color: "#FFFFFF",
      font_size: 48,
      is_bold: true
    },
    text2: {
      content: "{user_name}",
      x: 510,
      y: 345,
      color: "#ffffff",
      font_size: 36,
      is_bold: true
    },
    text3: {
      content: "Member #{server_membercount}",
      x: 510,
      y: 390,
      color: "#5865F2",
      font_size: 24,
      is_bold: true
    },
    text4: {
      content: "{server_name}",
      x: 510,
      y: 420,
      color: "#ffffff",
      font_size: 18,
      is_bold: false
    },
    text5: {
      content: "{server_name} • Community",
      x: 510,
      y: 435,
      color: "#A3A3A3",
      font_size: 14,
      is_bold: false
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

  // Welcome Card Designer States
  const [cardTab, setCardTab] = useState<"canvas" | "avatar" | "texts">("canvas");
  const [activeTextKey, setActiveTextKey] = useState<"text1" | "text2" | "text3" | "text4" | "text5">("text1");
  const [selectedCanvasElement, setSelectedCanvasElement] = useState<string | null>(null);

  const isEmbed = config.welcome_type === "embed";
  const hasChanges = JSON.stringify(config) !== JSON.stringify(initialState);

  const updateCanvasConfig = (patch: Partial<NonNullable<WelcomeImageConfig["canvas"]>>) => {
    setConfig((prev) => ({
      ...prev,
      image_config: {
        ...(prev.image_config || defaultImageConfig),
        canvas: {
          ...(prev.image_config?.canvas || defaultImageConfig.canvas!),
          ...patch
        }
      }
    }));
  };

  const updateAvatarConfig = (patch: Partial<NonNullable<WelcomeImageConfig["avatar"]>>) => {
    setConfig((prev) => ({
      ...prev,
      image_config: {
        ...(prev.image_config || defaultImageConfig),
        avatar: {
          ...(prev.image_config?.avatar || defaultImageConfig.avatar!),
          ...patch
        }
      }
    }));
  };

  const handlePositionChange = (element: string, x: number, y: number) => {
    if (!config.image_config) return;
    if (element === "avatar") {
      updateAvatarConfig({ x, y });
    } else if (element.startsWith("text")) {
      const texts = config.image_config.texts || defaultImageConfig.texts!;
      const curText = texts[element as keyof typeof texts] || defaultImageConfig.texts![element as keyof typeof texts];
      if (curText) {
        setConfig((prev) => ({
          ...prev,
          image_config: {
            ...prev.image_config!,
            texts: {
              ...texts,
              [element]: {
                ...curText,
                x,
                y
              }
            }
          }
        }));
      }
    }
  };

  const handleSelectCanvasElement = (element: string) => {
    setSelectedCanvasElement(element);
    if (element === "avatar") {
      setCardTab("avatar");
    } else if (element.startsWith("text")) {
      setCardTab("texts");
      setActiveTextKey(element as any);
    }
  };

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

      {/* ── STEP 3: IMAGE BETA (Welcome Card Designer) ── */}
      <div id="setup-step-3" className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="text-gray-300 text-sm font-bold tracking-wide uppercase">Welcome Card</div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white/80">
                Card Designer
              </span>
            </div>
            <p className="text-white/50 text-sm mt-1">
              Customize the welcome card border, colors, background, avatar, text positions, and individual word styling.
            </p>
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

            <div className="flex items-center gap-2 bg-[#2b2c32] px-3 py-1.5 rounded-xl border border-white/10">
              <span className="text-xs text-white/70 font-medium">Enable Card</span>
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
        </div>

        {config.image_config?.enabled && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start pt-2">
            {/* Left Column: Card Designer Controls */}
            <div className="xl:col-span-6 bg-white/[0.03] rounded-2xl p-5 space-y-5 border border-white/10">
              {/* Main Sub-Navigation Pills */}
              <div className="flex items-center gap-1.5 p-1 bg-[#2b2c32] rounded-xl border border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    setCardTab("canvas");
                    setSelectedCanvasElement(null);
                  }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all",
                    cardTab === "canvas"
                      ? "bg-white/15 text-white shadow-sm"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Layout className="w-3.5 h-3.5" />
                  <span>Canvas &amp; Border</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCardTab("avatar");
                    setSelectedCanvasElement("avatar");
                  }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all",
                    cardTab === "avatar"
                      ? "bg-white/15 text-white shadow-sm"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  )}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Avatar</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCardTab("texts");
                    setSelectedCanvasElement(activeTextKey);
                  }}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-semibold transition-all",
                    cardTab === "texts"
                      ? "bg-white/15 text-white shadow-sm"
                      : "text-white/50 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Type className="w-3.5 h-3.5" />
                  <span>Texts &amp; Words</span>
                </button>
              </div>

              {/* ───────── SUB-TAB 1: CANVAS & BORDER ───────── */}
              {cardTab === "canvas" && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  {/* Card Border Section (Border Yes or Not, Border Color, Border Thickness) */}
                  <div className="p-4 rounded-xl bg-[#2b2c32]/70 border border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          Card Outer Border
                        </span>
                        <span className="text-[11px] text-white/50">
                          Toggle card border on or off
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/60 font-semibold">
                          {config.image_config?.canvas?.border_enabled !== false ? "Border: Yes" : "Border: No"}
                        </span>
                        <Switch
                          checked={config.image_config?.canvas?.border_enabled !== false}
                          onCheckedChange={(checked) =>
                            updateCanvasConfig({ border_enabled: checked })
                          }
                        />
                      </div>
                    </div>

                    {config.image_config?.canvas?.border_enabled !== false && (
                      <div className="space-y-4 pt-2 border-t border-white/5">
                        {/* Border Color */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-semibold text-white/70">
                              Border Color
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={config.image_config?.canvas?.border_color || "#FF6B00"}
                                onChange={(e) => updateCanvasConfig({ border_color: e.target.value })}
                                className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
                              />
                              <input
                                type="text"
                                value={config.image_config?.canvas?.border_color || "#FF6B00"}
                                onChange={(e) => updateCanvasConfig({ border_color: e.target.value })}
                                className="w-24 bg-[#1f2024] rounded-lg px-2.5 py-1 text-xs text-white font-mono text-center focus:outline-none border border-white/10"
                              />
                            </div>
                          </div>

                          {/* Quick Swatches */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {DISCORD_COLOR_PRESETS.map((color) => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => updateCanvasConfig({ border_color: color })}
                                style={{ backgroundColor: color }}
                                className={cn(
                                  "w-6 h-6 rounded-full transition-transform hover:scale-110",
                                  config.image_config?.canvas?.border_color?.toLowerCase() === color.toLowerCase() && "ring-2 ring-white scale-110"
                                )}
                                title={color}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Border Thickness */}
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-white/70 font-semibold">Border Thickness</span>
                            <span className="text-white font-mono bg-white/5 px-2 py-0.5 rounded">
                              {config.image_config?.canvas?.border_thickness ?? 8}px
                            </span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={24}
                            value={config.image_config?.canvas?.border_thickness ?? 8}
                            onChange={(e) => updateCanvasConfig({ border_thickness: parseInt(e.target.value, 10) || 0 })}
                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#5865F2]"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Background Type */}
                  <div>
                    <label className="text-white/60 text-xs font-semibold uppercase tracking-wide block mb-2">
                      Background Type
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {["gradient", "solid", "image"].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => updateCanvasConfig({ background_type: type })}
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
                    <div className="space-y-3">
                      <div>
                        <label className="text-white/60 text-xs font-semibold uppercase tracking-wide block mb-1.5">
                          Background Image URL
                        </label>
                        <input
                          type="text"
                          value={config.image_config?.canvas?.background_image_url || ""}
                          onChange={(e) => updateCanvasConfig({ background_image_url: e.target.value })}
                          placeholder="Insert image URL"
                          className="bg-[#2b2c32] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none w-full border border-white/5"
                        />
                        <div className="mt-2 flex gap-2">
                          <button
                            type="button"
                            onClick={() => updateCanvasConfig({ background_image_url: "https://cdn.koya.gg/gallery/l/4CqF6Ys.png" })}
                            className="text-[11px] text-white/50 hover:text-white px-2.5 py-1 rounded-lg bg-white/5"
                          >
                            Use Gallery Default
                          </button>
                        </div>
                      </div>

                      {/* Overlay Opacity */}
                      <div>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className="text-white/70 font-semibold">Dark Overlay Opacity</span>
                          <span className="text-white font-mono bg-white/5 px-2 py-0.5 rounded">
                            {Math.round((config.image_config?.canvas?.overlay_opacity ?? 0.4) * 100)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={Math.round((config.image_config?.canvas?.overlay_opacity ?? 0.4) * 100)}
                          onChange={(e) => updateCanvasConfig({ overlay_opacity: parseInt(e.target.value, 10) / 100 })}
                          className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#5865F2]"
                        />
                      </div>
                    </div>
                  )}

                  {/* Solid Color */}
                  {config.image_config?.canvas?.background_type === "solid" && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold text-white/70">Solid Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={config.image_config?.canvas?.background_color || "#080808"}
                            onChange={(e) => updateCanvasConfig({ background_color: e.target.value })}
                            className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
                          />
                          <input
                            type="text"
                            value={config.image_config?.canvas?.background_color || "#080808"}
                            onChange={(e) => updateCanvasConfig({ background_color: e.target.value })}
                            className="w-24 bg-[#1f2024] rounded-lg px-2.5 py-1 text-xs text-white font-mono text-center focus:outline-none border border-white/10"
                          />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {["#080808", "#121214", "#1e1f22", "#0d1117", "#1a1b26", "#140B17"].map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => updateCanvasConfig({ background_color: c })}
                            style={{ backgroundColor: c }}
                            className={cn(
                              "w-6 h-6 rounded-full border border-white/20 transition-transform hover:scale-110",
                              config.image_config?.canvas?.background_color === c && "ring-2 ring-white scale-110"
                            )}
                            title={c}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Gradient Colors */}
                  {config.image_config?.canvas?.background_type === "gradient" && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-medium text-white/50">Top Color</label>
                            <input
                              type="color"
                              value={config.image_config?.canvas?.gradient_color1 || "#080808"}
                              onChange={(e) => updateCanvasConfig({ gradient_color1: e.target.value })}
                              className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent p-0"
                            />
                          </div>
                          <input
                            type="text"
                            value={config.image_config?.canvas?.gradient_color1 || "#080808"}
                            onChange={(e) => updateCanvasConfig({ gradient_color1: e.target.value })}
                            className="bg-[#2b2c32] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none w-full border border-white/5"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-medium text-white/50">Bottom Color</label>
                            <input
                              type="color"
                              value={config.image_config?.canvas?.gradient_color2 || "#140B17"}
                              onChange={(e) => updateCanvasConfig({ gradient_color2: e.target.value })}
                              className="w-4 h-4 rounded cursor-pointer border-0 bg-transparent p-0"
                            />
                          </div>
                          <input
                            type="text"
                            value={config.image_config?.canvas?.gradient_color2 || "#140B17"}
                            onChange={(e) => updateCanvasConfig({ gradient_color2: e.target.value })}
                            className="bg-[#2b2c32] rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none w-full border border-white/5"
                          />
                        </div>
                      </div>

                      {/* Gradient Presets */}
                      <div>
                        <span className="text-[11px] text-white/40 block mb-1.5">Preset Themes</span>
                        <div className="flex gap-2 flex-wrap">
                          {[
                            { name: "Night Glow", c1: "#080808", c2: "#140B17" },
                            { name: "Ocean", c1: "#0f2027", c2: "#203a43" },
                            { name: "Sunset", c1: "#1e130c", c2: "#9a1f40" },
                            { name: "Cyber", c1: "#120c1f", c2: "#3b1e54" },
                            { name: "Emerald", c1: "#0a1917", c2: "#134e5e" },
                          ].map((p) => (
                            <button
                              key={p.name}
                              type="button"
                              onClick={() => updateCanvasConfig({ gradient_color1: p.c1, gradient_color2: p.c2 })}
                              className="px-2.5 py-1 rounded-lg text-[11px] bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors border border-white/5"
                            >
                              {p.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ───────── SUB-TAB 2: AVATAR ───────── */}
              {cardTab === "avatar" && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  {/* Shape */}
                  <div>
                    <label className="text-white/60 text-xs font-semibold uppercase tracking-wide block mb-2">
                      Avatar Shape
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {["rounded", "square"].map((shape) => (
                        <button
                          key={shape}
                          type="button"
                          onClick={() => updateAvatarConfig({ shape })}
                          className={cn(
                            "py-2 text-xs font-medium rounded-xl transition-colors capitalize",
                            config.image_config?.avatar?.shape === shape
                              ? "bg-white/15 text-white font-bold"
                              : "bg-white/5 text-white/40 hover:text-white"
                          )}
                        >
                          {shape === "rounded" ? "Circle (Rounded)" : "Square"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Avatar Border Card */}
                  <div className="p-4 rounded-xl bg-[#2b2c32]/70 border border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          Avatar Border
                        </span>
                        <span className="text-[11px] text-white/50">
                          Toggle avatar border outline
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/60 font-semibold">
                          {config.image_config?.avatar?.border_enabled !== false ? "Border: Yes" : "Border: No"}
                        </span>
                        <Switch
                          checked={config.image_config?.avatar?.border_enabled !== false}
                          onCheckedChange={(checked) =>
                            updateAvatarConfig({ border_enabled: checked })
                          }
                        />
                      </div>
                    </div>

                    {config.image_config?.avatar?.border_enabled !== false && (
                      <div className="space-y-4 pt-2 border-t border-white/5">
                        {/* Avatar Border Color */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-semibold text-white/70">
                              Border Color
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={config.image_config?.avatar?.border_color || "#FFFFFF"}
                                onChange={(e) => updateAvatarConfig({ border_color: e.target.value })}
                                className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
                              />
                              <input
                                type="text"
                                value={config.image_config?.avatar?.border_color || "#FFFFFF"}
                                onChange={(e) => updateAvatarConfig({ border_color: e.target.value })}
                                className="w-24 bg-[#1f2024] rounded-lg px-2.5 py-1 text-xs text-white font-mono text-center focus:outline-none border border-white/10"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            {DISCORD_COLOR_PRESETS.map((color) => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => updateAvatarConfig({ border_color: color })}
                                style={{ backgroundColor: color }}
                                className={cn(
                                  "w-6 h-6 rounded-full transition-transform hover:scale-110",
                                  config.image_config?.avatar?.border_color?.toLowerCase() === color.toLowerCase() && "ring-2 ring-white scale-110"
                                )}
                                title={color}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Avatar Border Thickness */}
                        <div>
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <span className="text-white/70 font-semibold">Border Thickness</span>
                            <span className="text-white font-mono bg-white/5 px-2 py-0.5 rounded">
                              {config.image_config?.avatar?.border_thickness ?? 4}px
                            </span>
                          </div>
                          <input
                            type="range"
                            min={0}
                            max={20}
                            value={config.image_config?.avatar?.border_thickness ?? 4}
                            onChange={(e) => updateAvatarConfig({ border_thickness: parseInt(e.target.value, 10) || 0 })}
                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#5865F2]"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Avatar Size */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-white/70 font-semibold">Avatar Size</span>
                      <span className="text-white font-mono bg-white/5 px-2 py-0.5 rounded">
                        {config.image_config?.avatar?.size ?? 150}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={60}
                      max={240}
                      value={config.image_config?.avatar?.size ?? 150}
                      onChange={(e) => updateAvatarConfig({ size: parseInt(e.target.value, 10) || 150 })}
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#5865F2]"
                    />
                  </div>

                  {/* Avatar Position X & Y */}
                  <div className="space-y-3 p-4 rounded-xl bg-[#2b2c32]/50 border border-white/5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        Avatar Position
                      </span>
                      <button
                        type="button"
                        onClick={() => updateAvatarConfig({ x: 510, y: 180 })}
                        className="text-[11px] text-[#5865F2] hover:underline"
                      >
                        Reset Position
                      </button>
                    </div>

                    {/* X Position */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-white/60">Position X (Horizontal)</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            max={1020}
                            value={config.image_config?.avatar?.x ?? 510}
                            onChange={(e) => updateAvatarConfig({ x: parseInt(e.target.value, 10) || 0 })}
                            className="w-16 bg-[#1f2024] rounded px-2 py-0.5 text-xs text-white font-mono text-center focus:outline-none border border-white/10"
                          />
                          <button
                            type="button"
                            onClick={() => updateAvatarConfig({ x: 510 })}
                            className="text-[10px] bg-white/5 hover:bg-white/10 px-1.5 py-0.5 rounded text-white/70"
                          >
                            Center
                          </button>
                        </div>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={1020}
                        value={config.image_config?.avatar?.x ?? 510}
                        onChange={(e) => updateAvatarConfig({ x: parseInt(e.target.value, 10) || 0 })}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#5865F2]"
                      />
                    </div>

                    {/* Y Position */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-white/60">Position Y (Vertical)</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            max={450}
                            value={config.image_config?.avatar?.y ?? 180}
                            onChange={(e) => updateAvatarConfig({ y: parseInt(e.target.value, 10) || 0 })}
                            className="w-16 bg-[#1f2024] rounded px-2 py-0.5 text-xs text-white font-mono text-center focus:outline-none border border-white/10"
                          />
                          <button
                            type="button"
                            onClick={() => updateAvatarConfig({ y: 180 })}
                            className="text-[10px] bg-white/5 hover:bg-white/10 px-1.5 py-0.5 rounded text-white/70"
                          >
                            Center
                          </button>
                        </div>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={450}
                        value={config.image_config?.avatar?.y ?? 180}
                        onChange={(e) => updateAvatarConfig({ y: parseInt(e.target.value, 10) || 0 })}
                        className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#5865F2]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ───────── SUB-TAB 3: TEXTS & WORDS ───────── */}
              {cardTab === "texts" && (
                <div className="space-y-5 animate-in fade-in duration-150">
                  {/* Text Slot Selector */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {(["text1", "text2", "text3", "text4", "text5"] as const).map((key, idx) => {
                      const txtObj = config.image_config?.texts?.[key];
                      const hasContent = Boolean(txtObj?.content);
                      const labels = ["Title", "Username", "Count", "Server", "Footer"];
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setActiveTextKey(key);
                            setSelectedCanvasElement(key);
                          }}
                          className={cn(
                            "px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5",
                            activeTextKey === key
                              ? "bg-white/15 text-white ring-1 ring-white/20"
                              : "bg-[#2b2c32] text-white/50 hover:text-white"
                          )}
                        >
                          <span>{`Text ${idx + 1}`}</span>
                          <span className="text-[10px] opacity-70 font-normal">({labels[idx]})</span>
                          {hasContent && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Active Text Configuration Card */}
                  {(() => {
                    const curText = config.image_config?.texts?.[activeTextKey] || {
                      content: "",
                      x: 510,
                      y: 290,
                      color: "#FFFFFF",
                      font_size: 24,
                      is_bold: true
                    };

                    const updateActiveText = (patch: Partial<typeof curText>) => {
                      const texts = config.image_config?.texts || defaultImageConfig.texts!;
                      setConfig({
                        ...config,
                        image_config: {
                          ...(config.image_config || defaultImageConfig),
                          texts: {
                            ...texts,
                            [activeTextKey]: {
                              ...curText,
                              ...patch
                            }
                          }
                        }
                      });
                    };

                    return (
                      <div className="space-y-4">
                        {/* Content Input with Word Styling Toolbar */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-white/70">
                              Text Content &amp; Word Info
                            </label>
                            <span className="text-[11px] text-white/40 font-mono">
                              {(curText.content || "").length} chars
                            </span>
                          </div>

                          {/* Quick Insert Badges for Words and Variables */}
                          <div className="space-y-2 p-3 rounded-xl bg-[#1f2024]/60 border border-white/5">
                            <div>
                              <span className="text-[10px] font-bold uppercase text-white/40 block mb-1">
                                Color Selected / Specific Words:
                              </span>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateActiveText({
                                      content: (curText.content || "") + " [accent:Word]"
                                    });
                                  }}
                                  className="px-2 py-0.5 text-[11px] font-semibold bg-[#FF6B00]/20 hover:bg-[#FF6B00]/30 text-[#FF6B00] rounded-md border border-[#FF6B00]/30 transition-colors"
                                >
                                  [accent:Word]
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateActiveText({
                                      content: (curText.content || "") + " [#3498DB:Word]"
                                    });
                                  }}
                                  className="px-2 py-0.5 text-[11px] font-semibold bg-[#3498DB]/20 hover:bg-[#3498DB]/30 text-[#3498DB] rounded-md border border-[#3498DB]/30 transition-colors"
                                >
                                  [#3498DB:Word]
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateActiveText({
                                      content: (curText.content || "") + " [#2ECC71:Word]"
                                    });
                                  }}
                                  className="px-2 py-0.5 text-[11px] font-semibold bg-[#2ECC71]/20 hover:bg-[#2ECC71]/30 text-[#2ECC71] rounded-md border border-[#2ECC71]/30 transition-colors"
                                >
                                  [#2ECC71:Word]
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateActiveText({
                                      content: (curText.content || "") + " [#E74C3C:Word]"
                                    });
                                  }}
                                  className="px-2 py-0.5 text-[11px] font-semibold bg-[#E74C3C]/20 hover:bg-[#E74C3C]/30 text-[#E74C3C] rounded-md border border-[#E74C3C]/30 transition-colors"
                                >
                                  [#E74C3C:Word]
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateActiveText({
                                      content: (curText.content || "") + " [#F1C40F:Word]"
                                    });
                                  }}
                                  className="px-2 py-0.5 text-[11px] font-semibold bg-[#F1C40F]/20 hover:bg-[#F1C40F]/30 text-[#F1C40F] rounded-md border border-[#F1C40F]/30 transition-colors"
                                >
                                  [#F1C40F:Word]
                                </button>
                              </div>
                            </div>

                            <div>
                              <span className="text-[10px] font-bold uppercase text-white/40 block mb-1">
                                Variables:
                              </span>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {[
                                  "{user_name}",
                                  "{server_name}",
                                  "{server_membercount}",
                                  "{user_id}",
                                  "{user_nick}"
                                ].map((v) => (
                                  <button
                                    key={v}
                                    type="button"
                                    onClick={() => {
                                      updateActiveText({
                                        content: (curText.content || "") + ` ${v}`
                                      });
                                    }}
                                    className="px-2 py-0.5 text-[11px] font-mono bg-white/5 hover:bg-white/10 text-white/70 rounded-md border border-white/5 transition-colors"
                                  >
                                    {v}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>

                          <input
                            type="text"
                            value={curText.content || ""}
                            onChange={(e) => updateActiveText({ content: e.target.value })}
                            placeholder="e.g. WELCOME [accent:TO] {server_name}"
                            className="bg-[#2b2c32] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none w-full border border-white/10"
                          />

                          {/* Rendered Words Preview Chip */}
                          <div className="p-2.5 rounded-xl bg-[#1f2024] border border-white/5 flex items-center justify-between">
                            <span className="text-[11px] text-white/40 font-medium">Rendered Text:</span>
                            <div className="text-xs font-semibold">
                              {renderFormattedWords(
                                curText.content || "Empty",
                                curText.color || "#ffffff",
                                config.image_config?.canvas?.border_color || "#FF6B00"
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Base Text Color */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-semibold text-white/70">
                              Base Text Color
                            </label>
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={curText.color || "#FFFFFF"}
                                onChange={(e) => updateActiveText({ color: e.target.value })}
                                className="w-6 h-6 rounded cursor-pointer border-0 bg-transparent p-0"
                              />
                              <input
                                type="text"
                                value={curText.color || "#FFFFFF"}
                                onChange={(e) => updateActiveText({ color: e.target.value })}
                                className="w-24 bg-[#1f2024] rounded-lg px-2.5 py-1 text-xs text-white font-mono text-center focus:outline-none border border-white/10"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-wrap">
                            {DISCORD_COLOR_PRESETS.map((color) => (
                              <button
                                key={color}
                                type="button"
                                onClick={() => updateActiveText({ color })}
                                style={{ backgroundColor: color }}
                                className={cn(
                                  "w-6 h-6 rounded-full transition-transform hover:scale-110",
                                  curText.color?.toLowerCase() === color.toLowerCase() && "ring-2 ring-white scale-110"
                                )}
                                title={color}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Font Size & Bold */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1.5">
                              <span className="text-white/70 font-semibold">Font Size</span>
                              <span className="text-white font-mono bg-white/5 px-2 py-0.5 rounded">
                                {curText.font_size ?? 24}px
                              </span>
                            </div>
                            <input
                              type="range"
                              min={12}
                              max={72}
                              value={curText.font_size ?? 24}
                              onChange={(e) => updateActiveText({ font_size: parseInt(e.target.value, 10) || 24 })}
                              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#5865F2]"
                            />
                          </div>

                          <div className="flex items-center justify-between p-3 rounded-xl bg-[#2b2c32] border border-white/5">
                            <span className="text-xs text-white/70 font-semibold">Bold Text</span>
                            <Switch
                              checked={curText.is_bold !== false}
                              onCheckedChange={(checked) => updateActiveText({ is_bold: checked })}
                            />
                          </div>
                        </div>

                        {/* Text Position X & Y */}
                        <div className="space-y-3 p-4 rounded-xl bg-[#2b2c32]/50 border border-white/5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white uppercase tracking-wider">
                              Text Position
                            </span>
                            <button
                              type="button"
                              onClick={() => updateActiveText({ x: 510 })}
                              className="text-[11px] text-[#5865F2] hover:underline"
                            >
                              Center Horizontally (X: 510)
                            </button>
                          </div>

                          {/* X Position */}
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-white/60">Position X (Horizontal)</span>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min={0}
                                  max={1020}
                                  value={curText.x ?? 510}
                                  onChange={(e) => updateActiveText({ x: parseInt(e.target.value, 10) || 0 })}
                                  className="w-16 bg-[#1f2024] rounded px-2 py-0.5 text-xs text-white font-mono text-center focus:outline-none border border-white/10"
                                />
                                <button
                                  type="button"
                                  onClick={() => updateActiveText({ x: 510 })}
                                  className="text-[10px] bg-white/5 hover:bg-white/10 px-1.5 py-0.5 rounded text-white/70"
                                >
                                  Center
                                </button>
                              </div>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={1020}
                              value={curText.x ?? 510}
                              onChange={(e) => updateActiveText({ x: parseInt(e.target.value, 10) || 0 })}
                              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#5865F2]"
                            />
                          </div>

                          {/* Y Position */}
                          <div>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-white/60">Position Y (Vertical)</span>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min={0}
                                  max={450}
                                  value={curText.y ?? 290}
                                  onChange={(e) => updateActiveText({ y: parseInt(e.target.value, 10) || 0 })}
                                  className="w-16 bg-[#1f2024] rounded px-2 py-0.5 text-xs text-white font-mono text-center focus:outline-none border border-white/10"
                                />
                              </div>
                            </div>
                            <input
                              type="range"
                              min={0}
                              max={450}
                              value={curText.y ?? 290}
                              onChange={(e) => updateActiveText({ y: parseInt(e.target.value, 10) || 0 })}
                              className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#5865F2]"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Right Column: Sticky Live Canvas Preview */}
            <div className="xl:col-span-6 sticky top-4 space-y-3">
              <div className="bg-white/[0.03] rounded-2xl p-4 border border-white/10 shadow-lg">
                <WelcomePreviewCanvas
                  imageConfig={config.image_config}
                  serverName={serverName}
                  selectedElement={selectedCanvasElement}
                  onSelectElement={handleSelectCanvasElement}
                  onPositionChange={handlePositionChange}
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
