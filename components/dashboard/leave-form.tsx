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
import { DiscordMessagePreview } from "./discord-message-preview";
import { cn } from "@/lib/utils";
import { LeaveConfig, DiscordChannel, LeaveEmbedData } from "@/types/api";

const DISCORD_COLOR_PRESETS = [
  "#2ECC71", "#3498DB", "#9B59B6", "#E91E63", "#F1C40F",
  "#E67E22", "#E74C3C", "#95A5A6", "#607D8B", "#FFFFFF"
];

interface LeaveFormProps {
  initialConfig: LeaveConfig;
  channels: DiscordChannel[];
  guildId: string;
  serverName?: string;
}

export function LeaveForm({ initialConfig, channels, guildId, serverName = "Discord Server" }: LeaveFormProps) {
  const [config, setConfig] = useState<LeaveConfig>(() => ({
    ...initialConfig,
    leave_type: initialConfig.leave_type || "simple",
    embed_data: initialConfig.embed_data || {
      title: "Member Left",
      description: "{user_name} has left the server. We now have {server_membercount} members.",
      color: "#E74C3C",
      timestamp_enabled: true
    }
  }));

  const [initialState] = useState<LeaveConfig>(config);
  const [saving, setSaving] = useState(false);
  const [messageTab, setMessageTab] = useState<"message" | "components">("message");
  const [showVariables, setShowVariables] = useState(false);
  const [sendInDm, setSendInDm] = useState(false);

  const isEmbed = config.leave_type === "embed";
  const hasChanges = JSON.stringify(config) !== JSON.stringify(initialState);

  const handleSave = async () => {
    setSaving(true);
    const promise = api.updateLeave(guildId, config);

    toast.promise(promise, {
      loading: "Saving leave log configuration...",
      success: "Changes saved successfully!",
      error: "Failed to update leave settings",
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

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-200">
      {/* ── STEP 1: CHANNEL SELECTION ── */}
      <div id="setup-step-1" className="space-y-3">
        <div className="flex items-center gap-1">
          <span className="text-white/70 text-sm font-bold tracking-wide uppercase">
            Channel <span className="text-red-500">*</span>
          </span>
        </div>
        <p className="text-white/50 text-sm">
          Select channel where leave messages are going to be sent.
        </p>

        <div className="max-w-xl">
          <div className="relative">
            <select
              value={config.channel_id || ""}
              onChange={(e) => setConfig({ ...config, channel_id: e.target.value })}
              className="w-full appearance-none bg-[#2b2c32] border border-white/10 hover:border-white/20 focus:border-white/40 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors cursor-pointer"
            >
              <option value="" disabled>Select a channel...</option>
              {channels.map((c) => (
                <option key={c.id} value={c.id.toString()}>
                  # {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-white/40 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Send in user DMs Checkbox */}
        <label className="flex items-center gap-2.5 w-fit cursor-pointer select-none pt-1">
          <input
            type="checkbox"
            checked={sendInDm}
            onChange={(e) => setSendInDm(e.target.checked)}
            className="w-4 h-4 rounded border-white/20 bg-[#2b2c32] text-white focus:ring-0 cursor-pointer"
          />
          <span className="text-sm font-medium text-white/70 hover:text-white transition-colors">
            Send the message in user DMs
          </span>
        </label>
      </div>

      <div className="border-b border-white/10" />

      {/* ── STEP 2: MESSAGE CONFIGURATION & LIVE PREVIEW ── */}
      <div id="setup-step-2" className="space-y-4">
        <div>
          <h3 className="text-white/70 text-sm font-bold tracking-wide uppercase">Message</h3>
          <p className="text-white/50 text-sm mt-1">Set the custom message that will be sent when a member leaves.</p>
        </div>

        {/* Tab & Utility Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
          {/* Mode Switcher */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMessageTab("message")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border",
                messageTab === "message"
                  ? "bg-[#2b2c32] text-white border-white/20"
                  : "bg-transparent text-white/40 border-transparent hover:text-white"
              )}
            >
              Message &amp; Embeds
            </button>
            <button
              type="button"
              onClick={() => setMessageTab("components")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border flex items-center gap-1.5",
                messageTab === "components"
                  ? "bg-[#2b2c32] text-white border-white/20"
                  : "bg-transparent text-white/40 border-transparent hover:text-white"
              )}
            >
              <span>Components</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-white/10 text-white/80">
                New
              </span>
            </button>
          </div>

          {/* Action Tools (Variables, Auto Setup) */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowVariables(!showVariables)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2b2c32] border border-white/10 hover:border-white/20 text-xs font-medium text-white/70 hover:text-white transition-colors"
            >
              <Variable className="w-3.5 h-3.5" />
              <span>Variables</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setConfig({
                  ...config,
                  leave_type: "embed",
                  leave_message: "Goodbye {user_name}, we will miss you!",
                  embed_data: {
                    title: "Member Left",
                    description: "**{user_name}** has left the server. We now have **{server_membercount}** members remaining.",
                    color: "#E74C3C",
                    thumbnail: "{user_avatar}",
                    timestamp_enabled: true
                  }
                });
                toast.success("Leave message preset applied!");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2b2c32] border border-white/10 hover:border-white/20 text-xs font-medium text-white/70 hover:text-white transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto Setup</span>
            </button>
          </div>
        </div>

        {/* Variables Popover Info */}
        {showVariables && (
          <div className="bg-[#2b2c32] border border-white/10 rounded-xl p-4 animate-in fade-in duration-150">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Available Variables</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono text-white/70">
              <div className="p-2 rounded bg-white/[0.03] border border-white/5"><span className="text-white font-bold">{'{user}'}</span> — @Username</div>
              <div className="p-2 rounded bg-white/[0.03] border border-white/5"><span className="text-white font-bold">{'{user_name}'}</span> — Plain Username</div>
              <div className="p-2 rounded bg-white/[0.03] border border-white/5"><span className="text-white font-bold">{'{server_name}'}</span> — Server Name</div>
              <div className="p-2 rounded bg-white/[0.03] border border-white/5"><span className="text-white font-bold">{'{server_membercount}'}</span> — Member Count</div>
              <div className="p-2 rounded bg-white/[0.03] border border-white/5"><span className="text-white font-bold">{'{user_avatar}'}</span> — User Avatar URL</div>
              <div className="p-2 rounded bg-white/[0.03] border border-white/5"><span className="text-white font-bold">{'{server_icon}'}</span> — Server Icon URL</div>
            </div>
          </div>
        )}

        {/* Side-by-Side Editor & Live Preview (Koya Grid) */}
        <div className="grid grid-cols-1 2xl:grid-cols-12 gap-6 items-start">
          {/* Left Column: Editor */}
          <div className="2xl:col-span-7 space-y-4">
            {/* Raw Message Box (Anya Look) */}
            <div className="bg-[#2b2c32] border border-white/10 rounded-xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#5865F2] flex items-center justify-center font-bold text-white text-sm shrink-0">
                  A
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-semibold text-white text-sm">Anya</span>
                  <span className="bg-[#5865f2] text-[10px] font-bold uppercase px-1 text-white rounded">APP</span>
                  <span className="text-white/40 text-xs">Today at 11:53 AM</span>
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={config.leave_message || ""}
                  onChange={(e) => setConfig({ ...config, leave_message: e.target.value })}
                  placeholder="Content of the message (e.g. Goodbye {user_name}, we will miss you!)"
                  maxLength={2000}
                  className="w-full bg-[#202225] border border-white/10 rounded-lg p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 min-h-[90px] resize-y"
                />
                <div className="text-right text-[11px] text-white/40 font-mono mt-1">
                  {(config.leave_message || "").length} / 2000
                </div>
              </div>

              {/* Embed Toggle Switch */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-sm font-medium text-white/80 select-none">
                  Send an embed with this message
                </span>
                <Switch
                  checked={isEmbed}
                  onCheckedChange={(checked) =>
                    setConfig({ ...config, leave_type: checked ? "embed" : "simple" })
                  }
                />
              </div>
            </div>

            {/* Embed Configuration Card */}
            {isEmbed && (
              <div
                className="bg-[#2b2c32] border border-white/10 rounded-xl p-4 sm:p-5 space-y-4 relative"
                style={{ borderLeft: `4px solid ${config.embed_data?.color || "#E74C3C"}` }}
              >
                {/* Embed Color Row with circular swatches */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-white/50">
                      Embed Color
                    </label>
                    <input
                      type="text"
                      value={config.embed_data?.color || "#E74C3C"}
                      onChange={(e) =>
                        setConfig({
                          ...config,
                          embed_data: { ...(config.embed_data || {}), color: e.target.value }
                        })
                      }
                      className="w-24 bg-[#202225] border border-white/10 rounded px-2 py-0.5 text-xs text-white font-mono text-center focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {DISCORD_COLOR_PRESETS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() =>
                          setConfig({
                            ...config,
                            embed_data: { ...(config.embed_data || {}), color }
                          })
                        }
                        style={{ backgroundColor: color }}
                        className={cn(
                          "w-6 h-6 rounded-full border border-white/20 transition-transform hover:scale-110",
                          config.embed_data?.color?.toLowerCase() === color.toLowerCase() && "ring-2 ring-white scale-110"
                        )}
                        title={color}
                      />
                    ))}
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
                        embed_data: { ...(config.embed_data || {}), title: e.target.value }
                      })
                    }
                    placeholder="Member Left"
                    className="w-full mt-1 bg-[#202225] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none"
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
                        embed_data: { ...(config.embed_data || {}), description: e.target.value }
                      })
                    }
                    placeholder="{user_name} has left the server."
                    rows={3}
                    className="w-full mt-1 bg-[#202225] border border-white/10 rounded-lg p-3 text-xs text-white placeholder:text-white/30 focus:outline-none resize-y"
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
                          embed_data: { ...(config.embed_data || {}), thumbnail: e.target.value }
                        })
                      }
                      placeholder="{user_avatar} or https://..."
                      className="w-full mt-1 bg-[#202225] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none"
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
                          embed_data: { ...(config.embed_data || {}), image: e.target.value }
                        })
                      }
                      placeholder="https://..."
                      className="w-full mt-1 bg-[#202225] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Footer & Timestamp */}
                <div className="pt-2 border-t border-white/5 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-white/50">Footer Text</label>
                      <input
                        type="text"
                        value={config.embed_data?.footer_text || ""}
                        onChange={(e) =>
                          setConfig({
                            ...config,
                            embed_data: { ...(config.embed_data || {}), footer_text: e.target.value }
                          })
                        }
                        placeholder="Goodbye!"
                        className="w-full mt-1 bg-[#202225] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none"
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
                            embed_data: { ...(config.embed_data || {}), footer_icon: e.target.value }
                          })
                        }
                        placeholder="https://..."
                        className="w-full mt-1 bg-[#202225] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/70">Enable Embed Timestamp</span>
                    <Switch
                      checked={config.embed_data?.timestamp_enabled !== false}
                      onCheckedChange={(val) =>
                        setConfig({
                          ...config,
                          embed_data: { ...(config.embed_data || {}), timestamp_enabled: val }
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sticky Live Discord Preview */}
          <div className="2xl:col-span-5 sticky top-4 space-y-4">
            <DiscordMessagePreview
              welcomeType={config.leave_type as "simple" | "embed"}
              messageContent={config.leave_message || ""}
              embedData={config.embed_data}
              cardEnabled={false}
              serverName={serverName}
            />
          </div>
        </div>
      </div>

      {/* ── FLOATING STICKY SAVE BAR (Matching Koya form#join) ── */}
      <div className="sticky bottom-4 z-30 pt-4">
        <div className="bg-[#2b2c32] border border-white/15 rounded-xl p-3.5 px-5 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 backdrop-blur-md">
          <span className="text-sm font-medium text-white/80">
            {hasChanges ? "You have unsaved changes! Save or reset them." : "All changes are up to date."}
          </span>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleReset}
              disabled={!hasChanges || saving}
              className="flex-1 sm:flex-none px-4 py-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-white/70 hover:text-white text-xs font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 sm:flex-none px-5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {saving ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
