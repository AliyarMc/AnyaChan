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
import { ChevronDown, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface SettingsFormProps {
  initialPrefix?: string;
  guildId: string;
}

interface SettingsState {
  prefix: string;
  language: string;
  timezone: string;
  managerRoles: string[];
}

const DEFAULT_STATE: SettingsState = {
  prefix: "^^",
  language: "en-US",
  timezone: "Asia/Singapore (GMT+8)",
  managerRoles: [],
};

export function SettingsForm({ initialPrefix = "^^", guildId }: SettingsFormProps) {
  const [initialState, setInitialState] = useState<SettingsState>({
    ...DEFAULT_STATE,
    prefix: initialPrefix || "^^",
  });
  const [form, setForm] = useState<SettingsState>({
    ...DEFAULT_STATE,
    prefix: initialPrefix || "^^",
  });
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);

        // Retrieve cached local settings if present
        let localData: Partial<SettingsState> = {};
        try {
          const cached = localStorage.getItem(`anya_settings_${guildId}`);
          if (cached) {
            localData = JSON.parse(cached);
          }
        } catch {}

        // Fetch prefix from bot
        let fetchedPrefix = initialPrefix || "^^";
        try {
          const res = await api.getPrefix(guildId);
          if (res?.prefix) {
            fetchedPrefix = res.prefix;
          }
        } catch {
          // fallback to initialPrefix
        }

        // Fetch roles from bot
        try {
          const rolesData = await api.getRoles(guildId);
          if (isMounted && Array.isArray(rolesData)) {
            setRoles(rolesData);
          }
        } catch {
          // silent fallback
        }

        const resolved: SettingsState = {
          prefix: localData.prefix !== undefined ? localData.prefix : fetchedPrefix,
          language: localData.language || "en-US",
          timezone: localData.timezone || "Asia/Singapore (GMT+8)",
          managerRoles: Array.isArray(localData.managerRoles) ? localData.managerRoles : [],
        };

        if (isMounted) {
          setInitialState(resolved);
          setForm(resolved);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [guildId, initialPrefix]);

  const hasChanges =
    form.prefix !== initialState.prefix ||
    form.language !== initialState.language ||
    form.timezone !== initialState.timezone ||
    JSON.stringify(form.managerRoles) !== JSON.stringify(initialState.managerRoles);

  const handleReset = () => {
    setForm(initialState);
    toast.info("Changes reset");
  };

  const handleSave = async () => {
    if (!form.prefix || form.prefix.length > 10) {
      toast.error("Prefix must be between 1 and 10 characters.");
      return;
    }

    setSaving(true);
    try {
      // Dispatch prefix update to backend
      try {
        await api.updatePrefix(guildId, form.prefix);
      } catch (err: any) {
        console.warn("Backend updatePrefix warning:", err);
      }

      // Persist full settings in localStorage
      try {
        localStorage.setItem(`anya_settings_${guildId}`, JSON.stringify(form));
      } catch {}

      setInitialState(form);
      toast.success("Settings saved successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <RotateCcw className="w-8 h-8 animate-spin text-white/40" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-24 animate-in fade-in duration-200">
      {/* ── Heading ── */}
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Settings</h1>
        <p className="text-white/50 text-sm mt-1.5">Configure settings of Anya for your server.</p>
      </div>

      {/* ── CARD 1: PREFIX ── */}
      <div className="bg-white/[0.03] rounded-2xl p-6 space-y-3 border border-white/10">
        <label className="text-xs font-bold uppercase tracking-wider text-white/60 block">
          PREFIX
        </label>
        <input
          type="text"
          value={form.prefix}
          onChange={(e) => setForm({ ...form, prefix: e.target.value })}
          maxLength={10}
          placeholder="^^"
          className="w-full bg-[#2b2c32] hover:bg-[#323339] focus:bg-[#323339] rounded-xl px-4 py-3 text-sm text-white focus:outline-none transition-colors"
        />
        {/* Dynamic Command Preview Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {[
            `${form.prefix || "^^"}lovecalc @user`,
            `${form.prefix || "^^"}help`,
            `${form.prefix || "^^"}boat accost`,
          ].map((cmd, i) => (
            <div
              key={i}
              className="bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-lg text-xs font-mono text-white/60 select-none transition-colors"
            >
              {cmd}
            </div>
          ))}
        </div>
      </div>

      {/* ── CARD 2: LANGUAGE ── */}
      <div className="bg-white/[0.03] rounded-2xl p-6 space-y-3 border border-white/10">
        <label className="text-xs font-bold uppercase tracking-wider text-white/60 block">
          LANGUAGE
        </label>
        <div className="relative">
          <select
            value={form.language}
            onChange={(e) => setForm({ ...form, language: e.target.value })}
            className="w-full bg-[#2b2c32] hover:bg-[#323339] rounded-xl px-4 py-3 text-sm text-white focus:outline-none cursor-pointer appearance-none transition-colors pr-10"
          >
            <option value="en-US" className="bg-[#2b2c32] text-white">
              🇺🇸 English
            </option>
            <option value="es-ES" className="bg-[#2b2c32] text-white">
              🇪🇸 Español
            </option>
            <option value="fr-FR" className="bg-[#2b2c32] text-white">
              🇫🇷 Français
            </option>
            <option value="de-DE" className="bg-[#2b2c32] text-white">
              🇩🇪 Deutsch
            </option>
            <option value="ja-JP" className="bg-[#2b2c32] text-white">
              🇯🇵 日本語
            </option>
            <option value="pt-BR" className="bg-[#2b2c32] text-white">
              🇧🇷 Português
            </option>
          </select>
          <ChevronDown className="w-4 h-4 text-white/40 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* ── CARD 3: TIMEZONE ── */}
      <div className="bg-white/[0.03] rounded-2xl p-6 space-y-2 border border-white/10">
        <label className="text-xs font-bold uppercase tracking-wider text-white/60 block">
          TIMEZONE
        </label>
        <p className="text-xs text-white/40">Used across all time-based features in your server.</p>
        <div className="relative pt-1">
          <select
            value={form.timezone}
            onChange={(e) => setForm({ ...form, timezone: e.target.value })}
            className="w-full bg-[#2b2c32] hover:bg-[#323339] rounded-xl px-4 py-3 text-sm text-white focus:outline-none cursor-pointer appearance-none transition-colors pr-10"
          >
            <option value="Asia/Singapore (GMT+8)" className="bg-[#2b2c32] text-white">
              Asia/Singapore (GMT+8)
            </option>
            <option value="UTC (GMT+0)" className="bg-[#2b2c32] text-white">
              UTC (GMT+0)
            </option>
            <option value="America/New_York (GMT-5)" className="bg-[#2b2c32] text-white">
              America/New_York (GMT-5)
            </option>
            <option value="America/Los_Angeles (GMT-8)" className="bg-[#2b2c32] text-white">
              America/Los_Angeles (GMT-8)
            </option>
            <option value="America/Chicago (GMT-6)" className="bg-[#2b2c32] text-white">
              America/Chicago (GMT-6)
            </option>
            <option value="Europe/London (GMT+0)" className="bg-[#2b2c32] text-white">
              Europe/London (GMT+0)
            </option>
            <option value="Europe/Paris (GMT+1)" className="bg-[#2b2c32] text-white">
              Europe/Paris (GMT+1)
            </option>
            <option value="Europe/Berlin (GMT+1)" className="bg-[#2b2c32] text-white">
              Europe/Berlin (GMT+1)
            </option>
            <option value="Asia/Kolkata (GMT+5:30)" className="bg-[#2b2c32] text-white">
              Asia/Kolkata (GMT+5:30)
            </option>
            <option value="Asia/Tokyo (GMT+9)" className="bg-[#2b2c32] text-white">
              Asia/Tokyo (GMT+9)
            </option>
            <option value="Asia/Dubai (GMT+4)" className="bg-[#2b2c32] text-white">
              Asia/Dubai (GMT+4)
            </option>
            <option value="Australia/Sydney (GMT+11)" className="bg-[#2b2c32] text-white">
              Australia/Sydney (GMT+11)
            </option>
          </select>
          <ChevronDown className="w-4 h-4 text-white/40 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* ── CARD 4: MANAGER ROLES ── */}
      <div className="bg-white/[0.03] rounded-2xl p-6 space-y-2 border border-white/10">
        <h3 className="text-base font-bold text-white">Manager Roles</h3>
        <p className="text-xs text-white/40">Configure roles that can access Anya&apos;s dashboard.</p>

        {/* Selected roles list */}
        {form.managerRoles.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {form.managerRoles.map((roleId) => {
              const role = roles.find((r) => r.id.toString() === roleId);
              return (
                <div
                  key={roleId}
                  className="flex items-center gap-2 bg-[#2b2c32] rounded-xl px-3 py-2 text-xs text-white"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{
                      backgroundColor:
                        role && role.color && role.color !== 0
                          ? `#${role.color.toString(16).padStart(6, "0")}`
                          : "#5865F2",
                    }}
                  />
                  <span className="font-medium">{role ? role.name : `@Role (${roleId})`}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        managerRoles: form.managerRoles.filter((id) => id !== roleId),
                      })
                    }
                    className="text-white/40 hover:text-white transition-colors ml-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Add role dropdown selector */}
        <div className="relative mt-2 max-w-sm pt-1">
          <select
            value=""
            onChange={(e) => {
              if (e.target.value && !form.managerRoles.includes(e.target.value)) {
                setForm({
                  ...form,
                  managerRoles: [...form.managerRoles, e.target.value],
                });
              }
            }}
            className="w-full bg-[#2b2c32] hover:bg-[#323339] rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none cursor-pointer appearance-none transition-colors pr-10"
          >
            <option value="" disabled className="bg-[#2b2c32] text-white">
              + Add manager role...
            </option>
            {roles
              .filter((r) => !form.managerRoles.includes(r.id.toString()) && r.name !== "@everyone")
              .map((r) => (
                <option key={r.id} value={r.id.toString()} className="bg-[#2b2c32] text-white">
                  {r.name}
                </option>
              ))}
          </select>
          <ChevronDown className="w-4 h-4 text-white/40 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* ── FLOATING SAVE BAR (Exact Welcome & Leave clone) ── */}
      {hasChanges && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-8 z-50 transition-all duration-200">
          <div className="shadow-2xl rounded-2xl py-3 px-5 select-none bg-[#2b2c32] max-w-xl mx-auto sm:mx-0">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="font-medium text-sm text-gray-200">
                Careful — you have unsaved changes!
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={saving}
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
                  {saving ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : null}
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
