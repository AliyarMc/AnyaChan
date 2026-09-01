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
import { MessageSquare, Save, RefreshCcw, Send, Settings, Palette } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DiscordMessagePreview } from "@/components/dashboard/discord-message-preview";
import { FloatingSaveBar } from "@/components/dashboard/floating-save-bar";

export default function JoinDMPage({ params }: { params: { guildId: string } }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [baseConfig, setBaseConfig] = useState<any>(null);
  const [config, setConfig] = useState<any>({
    enabled: false,
    message: "",
    embed_enabled: false,
    embed_data: {
      title: "",
      description: "",
      color: "#FF6B00",
      image_url: "",
      thumbnail_url: "",
      footer_text: ""
    }
  });

  const hasChanges = Boolean(baseConfig && JSON.stringify(config) !== JSON.stringify(baseConfig));

  const handleReset = () => {
    if (baseConfig) setConfig(baseConfig);
    toast.info("Changes reverted");
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const configData = await api.getJoinDM(params.guildId);
      const initial = {
        enabled: configData.enabled ?? false,
        message: configData.message ?? "",
        embed_enabled: configData.embed_enabled ?? false,
        embed_data: configData.embed_data || {
          title: "",
          description: "",
          color: "#FF6B00",
          image_url: "",
          thumbnail_url: "",
          footer_text: ""
        }
      };
      setConfig(initial);
      setBaseConfig(initial);
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
      setBaseConfig(config);
      toast.success("Join DM configuration saved successfully");
    } catch (error) {
      console.error("Failed to save JoinDM config:", error);
      toast.error("Failed to save Join DM configuration");
    } finally {
      setSaving(false);
    }
  };

  const updateEmbedField = (field: string, value: string) => {
    setConfig((prev: any) => ({
      ...prev,
      embed_data: {
        ...prev.embed_data,
        [field]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCcw className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Join DM</h2>
          <p className="text-slate-400">
            Send a private message or embed to new members when they join your server.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#1e293b]/50  rounded-2xl px-4 py-2">
          <span className="text-sm font-semibold text-slate-200">Module Status</span>
          <Switch 
            checked={config.enabled}
            onCheckedChange={(val) => setConfig({ ...config, enabled: val })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <Card className="border-primary/20 bg-background/50 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center justify-between border-b border-white/5/80 pb-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <div>
                    <CardTitle>Welcome Content</CardTitle>
                    <CardDescription>Welcome text and general direct message settings.</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="flex items-center justify-between bg-white/[0.03]/30 /60 p-4 rounded-2xl">
                <div>
                  <span className="text-sm font-bold text-white">Enable Direct Embed Message</span>
                  <p className="text-xs text-slate-500 mt-1">Check this to format direct messages inside a rich Discord Embed instead of plain text.</p>
                </div>
                <Switch 
                  checked={config.embed_enabled}
                  onCheckedChange={(val) => setConfig({ ...config, embed_enabled: val })}
                />
              </div>

              <div className="space-y-2 pt-2">
                <Label>Text Message Content</Label>
                <Textarea
                  placeholder="Welcome to the server! Make sure to read the rules..."
                  className="min-h-[140px] bg-[#131926] "
                  value={config.message || ""}
                  onChange={(e) => setConfig({ ...config, message: e.target.value })}
                />
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                  Tip: Supports placeholder variables: <code>{`{user_name}`}</code>, <code>{`{user_mention}`}</code>, and <code>{`{server_name}`}</code>.
                </p>
              </div>
            </CardContent>
          </Card>

          {config.embed_enabled && (
            <Card className="border-primary/20 bg-background/50 backdrop-blur-xl animate-in fade-in duration-300">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  <CardTitle>Welcome Embed Fields</CardTitle>
                </div>
                <CardDescription>Design the embed cards received by joining players.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Embed Title</Label>
                    <input 
                      type="text" 
                      placeholder="Welcome to {server_name}!"
                      className="w-full bg-[#131926]  rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                      value={config.embed_data?.title || ""}
                      onChange={(e) => updateEmbedField("title", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Embed Color</Label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="color" 
                        value={config.embed_data?.color || "#FF6B00"}
                        onChange={(e) => updateEmbedField("color", e.target.value)}
                        className="bg-transparent border-0 w-8 h-8 rounded cursor-pointer p-0"
                      />
                      <input 
                        type="text" 
                        placeholder="#FF6B00"
                        className="flex-1 bg-[#131926]  rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
                        value={config.embed_data?.color || ""}
                        onChange={(e) => updateEmbedField("color", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Embed Description (Supports Markdown / Bold / Italics)</Label>
                  <Textarea
                    placeholder="Enter welcome card descriptions... Use **bold** or *italics* formats."
                    className="min-h-[140px] bg-[#131926] "
                    value={config.embed_data?.description || ""}
                    onChange={(e) => updateEmbedField("description", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Large Image URL</Label>
                    <input 
                      type="text" 
                      placeholder="https://example.com/banner.png"
                      className="w-full bg-[#131926]  rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                      value={config.embed_data?.image_url || ""}
                      onChange={(e) => updateEmbedField("image_url", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Small Thumbnail URL</Label>
                    <input 
                      type="text" 
                      placeholder="https://example.com/icon.png"
                      className="w-full bg-[#131926]  rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                      value={config.embed_data?.thumbnail_url || ""}
                      onChange={(e) => updateEmbedField("thumbnail_url", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Footer Text</Label>
                  <input 
                    type="text" 
                    placeholder="{server_name} • Direct Message"
                    className="w-full bg-[#131926]  rounded-xl px-3 py-2 text-sm text-white focus:outline-none"
                    value={config.embed_data?.footer_text || ""}
                    onChange={(e) => updateEmbedField("footer_text", e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Live Mock Embed Preview */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-4 font-sans">
          <DiscordMessagePreview
            welcomeType={config.embed_enabled ? "embed" : "simple"}
            messageContent={config.message || ""}
            embedData={{
              title: config.embed_data?.title,
              description: config.embed_data?.description,
              color: config.embed_data?.color,
              image: config.embed_data?.image_url,
              thumbnail: config.embed_data?.thumbnail_url,
              footer_text: config.embed_data?.footer_text
            }}
            cardEnabled={false}
          />
        </div>
      </div>

      <FloatingSaveBar
        show={hasChanges}
        saving={saving}
        onReset={handleReset}
        onSave={handleSave}
      />
    </div>
  );
}
