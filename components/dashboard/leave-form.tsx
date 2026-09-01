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
  Save,
  MessageSquare,
  LayoutTemplate,
  RefreshCcw,
  Sparkles,
  Palette,
  Settings,
  Eye,
  Sliders,
  LogOut,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { LeaveConfig, DiscordChannel, LeaveEmbedData } from "@/types/api";
import { DiscordMessagePreview } from "./discord-message-preview";

interface LeaveFormProps {
  initialConfig: LeaveConfig;
  channels: DiscordChannel[];
  guildId: string;
  serverName?: string;
}

export function LeaveForm({ initialConfig, channels, guildId, serverName = "Vada SMP" }: LeaveFormProps) {
  const [config, setConfig] = useState<LeaveConfig>(() => {
    return {
      ...initialConfig,
      leave_type: initialConfig.leave_type || "embed",
      leave_message: initialConfig.leave_message || "<@{user_id}> left.",
      embed_data: initialConfig.embed_data || {
        description: "<@{user_id}> left.",
        color: "#7a22ff",
        timestamp_enabled: true
      }
    };
  });
  
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const promise = api.updateLeave(guildId, config);

    toast.promise(promise, {
      loading: 'Saving Leave Log configuration...',
      success: 'Leave settings saved successfully!',
      error: 'Failed to update leave settings',
    });

    try {
      await promise;
    } catch (err: any) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const channelOptions = channels.map(c => ({
    value: c.id.toString(),
    label: `#${c.name}`
  }));

  const typeOptions = [
    { value: "simple", label: "Simple Text Message" },
    { value: "embed", label: "Rich Embed Message" }
  ];

  const formatPreviewText = (text: string | null | undefined) => {
    if (!text) return "";
    
    // Simple placeholder formatting
    let formatted = text
      .replace(/{user_name}/g, "_basiii_")
      .replace(/{user_id}/g, "1229043630514114642")
      .replace(/{server_name}/g, serverName)
      .replace(/{server_membercount}/g, "124")
      .replace(/{user_avatar}/g, "https://cdn.discordapp.com/embed/avatars/0.png")
      .replace(/{server_icon}/g, "https://cdn.discordapp.com/embed/avatars/1.png");

    // Replace {user} or <@{user_id}> with standard Discord styled mention
    if (formatted.includes("{user}") || formatted.includes("<@{user_id}>")) {
      return (
        <span>
          {formatted.split(/{user}|<@{user_id}>/).map((part, index, array) => (
            <React.Fragment key={index}>
              {part}
              {index < array.length - 1 && (
                <span className="bg-[#5865F2]/30 hover:bg-[#5865F2]/50 text-[#dee0fc] hover:text-white px-1.5 py-0.5 rounded font-medium text-[13px] transition-colors cursor-pointer select-none">
                  @_basiii_
                </span>
              )}
            </React.Fragment>
          ))}
        </span>
      );
    }

    return <span>{formatted}</span>;
  };

  const getEmbedColor = () => {
    const hex = config.embed_data?.color || "#7a22ff";
    return hex.startsWith("#") ? hex : `#${hex}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-in fade-in duration-500">
      {/* Configuration Controls (Left) */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-[#141B2D]/80 backdrop-blur-md border border-slate-800/80 rounded-3xl shadow-2xl p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800/60 pb-4">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-lg">Leave Log Config</h3>
              <p className="text-xs text-slate-400">Configure how the bot logs members leaving your server.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-black uppercase text-slate-500 tracking-widest pl-1">Leave Log Channel</label>
                <Select 
                  value={config.channel_id || ""}
                  onValueChange={(val) => setConfig({ ...config, channel_id: val })}
                  options={channelOptions}
                  placeholder="Select log channel..."
                  className="mt-2"
                />
              </div>

              <div>
                <label className="text-xs font-black uppercase text-slate-500 tracking-widest pl-1">Response Type</label>
                <Select 
                  value={config.leave_type || "embed"}
                  onValueChange={(val) => setConfig({ ...config, leave_type: val })}
                  options={typeOptions}
                  className="mt-2"
                />
              </div>
            </div>

            {config.leave_type === "simple" ? (
              <div className="space-y-2">
                <label className="text-xs font-black uppercase text-slate-500 tracking-widest pl-1">Message Content</label>
                <textarea 
                  value={config.leave_message || ""}
                  onChange={(e) => setConfig({ ...config, leave_message: e.target.value })}
                  placeholder="{user} left the server."
                  className="w-full mt-2 bg-slate-950 border border-slate-800/80 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white min-h-[120px] transition-all"
                />
              </div>
            ) : (
              <div className="space-y-4 pt-4 border-t border-slate-800/40">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500 tracking-widest pl-1">Embed Title</label>
                    <input 
                      type="text"
                      value={config.embed_data?.title || ""}
                      onChange={(e) => setConfig({ 
                        ...config, 
                        embed_data: { ...(config.embed_data || {}), title: e.target.value }
                      })}
                      className="w-full mt-2 bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white transition-all"
                      placeholder="Member Left"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500 tracking-widest pl-1">Embed Color (Hex)</label>
                    <div className="relative mt-2">
                      <input 
                        type="text"
                        value={config.embed_data?.color || ""}
                        onChange={(e) => setConfig({ 
                          ...config, 
                          embed_data: { ...(config.embed_data || {}), color: e.target.value }
                        })}
                        className="w-full bg-slate-950 border border-slate-800/80 rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white transition-all font-mono"
                        placeholder="#7a22ff"
                      />
                      <div 
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-md border border-slate-800/80 shadow-md"
                        style={{ backgroundColor: getEmbedColor() }}
                      />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-black uppercase text-slate-500 tracking-widest pl-1">Embed Description</label>
                  <textarea 
                    value={config.embed_data?.description || ""}
                    onChange={(e) => setConfig({ 
                      ...config, 
                      embed_data: { ...(config.embed_data || {}), description: e.target.value }
                    })}
                    placeholder="We're sad to see you go, {user}!"
                    className="w-full mt-2 bg-slate-950 border border-slate-800/80 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white min-h-[100px] transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500 tracking-widest pl-1">Thumbnail URL</label>
                    <input 
                      type="text"
                      value={config.embed_data?.thumbnail || ""}
                      onChange={(e) => setConfig({ 
                        ...config, 
                        embed_data: { ...(config.embed_data || {}), thumbnail: e.target.value }
                      })}
                      className="w-full mt-2 bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white transition-all"
                      placeholder="{user_avatar} or https://..."
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500 tracking-widest pl-1">Image URL</label>
                    <input 
                      type="text"
                      value={config.embed_data?.image || ""}
                      onChange={(e) => setConfig({ 
                        ...config, 
                        embed_data: { ...(config.embed_data || {}), image: e.target.value }
                      })}
                      className="w-full mt-2 bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white transition-all"
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500 tracking-widest pl-1">Author Name</label>
                    <input 
                      type="text"
                      value={config.embed_data?.author_name || ""}
                      onChange={(e) => setConfig({ 
                        ...config, 
                        embed_data: { ...(config.embed_data || {}), author_name: e.target.value }
                      })}
                      className="w-full mt-2 bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white transition-all"
                      placeholder="{user_name}"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500 tracking-widest pl-1">Author Icon URL</label>
                    <input 
                      type="text"
                      value={config.embed_data?.author_icon || ""}
                      onChange={(e) => setConfig({ 
                        ...config, 
                        embed_data: { ...(config.embed_data || {}), author_icon: e.target.value }
                      })}
                      className="w-full mt-2 bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white transition-all"
                      placeholder="{user_avatar} or https://..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500 tracking-widest pl-1">Footer Text</label>
                    <input 
                      type="text"
                      value={config.embed_data?.footer_text || ""}
                      onChange={(e) => setConfig({ 
                        ...config, 
                        embed_data: { ...(config.embed_data || {}), footer_text: e.target.value }
                      })}
                      className="w-full mt-2 bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white transition-all"
                      placeholder="{server_name}"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-black uppercase text-slate-500 tracking-widest pl-1">Footer Icon URL</label>
                    <input 
                      type="text"
                      value={config.embed_data?.footer_icon || ""}
                      onChange={(e) => setConfig({ 
                        ...config, 
                        embed_data: { ...(config.embed_data || {}), footer_icon: e.target.value }
                      })}
                      className="w-full mt-2 bg-slate-950 border border-slate-800/80 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-white transition-all"
                      placeholder="{server_icon} or https://..."
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between bg-slate-950/40 border border-slate-800/60 p-4 rounded-2xl mt-4">
                  <div>
                    <span className="text-sm font-bold text-white">Enable Embed Timestamp</span>
                    <p className="text-xs text-slate-400 mt-1">Show the leave date/time in the embed footer.</p>
                  </div>
                  <Switch 
                    checked={config.embed_data?.timestamp_enabled !== false}
                    onCheckedChange={(val) => setConfig({ 
                      ...config, 
                      embed_data: { ...(config.embed_data || {}), timestamp_enabled: val }
                    })}
                  />
                </div>
              </div>
            )}
          </div>

          <Button 
            onClick={handleSave}
            disabled={saving}
            className="w-full h-14 text-base font-bold gap-2 rounded-2xl shadow-lg shadow-primary/20"
          >
            {saving ? <RefreshCcw className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            Save Configuration
          </Button>
        </div>
      </div>

      {/* Live Preview (Right) */}
      <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28 font-sans">
        <DiscordMessagePreview
          welcomeType={config.leave_type as "simple" | "embed"}
          messageContent={config.leave_message || ""}
          embedData={config.embed_data as any}
          cardEnabled={false}
          serverName={serverName}
        />
      </div>

        {/* Variables List Card */}
        <div className="bg-[#141B2D]/80 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 shadow-2xl space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
            <Info className="w-4 h-4 text-primary" />
            Placeholders Cheatsheet
          </h3>
          <div className="space-y-2 text-xs text-slate-400 font-mono bg-slate-950 p-4 rounded-2xl border border-white/5 shadow-inner">
            <p className="flex justify-between hover:text-white transition-colors"><span>{'{user}'}</span> <span className="text-slate-500">@MemberMention</span></p>
            <p className="flex justify-between hover:text-white transition-colors"><span>{'{user_name}'}</span> <span className="text-slate-500">Username</span></p>
            <p className="flex justify-between hover:text-white transition-colors"><span>{'{user_id}'}</span> <span className="text-slate-500">Member ID</span></p>
            <p className="flex justify-between hover:text-white transition-colors"><span>{'{server_name}'}</span> <span className="text-slate-500">Server Name</span></p>
            <p className="flex justify-between hover:text-white transition-colors"><span>{'{server_membercount}'}</span> <span className="text-slate-500">Member Count</span></p>
            <p className="flex justify-between hover:text-white transition-colors"><span>{'{user_avatar}'}</span> <span className="text-slate-500">Member Avatar URL</span></p>
            <p className="flex justify-between hover:text-white transition-colors"><span>{'{server_icon}'}</span> <span className="text-slate-500">Server Icon URL</span></p>
          </div>
          <p className="text-[10px] text-slate-500 italic text-center">Placeholders work in message content, title, description, footer, and author fields.</p>
        </div>

        {/* Template Defaults */}
        <div className="bg-[#141B2D]/80 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 shadow-2xl space-y-4">
          <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
            <LayoutTemplate className="w-4 h-4 text-primary" />
            Template Presets
          </h3>
          <Button 
            onClick={() => setConfig({
              ...config,
              leave_type: "embed",
              embed_data: {
                description: "<@{user_id}> left.",
                color: "#7a22ff",
                timestamp_enabled: true,
                author_name: "{user_name}",
                author_icon: "{user_avatar}",
                thumbnail: "{user_avatar}",
                footer_text: "{server_name}"
              }
            })} 
            variant="outline" 
            className="w-full border-primary/40 hover:bg-primary/10 text-primary transition-all rounded-xl h-12"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Apply Grand Nikko Preset
          </Button>
        </div>
      </div>
    </div>
  );
}
