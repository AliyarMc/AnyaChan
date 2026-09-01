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
  Send, 
  RotateCcw, 
  Variable, 
  Sparkles, 
  ChevronRight, 
  ChevronDown, 
  Check, 
  Plus, 
  Trash2, 
  Calendar
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

const DISCORD_COLOR_PRESETS = [
  "#2ECC71", "#3498DB", "#9B59B6", "#E91E63", "#F1C40F",
  "#E67E22", "#E74C3C", "#95A5A6", "#607D8B", "#FFFFFF"
];

interface LinkButton {
  label: string;
  url: string;
  emoji?: string;
}

export default function EmbedSenderPage({ params }: { params: { guildId: string } }) {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [channels, setChannels] = useState<any[]>([]);
  const [messageTab, setMessageTab] = useState<"message" | "components">("message");
  const [showVariables, setShowVariables] = useState(false);
  const [isEmbedEnabled, setIsEmbedEnabled] = useState(true);

  const initialFormState = {
    channel_id: "",
    message: "",
    title: "",
    description: "",
    color: "#5865F2",
    image_url: "",
    thumbnail_url: "",
    author_name: "",
    author_icon: "",
    footer_text: "",
    footer_icon: "",
    timestamp_enabled: true,
    buttons: [] as LinkButton[]
  };

  const [form, setForm] = useState(initialFormState);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        setLoading(true);
        const channelsData = await api.getChannels(params.guildId);
        setChannels(channelsData);
        if (channelsData.length > 0) {
          setForm((prev) => ({ ...prev, channel_id: channelsData[0].id.toString() }));
        }
      } catch (error) {
        console.error("Failed to fetch channels:", error);
        toast.error("Failed to load channel list");
      } finally {
        setLoading(false);
      }
    };
    fetchChannels();
  }, [params.guildId]);

  const updateField = (field: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddButton = () => {
    if (form.buttons.length >= 5) {
      toast.warning("You can attach a maximum of 5 link buttons.");
      return;
    }
    setForm((prev) => ({
      ...prev,
      buttons: [...prev.buttons, { label: "", url: "", emoji: "" }]
    }));
  };

  const handleRemoveButton = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      buttons: prev.buttons.filter((_, i) => i !== idx)
    }));
  };

  const handleUpdateButton = (idx: number, field: keyof LinkButton, val: string) => {
    setForm((prev) => {
      const copy = [...prev.buttons];
      copy[idx] = { ...copy[idx], [field]: val };
      return { ...prev, buttons: copy };
    });
  };

  const handleReset = () => {
    setForm({
      ...initialFormState,
      channel_id: form.channel_id
    });
    toast.info("Message builder reset");
  };

  const handleSend = async () => {
    if (!form.channel_id) {
      toast.error("Please select a target channel");
      return;
    }
    if (!form.message && !form.title && !form.description) {
      toast.error("You must enter either a message, an embed title, or an embed description");
      return;
    }

    try {
      setSending(true);
      const payload = {
        ...form,
        // If embed is turned off, clear embed fields so backend sends clean text message
        title: isEmbedEnabled ? form.title : "",
        description: isEmbedEnabled ? form.description : "",
      };
      await api.sendEmbed(params.guildId, payload);
      toast.success("Message successfully broadcasted to Discord!");
    } catch (error: any) {
      console.error("Failed to send message:", error);
      toast.error(error.message || "Failed to dispatch message");
    } finally {
      setSending(false);
    }
  };

  // Filter text channels
  const textChannels = channels.filter(
    (c) => c.type === 0 || c.type === "0" || c.type === 5 || c.type === "5" || c.type === 15 || c.type === "15"
  );
  const displayChannels = textChannels.length > 0 ? textChannels : channels;

  const hasChanges = form.message || form.title || form.description || form.buttons.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RotateCcw className="w-8 h-8 animate-spin text-white/50" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-200">
      {/* ── Breadcrumb Header matching Welcome & Leave ── */}
      <div className="flex items-center justify-between gap-4 pb-2 mb-6">
        <div className="flex items-center gap-2 text-2xl font-bold flex-wrap">
          <Link 
            href={`/dashboard/guild/${params.guildId}`}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Messaging
          </Link>
          <ChevronRight className="w-5 h-5 text-gray-500" />
          <span className="text-white">Message Builder</span>
        </div>
      </div>

      {/* ── STEP 1: CHANNEL SELECTION (Exact seamless style) ── */}
      <div id="setup-step-1" className="flex flex-col gap-2">
        <div className="text-gray-300 text-sm font-bold tracking-wide uppercase">
          <span>Channel</span> <span className="text-red-400">*</span>
        </div>
        <p className="text-white/50 text-sm">
          Select channel where this message will be broadcasted.
        </p>

        <div className="w-full max-w-sm mt-1">
          <div className="bg-[#2b2c32] hover:bg-[#323339] rounded-xl flex items-center px-3.5 py-2.5 transition-colors border border-white/10">
            <span className="text-white/40 mr-2 font-mono">#</span>
            <select
              value={form.channel_id || ""}
              onChange={(e) => updateField("channel_id", e.target.value)}
              className="bg-transparent text-white text-sm w-full focus:outline-none cursor-pointer appearance-none"
            >
              <option value="" disabled className="bg-[#2b2c32] text-white">Select a channel...</option>
              {displayChannels.map((c) => (
                <option key={c.id} value={c.id.toString()} className="bg-[#2b2c32] text-white">
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-white/40 shrink-0 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="h-px bg-white/5 my-6" />

      {/* ── STEP 2: MESSAGE CONFIGURATION & DISCORD LIVE PREVIEW ── */}
      <div id="setup-step-2" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="text-gray-300 text-sm font-bold tracking-wide uppercase">Message</div>
          <p className="text-white/50 text-sm">Design your rich embed or text announcement with action row link buttons.</p>
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
                {form.buttons.length > 0 ? form.buttons.length : "New"}
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
                setForm({
                  ...form,
                  message: "Attention @everyone! Check out our latest server update:",
                  title: "🚀 Important Community Announcement",
                  description: "We are thrilled to unveil new server features, roles, and automated moderation tools.\n\nClick the link buttons below to explore and leave your feedback!",
                  color: "#5865F2",
                  author_name: "Anya Broadcaster",
                  author_icon: "{server_icon}",
                  footer_text: "Anya Official Announcement",
                  footer_icon: "{server_icon}",
                  timestamp_enabled: true,
                  buttons: [
                    { label: "Community Guidelines", url: "https://discord.gg/zaptro", emoji: "📜" },
                    { label: "Official Website", url: "https://zaptro.org", emoji: "🌐" }
                  ]
                });
                setIsEmbedEnabled(true);
                toast.success("Announcement preset loaded!");
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
              <div className="p-2.5 rounded-xl bg-white/[0.03]"><span className="text-white font-bold">@everyone</span> — Ping Everyone</div>
              <div className="p-2.5 rounded-xl bg-white/[0.03]"><span className="text-white font-bold">@here</span> — Ping Online</div>
              <div className="p-2.5 rounded-xl bg-white/[0.03]"><span className="text-white font-bold">{'{server_icon}'}</span> — Server Icon URL</div>
              <div className="p-2.5 rounded-xl bg-white/[0.03]"><span className="text-white font-bold">{'{server_name}'}</span> — Server Name</div>
            </div>
          </div>
        )}

        {/* Side-by-Side Editor & Sticky Discord Live Preview */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* Left: Editor Column */}
          <div className="xl:col-span-7 space-y-4">
            {messageTab === "message" ? (
              <>
                {/* Raw Message Card */}
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
                      <time className="text-white/40 text-xs">Today at 12:00 PM</time>
                    </div>
                  </div>

                  <div className="relative">
                    <textarea
                      value={form.message}
                      onChange={(e) => updateField("message", e.target.value)}
                      placeholder="Insert outer message (e.g. @everyone Check out our new update!)"
                      maxLength={2000}
                      className="bg-[#2b2c32] rounded-xl p-3.5 text-sm text-white placeholder:text-white/30 focus:outline-none w-full min-h-[95px] resize-y"
                    />
                    <div className="text-right text-[11px] text-white/40 font-mono mt-1">
                      {form.message.length} / 2000
                    </div>
                  </div>

                  {/* Embed Toggle */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm font-medium text-white/80 select-none">
                      Send an embed with this message
                    </span>
                    <Switch
                      checked={isEmbedEnabled}
                      onCheckedChange={(checked) => setIsEmbedEnabled(checked)}
                    />
                  </div>
                </div>

                {/* Embed Configuration Card */}
                {isEmbedEnabled && (
                  <div
                    className="bg-white/[0.03] rounded-2xl p-5 space-y-4 relative border border-white/10"
                    style={{ borderLeft: `4px solid ${form.color || "#5865F2"}` }}
                  >
                    {/* Embed Color Swatches */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-white/50">
                          Embed Color
                        </label>
                        <input
                          type="text"
                          value={form.color}
                          onChange={(e) => updateField("color", e.target.value)}
                          className="w-24 bg-[#2b2c32] rounded-lg px-2.5 py-1 text-xs text-white font-mono text-center focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center gap-2.5 flex-wrap">
                        {DISCORD_COLOR_PRESETS.map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => updateField("color", c)}
                            style={{ backgroundColor: c }}
                            className={cn(
                              "w-6 h-6 rounded-full transition-transform hover:scale-110",
                              form.color?.toLowerCase() === c.toLowerCase() && "ring-2 ring-white scale-110"
                            )}
                            title={c}
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
                          value={form.author_name}
                          onChange={(e) => updateField("author_name", e.target.value)}
                          placeholder="Author text"
                          className="bg-[#2b2c32] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none w-full mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-white/50">Author Icon URL</label>
                        <input
                          type="text"
                          value={form.author_icon}
                          onChange={(e) => updateField("author_icon", e.target.value)}
                          placeholder="https://... or {server_icon}"
                          className="bg-[#2b2c32] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none w-full mt-1"
                        />
                      </div>
                    </div>

                    {/* Embed Title */}
                    <div>
                      <label className="text-xs font-medium text-white/50">Embed Title</label>
                      <input
                        type="text"
                        value={form.title}
                        onChange={(e) => updateField("title", e.target.value)}
                        placeholder="🎉 Mojo Launcher Download"
                        className="bg-[#2b2c32] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none w-full mt-1"
                      />
                    </div>

                    {/* Embed Description */}
                    <div>
                      <label className="text-xs font-medium text-white/50">Embed Description (Markdown supported)</label>
                      <textarea
                        value={form.description}
                        onChange={(e) => updateField("description", e.target.value)}
                        placeholder="Play Minecraft Java Edition on Android with support for multiple versions..."
                        rows={4}
                        className="bg-[#2b2c32] rounded-xl p-3.5 text-xs text-white placeholder:text-white/30 focus:outline-none w-full mt-1 resize-y"
                      />
                    </div>

                    {/* Thumbnail & Image */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-medium text-white/50">Thumbnail URL</label>
                        <input
                          type="text"
                          value={form.thumbnail_url}
                          onChange={(e) => updateField("thumbnail_url", e.target.value)}
                          placeholder="{server_icon} or https://..."
                          className="bg-[#2b2c32] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none w-full mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-white/50">Large Bottom Image URL</label>
                        <input
                          type="text"
                          value={form.image_url}
                          onChange={(e) => updateField("image_url", e.target.value)}
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
                            value={form.footer_text}
                            onChange={(e) => updateField("footer_text", e.target.value)}
                            placeholder="Footer announcement notes"
                            className="bg-[#2b2c32] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none w-full mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-white/50">Footer Icon URL</label>
                          <input
                            type="text"
                            value={form.footer_icon}
                            onChange={(e) => updateField("footer_icon", e.target.value)}
                            placeholder="https://..."
                            className="bg-[#2b2c32] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder:text-white/30 focus:outline-none w-full mt-1"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-white/70">Enable Embed Timestamp</span>
                        <Switch
                          checked={form.timestamp_enabled}
                          onCheckedChange={(val) => updateField("timestamp_enabled", val)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Components: Link Buttons Configurator */
              <div className="bg-white/[0.03] rounded-2xl p-5 space-y-4 animate-in fade-in duration-150 border border-white/10">
                <div className="flex items-center justify-between pb-1">
                  <div>
                    <h3 className="text-sm font-bold text-white">Action Row Link Buttons</h3>
                    <p className="text-xs text-white/50 mt-0.5">Attach up to 5 clickable Discord URL buttons below the message.</p>
                  </div>
                  <span className="text-xs font-mono text-white/40">{form.buttons.length}/5</span>
                </div>

                {form.buttons.map((btn, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row gap-3 items-end bg-white/5 p-4 rounded-xl">
                    <div className="flex-1 space-y-1 w-full">
                      <label className="text-xs font-medium text-white/50">Button Label</label>
                      <input
                        type="text"
                        placeholder="e.g. Download Now"
                        value={btn.label}
                        onChange={(e) => handleUpdateButton(idx, "label", e.target.value)}
                        className="bg-[#2b2c32] rounded-lg px-3 py-2 text-xs text-white focus:outline-none w-full"
                      />
                    </div>
                    <div className="flex-1 space-y-1 w-full">
                      <label className="text-xs font-medium text-white/50">Link URL</label>
                      <input
                        type="text"
                        placeholder="https://example.com"
                        value={btn.url}
                        onChange={(e) => handleUpdateButton(idx, "url", e.target.value)}
                        className="bg-[#2b2c32] rounded-lg px-3 py-2 text-xs text-white focus:outline-none w-full"
                      />
                    </div>
                    <div className="w-24 space-y-1">
                      <label className="text-xs font-medium text-white/50">Emoji</label>
                      <input
                        type="text"
                        placeholder="🔗"
                        value={btn.emoji || ""}
                        onChange={(e) => handleUpdateButton(idx, "emoji", e.target.value)}
                        className="bg-[#2b2c32] rounded-lg px-3 py-2 text-xs text-white focus:outline-none w-full text-center"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveButton(idx)}
                      className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors shrink-0"
                      title="Remove button"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                {form.buttons.length < 5 && (
                  <button
                    type="button"
                    onClick={handleAddButton}
                    className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Link Button ({form.buttons.length}/5)</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Right: Sticky Discord Live Preview */}
          <div className="xl:col-span-5 sticky top-4 space-y-4">
            <div className="bg-white/[0.03] rounded-2xl p-5 shadow-xl space-y-3 font-sans border border-white/10">
              <div className="flex items-center justify-between pb-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Preview</span>
                <span className="text-[10px] bg-white/5 px-2.5 py-0.5 rounded-full text-white/50 font-mono">
                  Discord Look
                </span>
              </div>

              {/* Discord Message Layout */}
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

                  {/* Bot Header */}
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="font-semibold text-white text-sm hover:underline cursor-pointer">
                      Anya
                    </span>
                    <span className="inline-flex items-center bg-[#5865f2] rounded text-[10px] font-bold uppercase px-1 text-white leading-tight">
                      APP
                    </span>
                    <time className="text-white/40 cursor-default text-xs">
                      Today at 12:00 PM
                    </time>
                  </div>

                  {/* Outer Content Message */}
                  {form.message && (
                    <div className="text-[#dcddde] text-sm leading-relaxed mt-1 break-words whitespace-pre-wrap">
                      {form.message.split(/(@\S+)/g).map((part, i) => {
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

                  {/* Embed Preview */}
                  {isEmbedEnabled && (form.title || form.description || form.image_url || form.thumbnail_url || form.footer_text || form.author_name) && (
                    <div
                      className="bg-[#2f3136] rounded border-l-4 p-3.5 mt-2 space-y-2.5 shadow-md max-w-[520px]"
                      style={{ borderLeftColor: form.color || "#5865F2" }}
                    >
                      {/* Author */}
                      {form.author_name && (
                        <div className="flex items-center gap-2">
                          {form.author_icon && (
                            <img
                              src={form.author_icon === "{server_icon}" ? "https://cdn.discordapp.com/embed/avatars/0.png" : form.author_icon}
                              alt=""
                              className="w-5 h-5 rounded-full object-cover shrink-0"
                              onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                            />
                          )}
                          <span className="text-xs font-semibold text-white">
                            {form.author_name}
                          </span>
                        </div>
                      )}

                      {/* Content & Thumbnail Grid */}
                      <div className="flex justify-between items-start gap-3">
                        <div className="space-y-1.5 flex-1 min-w-0">
                          {form.title && (
                            <div className="text-sm font-bold text-white leading-snug">
                              {form.title}
                            </div>
                          )}
                          {form.description && (
                            <div className="text-xs text-[#dcddde] leading-relaxed whitespace-pre-wrap">
                              {form.description}
                            </div>
                          )}
                        </div>

                        {form.thumbnail_url && (
                          <div className="w-16 h-16 rounded overflow-hidden bg-black/20 shrink-0">
                            <img
                              src={form.thumbnail_url === "{server_icon}" ? "https://cdn.discordapp.com/embed/avatars/0.png" : form.thumbnail_url}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Main Image */}
                      {form.image_url && (
                        <div className="rounded-lg overflow-hidden max-h-56 bg-black/20">
                          <img
                            src={form.image_url}
                            alt=""
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                          />
                        </div>
                      )}

                      {/* Footer & Timestamp */}
                      {(form.footer_text || form.timestamp_enabled) && (
                        <div className="flex items-center gap-1.5 pt-1 text-[11px] text-white/50">
                          {form.footer_icon && (
                            <img
                              src={form.footer_icon}
                              alt=""
                              className="w-4 h-4 rounded-full object-cover"
                              onError={(e) => { (e.target as HTMLElement).style.display = "none"; }}
                            />
                          )}
                          <span>{form.footer_text || "Anya"}</span>
                          {form.timestamp_enabled && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Today at 12:00 PM
                              </span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Row Link Buttons */}
                  {form.buttons && form.buttons.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {form.buttons.map((btn, idx) => {
                        if (!btn.label && !btn.emoji) return null;
                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#4e5058] hover:bg-[#6d6f78] text-[#dbdee1] text-xs font-medium select-none cursor-pointer transition-colors duration-150 shadow-sm"
                          >
                            {btn.emoji && <span>{btn.emoji}</span>}
                            <span>{btn.label || "Link Button"}</span>
                            <span className="text-white/40 text-[10px]">↗</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── FLOATING ACTION / BROADCAST BAR ── */}
      <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-8 z-50 transition-all duration-200">
        <div className="shadow-2xl rounded-2xl py-3 px-5 select-none bg-[#2b2c32] max-w-xl mx-auto sm:mx-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="font-medium text-sm text-gray-200">
              {hasChanges ? "Ready to broadcast message to Discord." : "Configure your message or embed above."}
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleReset}
                disabled={!hasChanges || sending}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-1 sm:flex-none"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={sending}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 flex-1 sm:flex-none disabled:opacity-50"
              >
                {sending ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Broadcast Message</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
