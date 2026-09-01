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
import { LeaveConfig, DiscordChannel } from "@/types/api";

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
      <div id="setup-step-1" className="flex flex-col gap-2">
        <div className="text-gray-300 text-sm font-bold tracking-wide uppercase">
          <span>Channel</span> <span className="text-red-400">*</span>
        </div>
        <p className="text-gray-300 text-sm">
          Select channel where leave messages are going to be sent.
        </p>

        <div className="w-full max-w-sm mt-1">
          <div className="kinput bg-kgray-800 ring-1 ring-white/10 hover:ring-white/20 rounded-lg flex items-center px-3 py-2 transition-all">
            <span className="text-white/40 mr-2 font-mono">#</span>
            <select
              value={config.channel_id || ""}
              onChange={(e) => setConfig({ ...config, channel_id: e.target.value })}
              className="bg-transparent text-white text-sm w-full focus:outline-none cursor-pointer appearance-none"
            >
              <option value="" disabled className="bg-kgray-800 text-white">Select a channel...</option>
              {channels.map((c) => (
                <option key={c.id} value={c.id.toString()} className="bg-kgray-800 text-white">
                  {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-white/40 shrink-0 pointer-events-none" />
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer select-none mt-2 w-fit">
          <input
            type="checkbox"
            checked={sendInDm}
            onChange={(e) => setSendInDm(e.target.checked)}
            className="w-4 h-4 rounded border-white/20 bg-kgray-800 text-white focus:ring-0 cursor-pointer"
          />
          <span className="text-gray-300 text-sm hover:text-white transition-colors">
            Send the message in user DMs
          </span>
        </label>
      </div>

      <div className="border-b border-white/10 my-6" />

      {/* ── STEP 2: MESSAGE CONFIGURATION & DISCORD LIVE PREVIEW ── */}
      <div id="setup-step-2" className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <div className="text-gray-300 text-sm font-bold tracking-wide uppercase">Message</div>
          <p className="text-gray-300 text-sm">Set the custom message that will be sent when a member leaves.</p>
        </div>

        {/* Tab & Utility Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
          {/* Pill Tabs */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMessageTab("message")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors",
                messageTab === "message"
                  ? "bg-kgray-800 text-white ring-1 ring-white/10"
                  : "bg-transparent text-white/50 hover:text-white"
              )}
            >
              Message &amp; Embeds
            </button>
            <button
              type="button"
              onClick={() => setMessageTab("components")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5",
                messageTab === "components"
                  ? "bg-kgray-800 text-white ring-1 ring-white/10"
                  : "bg-transparent text-white/50 hover:text-white"
              )}
            >
              <span>Components</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-sky-500/15 text-sky-300">
                New
              </span>
            </button>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowVariables(!showVariables)}
              className="dbtn dbtn-ghost dbtn-small flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white transition-colors border border-white/10"
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
                  leave_message: "Goodbye **{user_name}**, we will miss you!",
                  embed_data: {
                    title: "Member Left",
                    description: "**{user_name}** has left the server. We now have **{server_membercount}** members remaining.",
                    color: "#E74C3C",
                    thumbnail: "{user_avatar}",
                    timestamp_enabled: true
                  }
                });
                toast.success("Leave preset applied!");
              }}
              className="dbtn dbtn-ghost dbtn-small flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white transition-colors border border-white/10"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto Setup</span>
            </button>
          </div>
        </div>

        {/* Variables Reference Box */}
        {showVariables && (
          <div className="bg-kgray-800 border border-white/10 rounded-xl p-4 animate-in fade-in duration-150">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-2">Available Variables</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono text-white/70">
              <div className="p-2 rounded bg-white/[0.03] border border-white/5"><span className="text-white font-bold">{'{user.name}'}</span> — Plain Username</div>
              <div className="p-2 rounded bg-white/[0.03] border border-white/5"><span className="text-white font-bold">{'{server.name}'}</span> — Server Name</div>
              <div className="p-2 rounded bg-white/[0.03] border border-white/5"><span className="text-white font-bold">{'{server_membercount}'}</span> — Member Count</div>
              <div className="p-2 rounded bg-white/[0.03] border border-white/5"><span className="text-white font-bold">{'{user_avatar}'}</span> — User Avatar URL</div>
            </div>
          </div>
        )}

        {/* Side-by-Side Editor & Discord Live Preview */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* Left: Editor Column */}
          <div className="xl:col-span-7 space-y-4">
            {/* Raw Message Card */}
            <div className="bg-kgray-800 ring-1 ring-white/10 rounded-xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src="/utilities/avatar.png"
                  alt="Anya"
                  className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-white/10"
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
                  value={config.leave_message || ""}
                  onChange={(e) => setConfig({ ...config, leave_message: e.target.value })}
                  placeholder="Insert leave message (e.g. Goodbye {user_name}, we will miss you!)"
                  maxLength={2000}
                  className="ktextarea bg-kgray-850 ring-1 ring-white/10 rounded-lg p-3 text-sm text-white placeholder:text-white/30 focus:outline-none w-full min-h-[90px] resize-y"
                />
                <div className="maxLength text-right text-[11px] text-white/40 font-mono mt-1">
                  {(config.leave_message || "").length} / 2000
                </div>
              </div>

              {/* Embed Toggle */}
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
                className="bg-kgray-800 ring-1 ring-white/10 rounded-xl p-4 sm:p-5 space-y-4 relative"
                style={{ borderLeft: `4px solid ${config.embed_data?.color || "#E74C3C"}` }}
              >
                {/* Color swatches */}
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
                      className="w-24 bg-kgray-850 ring-1 ring-white/10 rounded px-2 py-0.5 text-xs text-white font-mono text-center focus:outline-none"
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
                    className="kinput bg-kgray-850 ring-1 ring-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none w-full mt-1"
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
                    className="ktextarea bg-kgray-850 ring-1 ring-white/10 rounded-lg p-3 text-xs text-white placeholder:text-white/30 focus:outline-none w-full mt-1 resize-y"
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
                      className="kinput bg-kgray-850 ring-1 ring-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none w-full mt-1"
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
                      className="kinput bg-kgray-850 ring-1 ring-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none w-full mt-1"
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
                        className="kinput bg-kgray-850 ring-1 ring-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none w-full mt-1"
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
                        className="kinput bg-kgray-850 ring-1 ring-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/30 focus:outline-none w-full mt-1"
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

          {/* Right: Sticky Live Discord Preview */}
          <div className="xl:col-span-5 sticky top-4 space-y-4">
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

      {/* ── FLOATING SAVE BAR (Exact Koya form#join) ── */}
      <div className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 z-50 transition-all duration-200">
        <div className="shadow-2xl rounded-xl py-2.5 px-4 select-none border border-white/10 bg-kgray-675 max-w-xl mx-auto sm:mx-0 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="font-medium text-sm text-gray-200">
              {hasChanges ? "You have unsaved changes! Save or reset them." : "All changes are saved."}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleReset}
                disabled={!hasChanges || saving}
                className="dbtn dbtn-ghost dbtn-small flex-1 sm:flex-none disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="dbtn dbtn-success dbtn-small flex-1 sm:flex-none flex items-center justify-center gap-1.5 disabled:opacity-50"
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
