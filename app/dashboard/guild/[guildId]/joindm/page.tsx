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
import {
  Mail,
  RotateCcw,
  Sparkles,
  Code,
  Copy,
  Check,
  ChevronDown
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Switch } from "@/components/ui/switch";
import { DiscordMessagePreview } from "@/components/dashboard/discord-message-preview";
import { FloatingSaveBar } from "@/components/dashboard/floating-save-bar";
import { cn } from "@/lib/utils";

const VARIABLES = [
  { tag: "{user.mention}", desc: "@Username" },
  { tag: "{user.name}", desc: "Plain Username" },
  { tag: "{server.name}", desc: "Server Name" },
  { tag: "{server_membercount}", desc: "Member Count" },
  { tag: "{user_avatar}", desc: "User Avatar URL" },
  { tag: "{server_icon}", desc: "Server Icon URL" },
];

export default function JoinDMPage({ params }: { params: { guildId: string } }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedVar, setCopiedVar] = useState<string | null>(null);
  const [showVariables, setShowVariables] = useState(false);
  const [serverName, setServerName] = useState<string>("Discord Server");

  const [baseConfig, setBaseConfig] = useState<any>(null);
  const [config, setConfig] = useState<any>({
    enabled: false,
    message: "Hey {user.mention}, welcome to {server.name}! We're thrilled to have you here 🎉",
    embed_enabled: false,
    embed_data: {
      title: "Welcome to {server.name}!",
      description: "We are excited to welcome you! Check out our channels and enjoy your stay.",
      color: "#5865F2",
      image_url: "",
      thumbnail_url: "",
      author_name: "{server.name}",
      author_icon: "",
      footer_text: "You are member #{server_membercount}",
      footer_icon: "",
      timestamp_enabled: true
    }
  });

  const hasChanges = Boolean(baseConfig && JSON.stringify(config) !== JSON.stringify(baseConfig));

  const handleReset = () => {
    if (baseConfig) {
      setConfig(JSON.parse(JSON.stringify(baseConfig)));
      toast.info("Changes reverted");
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [configData, details] = await Promise.all([
        api.getJoinDM(params.guildId).catch(() => null),
        api.getGuildDetails(params.guildId).catch(() => null)
      ]);

      if (details?.name) {
        setServerName(details.name);
      }

      const initial = {
        enabled: configData?.enabled ?? false,
        message: configData?.message ?? "Hey {user.mention}, welcome to {server.name}! We're thrilled to have you here 🎉",
        embed_enabled: configData?.embed_enabled ?? false,
        embed_data: {
          title: configData?.embed_data?.title ?? "Welcome to {server.name}!",
          description: configData?.embed_data?.description ?? "We are excited to welcome you! Check out our channels and enjoy your stay.",
          color: configData?.embed_data?.color ?? "#5865F2",
          image_url: configData?.embed_data?.image_url ?? "",
          thumbnail_url: configData?.embed_data?.thumbnail_url ?? "",
          author_name: configData?.embed_data?.author_name ?? (details?.name || "Server"),
          author_icon: configData?.embed_data?.author_icon ?? "",
          footer_text: configData?.embed_data?.footer_text ?? "You are member #{server_membercount}",
          footer_icon: configData?.embed_data?.footer_icon ?? "",
          timestamp_enabled: configData?.embed_data?.timestamp_enabled ?? true
        }
      };

      setConfig(initial);
      setBaseConfig(JSON.parse(JSON.stringify(initial)));
    } catch (error) {
      console.error("Failed to fetch JoinDM data:", error);
      toast.error("Failed to load Join DM configuration");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [params.guildId]);

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.updateJoinDM(params.guildId, config);
      setBaseConfig(JSON.parse(JSON.stringify(config)));
      toast.success("Join DM configuration saved successfully");
    } catch (error) {
      console.error("Failed to save JoinDM config:", error);
      toast.error("Failed to save Join DM configuration");
    } finally {
      setSaving(false);
    }
  };

  const updateEmbedField = (field: string, value: any) => {
    setConfig((prev: any) => ({
      ...prev,
      embed_data: {
        ...prev.embed_data,
        [field]: value
      }
    }));
  };

  const copyVariable = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedVar(tag);
    toast.success(`Copied ${tag}`);
    setTimeout(() => setCopiedVar(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RotateCcw className="w-8 h-8 animate-spin text-white/50" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-20 animate-in fade-in duration-200">
      {/* ── HEADER (Matching Welcome & Leave) ── */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-white">Join DM</h1>
        <p className="text-white/50 text-sm">
          Send welcoming direct messages to users when they join your server.
        </p>
      </div>

      {/* ── STEP 1: MODULE STATUS ── */}
      <div className="bg-[#393a41] rounded-2xl p-5 flex items-center justify-between shadow-sm border border-white/10">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/80">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Direct Message Module</h2>
            <p className="text-white/50 text-xs mt-0.5">
              Automatically message new members in private direct messages as soon as they join.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn("text-xs font-semibold", config.enabled ? "text-emerald-400" : "text-white/40")}>
            {config.enabled ? "Enabled" : "Disabled"}
          </span>
          <Switch
            checked={config.enabled}
            onCheckedChange={(val) => setConfig({ ...config, enabled: val })}
          />
        </div>
      </div>

      {/* ── STEP 2: MESSAGE CONTENT & DISCORD LIVE PREVIEW ── */}
      <div className="space-y-4">
        {/* Subheader & Variable Row */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-bold text-white/40 uppercase tracking-wider">Message Content</h2>
            <p className="text-white/50 text-sm mt-0.5">Configure the text and rich embed format sent to members.</p>
          </div>

          <button
            type="button"
            onClick={() => setShowVariables(!showVariables)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <Code className="w-3.5 h-3.5" />
            <span>Variables</span>
            <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showVariables && "rotate-180")} />
          </button>
        </div>

        {/* Variables Drawer Popup */}
        {showVariables && (
          <div className="bg-[#393a41] border border-white/10 rounded-2xl p-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5 animate-in fade-in duration-150">
            {VARIABLES.map((v) => (
              <button
                key={v.tag}
                type="button"
                onClick={() => copyVariable(v.tag)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] text-left transition-colors group"
              >
                <div>
                  <span className="text-xs font-mono font-bold text-white group-hover:text-primary transition-colors">
                    {v.tag}
                  </span>
                  <p className="text-[11px] text-white/40">{v.desc}</p>
                </div>
                {copiedVar === v.tag ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-white/20 group-hover:text-white/60 shrink-0 transition-colors" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* 2-Column Responsive Layout: Left Controls, Right Preview */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* ── Left Column: Controls (col-span-6) ── */}
          <div className="xl:col-span-6 space-y-5">
            {/* Plain Text Content */}
            <div className="bg-[#393a41] rounded-2xl p-5 space-y-3 shadow-sm border border-white/10">
              <label className="text-xs font-bold text-white/70 block uppercase tracking-wider">
                Direct Message Text
              </label>
              <textarea
                value={config.message || ""}
                onChange={(e) => setConfig({ ...config, message: e.target.value })}
                placeholder="Hey {user.mention}, welcome to {server.name}!"
                rows={3}
                className="w-full rounded-xl bg-[#2b2c32] p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-white/20 resize-none"
              />
            </div>

            {/* Direct Embed Message Toggle */}
            <div className="bg-[#393a41] rounded-2xl p-5 flex items-center justify-between shadow-sm border border-white/10">
              <div className="space-y-0.5">
                <span className="text-sm font-bold text-white block">Direct Embed Message</span>
                <p className="text-white/50 text-xs">
                  Format direct messages inside a rich Discord Embed card with colors and images.
                </p>
              </div>
              <Switch
                checked={config.embed_enabled}
                onCheckedChange={(val) => setConfig({ ...config, embed_enabled: val })}
              />
            </div>

            {/* Rich Embed Fields (if embed_enabled) */}
            {config.embed_enabled && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Author Card */}
                <div className="bg-[#393a41] rounded-2xl p-5 space-y-3 shadow-sm border border-white/10">
                  <span className="text-xs font-bold text-white/70 uppercase tracking-wider block">Author</span>
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[11px] text-white/50 block mb-1">Author Name</label>
                      <input
                        type="text"
                        value={config.embed_data?.author_name || ""}
                        onChange={(e) => updateEmbedField("author_name", e.target.value)}
                        placeholder="{server.name}"
                        className="w-full rounded-xl bg-[#2b2c32] px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-white/50 block mb-1">Author Icon URL</label>
                      <input
                        type="text"
                        value={config.embed_data?.author_icon || ""}
                        onChange={(e) => updateEmbedField("author_icon", e.target.value)}
                        placeholder="https://..."
                        className="w-full rounded-xl bg-[#2b2c32] px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Body Card */}
                <div className="bg-[#393a41] rounded-2xl p-5 space-y-3 shadow-sm border border-white/10">
                  <span className="text-xs font-bold text-white/70 uppercase tracking-wider block">Body</span>
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[11px] text-white/50 block mb-1">Embed Title</label>
                      <input
                        type="text"
                        value={config.embed_data?.title || ""}
                        onChange={(e) => updateEmbedField("title", e.target.value)}
                        placeholder="Welcome to {server.name}!"
                        className="w-full rounded-xl bg-[#2b2c32] px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-white/50 block mb-1">Embed Description</label>
                      <textarea
                        value={config.embed_data?.description || ""}
                        onChange={(e) => updateEmbedField("description", e.target.value)}
                        placeholder="We are excited to welcome you! Check out our rules..."
                        rows={4}
                        className="w-full rounded-xl bg-[#2b2c32] p-3 text-sm text-white placeholder:text-white/30 focus:outline-none resize-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] text-white/50 block mb-1">Embed Color</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={config.embed_data?.color || "#5865F2"}
                          onChange={(e) => updateEmbedField("color", e.target.value)}
                          className="w-10 h-10 rounded-xl bg-transparent border-0 cursor-pointer p-0 shrink-0"
                        />
                        <input
                          type="text"
                          value={config.embed_data?.color || "#5865F2"}
                          onChange={(e) => updateEmbedField("color", e.target.value)}
                          className="w-full rounded-xl bg-[#2b2c32] px-3.5 py-2.5 text-sm font-mono text-white focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Images Card */}
                <div className="bg-[#393a41] rounded-2xl p-5 space-y-3 shadow-sm border border-white/10">
                  <span className="text-xs font-bold text-white/70 uppercase tracking-wider block">Images</span>
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[11px] text-white/50 block mb-1">Thumbnail URL</label>
                      <input
                        type="text"
                        value={config.embed_data?.thumbnail_url || ""}
                        onChange={(e) => updateEmbedField("thumbnail_url", e.target.value)}
                        placeholder="https://..."
                        className="w-full rounded-xl bg-[#2b2c32] px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-white/50 block mb-1">Large Image URL</label>
                      <input
                        type="text"
                        value={config.embed_data?.image_url || ""}
                        onChange={(e) => updateEmbedField("image_url", e.target.value)}
                        placeholder="https://..."
                        className="w-full rounded-xl bg-[#2b2c32] px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Footer Card */}
                <div className="bg-[#393a41] rounded-2xl p-5 space-y-3 shadow-sm border border-white/10">
                  <span className="text-xs font-bold text-white/70 uppercase tracking-wider block">Footer</span>
                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[11px] text-white/50 block mb-1">Footer Text</label>
                      <input
                        type="text"
                        value={config.embed_data?.footer_text || ""}
                        onChange={(e) => updateEmbedField("footer_text", e.target.value)}
                        placeholder="You are member #{server_membercount}"
                        className="w-full rounded-xl bg-[#2b2c32] px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-white/50 block mb-1">Footer Icon URL</label>
                      <input
                        type="text"
                        value={config.embed_data?.footer_icon || ""}
                        onChange={(e) => updateEmbedField("footer_icon", e.target.value)}
                        placeholder="https://..."
                        className="w-full rounded-xl bg-[#2b2c32] px-3.5 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-xs text-white/70">Show Timestamp</span>
                      <Switch
                        checked={config.embed_data?.timestamp_enabled ?? true}
                        onCheckedChange={(val) => updateEmbedField("timestamp_enabled", val)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Right Column: Sticky Live Discord Preview (col-span-6) ── */}
          <div className="xl:col-span-6 sticky top-4 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-white/40 uppercase tracking-wider">Discord DM Preview</span>
              <span className="text-[11px] text-white/40">Direct Message</span>
            </div>

            <div className="bg-[#393a41] rounded-2xl p-5 shadow-lg border border-white/5">
              <DiscordMessagePreview
                welcomeType={config.embed_enabled ? "embed" : "simple"}
                messageContent={config.message || ""}
                embedData={{
                  title: config.embed_data?.title,
                  description: config.embed_data?.description,
                  color: config.embed_data?.color,
                  image: config.embed_data?.image_url,
                  thumbnail: config.embed_data?.thumbnail_url,
                  author_name: config.embed_data?.author_name,
                  author_icon: config.embed_data?.author_icon,
                  footer_text: config.embed_data?.footer_text,
                  footer_icon: config.embed_data?.footer_icon,
                  timestamp_enabled: config.embed_data?.timestamp_enabled ?? true
                }}
                serverName={serverName}
                userName="NewMember"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── FLOATING SAVE BAR ── */}
      <FloatingSaveBar
        show={hasChanges}
        saving={saving}
        onReset={handleReset}
        onSave={handleSave}
      />
    </div>
  );
}
